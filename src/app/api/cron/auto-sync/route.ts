import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SmmPanelClient } from "@/lib/delivery/panel-client";

export const dynamic = "force-dynamic";

// Free-tier execution protection: strictly terminate before Vercel's 10-second timeout ceiling
const MAX_EXECUTION_TIME_MS = 7200;

// Helper: Run items in concurrent micro-batches to maximize throughput while avoiding socket saturation
async function runInBatches<T>(
  items: T[],
  batchSize: number,
  fn: (item: T) => Promise<void>,
  deadlineCheck: () => boolean
) {
  for (let i = 0; i < items.length; i += batchSize) {
    if (deadlineCheck()) {
      break;
    }
    const chunk = items.slice(i, i + batchSize);
    await Promise.allSettled(chunk.map((item) => fn(item)));
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const isBudgetExhausted = () => Date.now() - startTime >= MAX_EXECUTION_TIME_MS;

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
    // Prioritized by oldest updatedAt first (round-robin fair scheduling)
    const activeOrders = await prisma.order.findMany({
      where: {
        status: { in: ["PENDING", "PROCESSING", "IN_PROGRESS"] },
        providerOrderId: { not: null },
      },
      select: {
        id: true,
        status: true,
        providerOrderId: true,
        charge: true,
        quantity: true,
        userId: true,
        startCount: true,
        remains: true,
        panel: {
          select: {
            apiUrl: true,
            apiKeyEncrypted: true,
          },
        },
        user: {
          select: {
            id: true,
            customApiUrl: true,
            customApiKey: true,
            automationMode: true,
            planActive: true,
          },
        },
      },
      orderBy: { updatedAt: "asc" },
      take: 15,
    });

    let updatedOrdersCount = 0;

    // Process status updates concurrently in chunks of 5
    await runInBatches(
      activeOrders,
      5,
      async (order) => {
        if (!order.providerOrderId) return;

        let apiUrl: string | null = null;
        let apiKey: string | null = null;

        if (order.user?.automationMode === "CUSTOM_API" && order.user?.planActive && order.user?.customApiUrl && order.user?.customApiKey) {
          apiUrl = order.user.customApiUrl;
          apiKey = order.user.customApiKey;
        } else if (order.panel?.apiUrl && order.panel?.apiKeyEncrypted) {
          apiUrl = order.panel.apiUrl;
          apiKey = order.panel.apiKeyEncrypted;
        }

        if (!apiUrl || !apiKey) return;

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
      },
      isBudgetExhausted
    );

    // 3. Process Scheduled Jitter Pulses across active orders
    let jitterBatchesFired = 0;
    if (!isBudgetExhausted()) {
      try {
        const jitterOrders = await prisma.order.findMany({
          where: {
            status: { in: ["IN_PROGRESS", "PROCESSING"] },
            comboData: { contains: '"isJitterEngine":true' },
          },
          select: {
            id: true,
            link: true,
            comboData: true,
            panel: {
              select: {
                id: true,
                apiUrl: true,
                apiKeyEncrypted: true,
              },
            },
          },
          orderBy: { updatedAt: "asc" },
          take: 10,
        });

        const nowTime = Date.now();
        // Identify orders with an immediate pending batch due for dispatch
        const dueOrders: Array<{ order: typeof jitterOrders[0]; batchIndex: number; data: any }> = [];
        for (const jOrder of jitterOrders) {
          if (!jOrder.comboData) continue;
          try {
            const data = JSON.parse(jOrder.comboData);
            if (!data.batches || !Array.isArray(data.batches)) continue;

            const dueBatchIndex = data.batches.findIndex(
              (b: any) => b.status === "PENDING" && b.scheduledAt && new Date(b.scheduledAt).getTime() <= nowTime
            );

            if (dueBatchIndex !== -1) {
              dueOrders.push({ order: jOrder, batchIndex: dueBatchIndex, data });
            }
          } catch {}
        }

        // Cache fallback active panel in case order has no panel attached
        let defaultPanel: { id: string; apiUrl: string; apiKeyEncrypted: string } | null = null;

        await runInBatches(
          dueOrders,
          3,
          async ({ order: jOrder, batchIndex, data }) => {
            const batch = data.batches[batchIndex];
            let targetPanel = jOrder.panel;

            if (!targetPanel) {
              if (!defaultPanel) {
                defaultPanel = await prisma.panel.findFirst({
                  where: { isActive: true },
                  select: { id: true, apiUrl: true, apiKeyEncrypted: true },
                });
              }
              targetPanel = defaultPanel;
            }

            if (targetPanel && targetPanel.apiUrl && targetPanel.apiKeyEncrypted && targetPanel.apiKeyEncrypted !== "PLACEHOLDER_KEY") {
              try {
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
              } catch (err) {
                console.error(`Error processing jitter pulse for order #${jOrder.id}:`, err);
              }
            }
          },
          isBudgetExhausted
        );
      } catch (jitterErr) {
        console.error("Jitter engine execution error:", jitterErr);
      }
    }

    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      durationMs,
      budgetExhausted: durationMs >= MAX_EXECUTION_TIME_MS,
      ordersSynced: updatedOrdersCount,
      jitterBatchesFired,
      activeOrdersChecked: activeOrders.length,
      expiredPlansReset: expiredUsers.count,
      message: `Cron auto-sync completed in ${durationMs}ms with safe resource usage.`,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Cron sync failed" }, { status: 500 });
  }
}
