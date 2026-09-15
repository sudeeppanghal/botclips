import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SmmPanelClient } from "@/lib/delivery/panel-client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const queryKey = request.nextUrl.searchParams.get("key") || new URL(request.url).searchParams.get("key");
    const authHeader = request.headers.get("authorization");
    const knownSecrets = [
      process.env.CRON_SECRET,
      "dhillion_cron_secret_abc123",
    ].filter(Boolean);

    const userAgent = (request.headers.get("user-agent") || "").toLowerCase();
    const isVercelCron = request.headers.get("x-vercel-cron") === "1" || userAgent.includes("vercel-cron");
    const isCronOrg = userAgent.includes("cron-job.org") || userAgent.includes("cron-job");
    const matchesSecret = knownSecrets.some(sec => queryKey === sec || authHeader === `Bearer ${sec}`);

    const isAuthorized = isVercelCron || isCronOrg || matchesSecret;

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized. Valid cron secret required." }, { status: 401 });
    }

    // 1. Auto-expire expired Mode 2 BYO-API plans
    const now = new Date();
    const expiredUsers = await prisma.user.updateMany({
      where: {
        planActive: true,
        planExpiresAt: { lt: now },
      },
      data: {
        planActive: false,
        automationMode: "MANAGED",
      },
    });

    // 2. Fetch pending / active orders that need status updates
    const activeOrders = await prisma.order.findMany({
      where: {
        status: { in: ["PENDING", "PROCESSING", "IN_PROGRESS"] },
        providerOrderId: { not: null },
      },
      include: { 
        panel: true,
        user: {
          select: { id: true, customApiUrl: true, customApiKey: true, automationMode: true, planActive: true }
        }
      },
      take: 100,
    });

    let updatedOrdersCount = 0;

    for (const order of activeOrders) {
      if (!order.providerOrderId) continue;

      let apiUrl: string | null = null;
      let apiKey: string | null = null;

      // Determine whether this order was routed via User's Custom API or Platform's Panel
      if (order.user?.automationMode === "CUSTOM_API" && order.user?.planActive && order.user?.customApiUrl && order.user?.customApiKey) {
        apiUrl = order.user.customApiUrl;
        apiKey = order.user.customApiKey;
      } else if (order.panel?.apiUrl && order.panel?.apiKeyEncrypted) {
        apiUrl = order.panel.apiUrl;
        apiKey = order.panel.apiKeyEncrypted;
      }

      if (!apiUrl || !apiKey) continue;

      try {
        const client = new SmmPanelClient(apiUrl, apiKey);
        const statusRes = await client.getOrderStatus(order.providerOrderId);

        if (statusRes && statusRes.status) {
          const upstream = statusRes.status.toLowerCase();
          let newStatus = order.status;

          if (upstream === "completed") {
            newStatus = "COMPLETED";
          } else if (upstream === "in progress" || upstream === "processing") {
            newStatus = "IN_PROGRESS";
          } else if (upstream === "partial") {
            newStatus = "PARTIAL";
            // Auto-refund remaining unfulfilled balance if order was charged
            if (order.charge > 0 && order.quantity > 0 && statusRes.remains && Number(statusRes.remains) > 0 && order.userId) {
              const refundAmount = Number(((Number(statusRes.remains) / order.quantity) * order.charge).toFixed(4));
              if (refundAmount > 0) {
                try {
                  await prisma.user.update({
                    where: { id: order.userId },
                    data: {
                      balance: { increment: refundAmount },
                      totalSpent: { decrement: refundAmount },
                    },
                  });
                } catch (refErr) {
                  console.error(`Refund error for partial order #${order.id}:`, refErr);
                }
              }
            }
          } else if (upstream === "canceled" || upstream === "cancelled" || upstream === "refunded") {
            newStatus = "CANCELLED";
            // Auto-refund 100% of the charged balance to user
            if (order.charge > 0 && order.userId) {
              try {
                await prisma.user.update({
                  where: { id: order.userId },
                  data: {
                    balance: { increment: order.charge },
                    totalSpent: { decrement: order.charge },
                  },
                });
              } catch (refErr) {
                console.error(`Refund error for cancelled order #${order.id}:`, refErr);
              }
            }
          }

          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: newStatus,
              startCount: statusRes.start_count ? Number(statusRes.start_count) : order.startCount,
              remains: statusRes.remains ? Number(statusRes.remains) : order.remains,
            },
          });
          updatedOrdersCount++;
        }
      } catch (orderErr) {
        console.error(`Failed to sync order #${order.id}:`, orderErr);
      }
    }

    // 3. Process Scheduled Jitter Pulses across all active orders
    let jitterBatchesFired = 0;
    try {
      const jitterOrders = await prisma.order.findMany({
        where: {
          status: { in: ["IN_PROGRESS", "PROCESSING"] },
          comboData: { contains: '"isJitterEngine":true' }
        },
        include: { panel: true },
        take: 50,
      });

      const nowTime = new Date().getTime();

      for (const jOrder of jitterOrders) {
        if (!jOrder.comboData) continue;
        try {
          const data = JSON.parse(jOrder.comboData);
          if (!data.batches || !Array.isArray(data.batches)) continue;

          // Find the next pending batch whose scheduledAt <= now
          const dueBatchIndex = data.batches.findIndex(
            (b: any) => b.status === "PENDING" && b.scheduledAt && new Date(b.scheduledAt).getTime() <= nowTime
          );

          if (dueBatchIndex !== -1) {
            const batch = data.batches[dueBatchIndex];
            const targetPanel = jOrder.panel || (await prisma.panel.findFirst({ where: { isActive: true } }));

            if (targetPanel && targetPanel.apiUrl && targetPanel.apiKeyEncrypted && targetPanel.apiKeyEncrypted !== "PLACEHOLDER_KEY") {
              const client = new SmmPanelClient(targetPanel.apiUrl, targetPanel.apiKeyEncrypted);
              const result = await client.addOrder({
                serviceId: data.upstreamServiceId || "5245",
                link: jOrder.link,
                quantity: batch.views || batch.quantity,
              });

              if (result && result.order) {
                batch.status = "DISPATCHED";
                batch.upstreamOrderId = String(result.order);
                batch.dispatchedAt = new Date().toISOString();
                data.lastDispatchedBatch = batch.batchNumber;
                jitterBatchesFired++;

                const allDone = data.batches.every((b: any) => b.status === "DISPATCHED" || b.status === "COMPLETED");
                if (allDone) {
                  data.allBatchesDispatched = true;
                }

                await prisma.order.update({
                  where: { id: jOrder.id },
                  data: {
                    comboData: JSON.stringify(data),
                    providerOrderId: String(result.order),
                  },
                });
              }
            }
          }
        } catch (err) {
          console.error(`Error processing jitter pulse for order #${jOrder.id}:`, err);
        }
      }
    } catch (jitterErr) {
      console.error("Jitter engine execution error:", jitterErr);
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ordersSynced: updatedOrdersCount,
      jitterBatchesFired,
      activeOrdersChecked: activeOrders.length,
      expiredPlansReset: expiredUsers.count,
      message: "Cron auto-sync completed successfully.",
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Cron sync failed" }, { status: 500 });
  }
}
