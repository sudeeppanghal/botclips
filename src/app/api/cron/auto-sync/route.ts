import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SmmPanelClient } from "@/lib/delivery/panel-client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryKey = searchParams.get("key");
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "dhillion_cron_secret_abc123";

    // Allow trigger if secret matches via header or ?key= query, or in dev mode
    const isAuthorized = 
      queryKey === cronSecret ||
      authHeader === `Bearer ${cronSecret}` ||
      request.headers.get("user-agent")?.includes("cron-job.org");

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

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ordersSynced: updatedOrdersCount,
      activeOrdersChecked: activeOrders.length,
      expiredPlansReset: expiredUsers.count,
      message: "Cron auto-sync completed successfully.",
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Cron sync failed" }, { status: 500 });
  }
}
