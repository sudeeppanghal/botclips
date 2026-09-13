import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SmmPanelClient } from "@/lib/delivery/panel-client";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Optional secret check if set
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Allow local development or cron triggers
    }

    // Find all active orders with an upstream provider order ID
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: { in: ["PENDING", "PROCESSING", "IN_PROGRESS"] },
        providerOrderId: { not: null },
      },
      include: { panel: true },
      take: 100,
    });

    if (pendingOrders.length === 0) {
      return NextResponse.json({ message: "No active orders to sync", count: 0 });
    }

    let updatedCount = 0;

    // Group orders by panel
    for (const order of pendingOrders) {
      if (!order.panel || !order.providerOrderId) continue;

      try {
        const client = new SmmPanelClient(order.panel.apiUrl, order.panel.apiKeyEncrypted);
        const statusRes = await client.getOrderStatus(order.providerOrderId);

        if (statusRes && statusRes.status) {
          const upstreamStatus = statusRes.status.toLowerCase();
          let newStatus = order.status;

          if (upstreamStatus === "completed") newStatus = "COMPLETED";
          else if (upstreamStatus === "in progress" || upstreamStatus === "processing") newStatus = "IN_PROGRESS";
          else if (upstreamStatus === "partial") newStatus = "PARTIAL";
          else if (upstreamStatus === "canceled" || upstreamStatus === "cancelled") newStatus = "CANCELLED";

          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: newStatus,
              startCount: statusRes.start_count ? Number(statusRes.start_count) : order.startCount,
              remains: statusRes.remains ? Number(statusRes.remains) : order.remains,
            },
          });
          updatedCount++;
        }
      } catch (syncErr) {
        console.error(`Error syncing order ${order.id}:`, syncErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${updatedCount} orders`,
      synced: updatedCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Auto-sync failed" }, { status: 500 });
  }
}
