import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const body = await request.json();
    const { action, orderId, newLink } = body;

    if (!action || !orderId) {
      return NextResponse.json({ error: "Missing required parameters: action and orderId" }, { status: 400 });
    }

    // 1. Fetch order with user details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, service: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Authorization: User can only manage their own orders; Admin can manage all
    const isAdmin = session.role === "ADMIN";
    const isOwner = order.userId === session.id || order.user?.email === session.email;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "You do not have permission to manage this order" }, { status: 403 });
    }

    const currentStatus = String(order.status).toUpperCase();

    // ─────────────────────────────────────────────────────────────
    // ACTION 1: PAUSE ORDER
    // ─────────────────────────────────────────────────────────────
    if (action === "PAUSE") {
      if (currentStatus === "COMPLETED" || currentStatus === "CANCELLED" || currentStatus === "REFUNDED") {
        return NextResponse.json(
          { error: `Cannot pause order because it is already ${currentStatus.toLowerCase()}` },
          { status: 400 }
        );
      }
      if (currentStatus === "PAUSED") {
        return NextResponse.json({ error: "Order is already paused" }, { status: 400 });
      }

      let updatedComboData = order.comboData;
      if (order.comboData) {
        try {
          const combo = JSON.parse(order.comboData);
          combo.isPaused = true;
          combo.pausedAt = new Date().toISOString();
          if (Array.isArray(combo.batches)) {
            combo.batches = combo.batches.map((b: any) => {
              if (b.status === "PENDING") {
                return { ...b, status: "PAUSED" };
              }
              return b; // Running/DISPATCHED and COMPLETED batches remain untouched!
            });
          }
          updatedComboData = JSON.stringify(combo);
        } catch (e) {
          console.error("Error parsing comboData on pause:", e);
        }
      }

      const updated = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "PAUSED",
          comboData: updatedComboData,
        },
      });

      return NextResponse.json({
        success: true,
        action: "PAUSE",
        message: "Campaign paused. Active running batch will finish safely; remaining scheduled pulses are held.",
        order: updated,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // ACTION 2: RESUME ORDER
    // ─────────────────────────────────────────────────────────────
    if (action === "RESUME") {
      if (currentStatus !== "PAUSED") {
        return NextResponse.json(
          { error: `Cannot resume an order with status ${currentStatus}. Only paused orders can be resumed.` },
          { status: 400 }
        );
      }

      let updatedComboData = order.comboData;
      if (order.comboData) {
        try {
          const combo = JSON.parse(order.comboData);
          combo.isPaused = false;
          combo.resumedAt = new Date().toISOString();

          // Reschedule remaining PAUSED batches starting from right now
          const intervalMins = Math.max(2, order.intervalMinutes || 5);
          const nowMs = Date.now();
          let pendingOffset = 0;

          if (Array.isArray(combo.batches)) {
            combo.batches = combo.batches.map((b: any) => {
              if (b.status === "PAUSED") {
                pendingOffset++;
                const newScheduledTime = new Date(nowMs + pendingOffset * intervalMins * 60 * 1000).toISOString();
                return { ...b, status: "PENDING", scheduledAt: newScheduledTime };
              }
              return b;
            });
          }
          updatedComboData = JSON.stringify(combo);
        } catch (e) {
          console.error("Error parsing comboData on resume:", e);
        }
      }

      const updated = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "IN_PROGRESS",
          comboData: updatedComboData,
        },
      });

      return NextResponse.json({
        success: true,
        action: "RESUME",
        message: "Campaign resumed! Remaining pulses have been rescheduled and will deliver smoothly.",
        order: updated,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // ACTION 3: CANCEL ORDER (ZERO-LOSS REFUND FOR REMAINING BATCHES)
    // ─────────────────────────────────────────────────────────────
    if (action === "CANCEL") {
      if (currentStatus === "COMPLETED") {
        return NextResponse.json({ error: "Cannot cancel a completed campaign" }, { status: 400 });
      }
      if (currentStatus === "CANCELLED" || currentStatus === "REFUNDED") {
        return NextResponse.json({ error: "Order is already cancelled" }, { status: 400 });
      }

      const totalQuantity = Number(order.quantity || 1);
      const totalCharge = Number(order.charge || 0);

      let cancelledQuantity = 0;
      let dispatchedQuantity = 0;
      let updatedComboData = order.comboData;

      if (order.comboData) {
        try {
          const combo = JSON.parse(order.comboData);
          combo.isCancelled = true;
          combo.cancelledAt = new Date().toISOString();

          if (Array.isArray(combo.batches)) {
            combo.batches = combo.batches.map((b: any) => {
              const bQty = Number(b.views || b.quantity || 0);
              // Already sent to upstream hardware/farm -> NEVER cancel running batches
              if (b.status === "DISPATCHED" || b.status === "COMPLETED" || b.upstreamOrderId) {
                dispatchedQuantity += bQty;
                return b;
              } else {
                // Not yet dispatched -> Cancel and qualify for refund
                cancelledQuantity += bQty;
                return { ...b, status: "CANCELLED" };
              }
            });
          }
          updatedComboData = JSON.stringify(combo);
        } catch (e) {
          console.error("Error parsing comboData on cancel:", e);
        }
      } else {
        // Single regular order
        if (!order.providerOrderId) {
          // Hasn't reached upstream panel at all -> Full refund
          cancelledQuantity = totalQuantity;
          dispatchedQuantity = 0;
        } else {
          // Reached upstream panel -> Check remains if recorded
          const remains = order.remains !== null && order.remains !== undefined ? Number(order.remains) : 0;
          cancelledQuantity = Math.max(0, Math.min(totalQuantity, remains));
          dispatchedQuantity = totalQuantity - cancelledQuantity;
        }
      }

      // Calculate exact proportional refund for unsent/cancelled batches
      let refundAmount = 0;
      if (totalQuantity > 0 && totalCharge > 0 && cancelledQuantity > 0) {
        refundAmount = Number(((cancelledQuantity / totalQuantity) * totalCharge).toFixed(2));
        refundAmount = Math.max(0, Math.min(totalCharge, refundAmount));
      }

      const finalStatus = dispatchedQuantity > 0 ? "PARTIAL" : "CANCELLED";
      const reasonMsg = dispatchedQuantity > 0
        ? `Cancelled by user. Running/Delivered: ${dispatchedQuantity.toLocaleString()} views. Refunded ₹${refundAmount.toFixed(2)} for ${cancelledQuantity.toLocaleString()} unsent views.`
        : `Cancelled before dispatch. 100% refunded (₹${refundAmount.toFixed(2)}).`;

      // Atomic transaction: Refund wallet balance + update order
      const [updatedUser, updatedOrder] = await prisma.$transaction([
        prisma.user.update({
          where: { id: order.userId },
          data: {
            balance: { increment: refundAmount },
            totalSpent: { decrement: Math.min(order.user.totalSpent, refundAmount) },
          },
          select: { id: true, balance: true },
        }),
        prisma.order.update({
          where: { id: order.id },
          data: {
            status: finalStatus,
            remains: cancelledQuantity,
            failReason: reasonMsg,
            comboData: updatedComboData,
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        action: "CANCEL",
        message: `Order cancelled. ₹${refundAmount.toFixed(2)} credited back to your wallet for unsent batches!`,
        refundAmount,
        newBalance: updatedUser.balance,
        dispatchedQuantity,
        cancelledQuantity,
        order: updatedOrder,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // ACTION 4: MODIFY TARGET LINK
    // ─────────────────────────────────────────────────────────────
    if (action === "MODIFY_LINK") {
      if (!newLink || typeof newLink !== "string" || !newLink.trim().startsWith("http")) {
        return NextResponse.json({ error: "Please provide a valid URL link starting with http/https" }, { status: 400 });
      }

      if (currentStatus === "COMPLETED" || currentStatus === "CANCELLED") {
        return NextResponse.json({ error: "Cannot modify completed or cancelled orders" }, { status: 400 });
      }

      const cleanLink = newLink.trim();
      let updatedComboData = order.comboData;

      if (order.comboData) {
        try {
          const combo = JSON.parse(order.comboData);
          combo.targetLink = cleanLink;
          combo.linkModifiedAt = new Date().toISOString();
          updatedComboData = JSON.stringify(combo);
        } catch (e) {
          console.error("Error parsing comboData on modify link:", e);
        }
      }

      const updated = await prisma.order.update({
        where: { id: order.id },
        data: {
          link: cleanLink,
          comboData: updatedComboData,
        },
      });

      return NextResponse.json({
        success: true,
        action: "MODIFY_LINK",
        message: "Target link updated for all upcoming batches.",
        order: updated,
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/orders/actions error:", error);
    return NextResponse.json({ error: error.message || "Failed to process order action" }, { status: 500 });
  }
}
