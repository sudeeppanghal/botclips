import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { SmmPanelClient } from "@/lib/delivery/panel-client";

function normalizeUpstreamStatus(rawStatus?: string): "PENDING" | "PROCESSING" | "IN_PROGRESS" | "COMPLETED" | "PARTIAL" | "CANCELLED" {
  if (!rawStatus) return "IN_PROGRESS";
  const s = rawStatus.toLowerCase().trim();
  if (s.includes("complete") || s === "done") return "COMPLETED";
  if (s.includes("in progress") || s.includes("inprogress") || s === "active") return "IN_PROGRESS";
  if (s.includes("process")) return "PROCESSING";
  if (s.includes("pend")) return "PENDING";
  if (s.includes("partial")) return "PARTIAL";
  if (s.includes("cancel") || s.includes("fail") || s.includes("refund")) return "CANCELLED";
  return "IN_PROGRESS";
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const body = await request.json();
    const { action, orderId, newStatus, refund = false, reason } = body;

    if (!action) {
      return NextResponse.json({ error: "Missing action parameter" }, { status: 400 });
    }

    // ──────────────── 1. SYNC STATUS FOR SINGLE ORDER ────────────────
    if (action === "SYNC_STATUS") {
      if (!orderId) {
        return NextResponse.json({ error: "Order ID required" }, { status: 400 });
      }

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { panel: true, service: true, user: true }
      });

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      if (!order.providerOrderId) {
        return NextResponse.json({ 
          success: false, 
          message: "Order has not been dispatched to an upstream provider yet (no Provider Order ID)." 
        });
      }

      if (!order.panel || !order.panel.apiUrl || !order.panel.apiKeyEncrypted) {
        return NextResponse.json({ 
          success: false, 
          message: "No active panel configured for this order." 
        });
      }

      const client = new SmmPanelClient(order.panel.apiUrl, order.panel.apiKeyEncrypted);
      const upstreamRes = await client.getOrderStatus(order.providerOrderId);

      if (upstreamRes.error) {
        return NextResponse.json({
          success: false,
          error: `Upstream Provider Error: ${upstreamRes.error}`,
          upstream: upstreamRes
        });
      }

      const mappedStatus = normalizeUpstreamStatus(upstreamRes.status);
      const startCount = upstreamRes.start_count !== undefined ? parseInt(String(upstreamRes.start_count)) || order.startCount : order.startCount;
      const remains = upstreamRes.remains !== undefined ? parseInt(String(upstreamRes.remains)) : order.remains;

      const updated = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: mappedStatus,
          startCount: startCount,
          remains: remains,
        },
        include: {
          service: true,
          panel: true,
          user: true
        }
      });

      return NextResponse.json({
        success: true,
        message: `Status synced with ${order.panel.name}: ${mappedStatus} (Remains: ${remains ?? 'N/A'})`,
        order: updated,
        upstream: upstreamRes
      });
    }

    // ──────────────── 2. BATCH SYNC ALL RUNNING ORDERS ────────────────
    if (action === "SYNC_ALL_RUNNING") {
      const runningOrders = await prisma.order.findMany({
        where: {
          status: { in: ["PENDING", "PROCESSING", "IN_PROGRESS"] },
          providerOrderId: { not: null },
          panelId: { not: null }
        },
        include: { panel: true }
      });

      let updatedCount = 0;
      const errors: string[] = [];

      for (const order of runningOrders) {
        if (order.panel?.apiUrl && order.panel?.apiKeyEncrypted && order.providerOrderId) {
          try {
            const client = new SmmPanelClient(order.panel.apiUrl, order.panel.apiKeyEncrypted);
            const upstreamRes = await client.getOrderStatus(order.providerOrderId);
            if (!upstreamRes.error && upstreamRes.status) {
              const mappedStatus = normalizeUpstreamStatus(upstreamRes.status);
              const startCount = upstreamRes.start_count !== undefined ? parseInt(String(upstreamRes.start_count)) || order.startCount : order.startCount;
              const remains = upstreamRes.remains !== undefined ? parseInt(String(upstreamRes.remains)) : order.remains;

              await prisma.order.update({
                where: { id: order.id },
                data: {
                  status: mappedStatus,
                  startCount,
                  remains
                }
              });
              updatedCount++;
            }
          } catch (err: any) {
            errors.push(`Order #${order.id}: ${err.message}`);
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: `Successfully synced ${updatedCount} of ${runningOrders.length} active running orders!`,
        totalChecked: runningOrders.length,
        updatedCount,
        errors: errors.length > 0 ? errors : undefined
      });
    }

    // ──────────────── 3. MANUAL STATUS OVERRIDE & WALLET REFUND ────────────────
    if (action === "UPDATE_STATUS") {
      if (!orderId || !newStatus) {
        return NextResponse.json({ error: "Order ID and newStatus required" }, { status: 400 });
      }

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { user: true }
      });

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // If cancelling and requesting refund
      if (newStatus === "CANCELLED" && refund && order.charge > 0) {
        await prisma.$transaction([
          prisma.order.update({
            where: { id: orderId },
            data: { 
              status: "CANCELLED",
              failReason: reason || "Cancelled & refunded by administrator"
            }
          }),
          prisma.user.update({
            where: { id: order.userId },
            data: {
              balance: { increment: order.charge },
              totalSpent: { decrement: Math.min(order.user.totalSpent, order.charge) }
            }
          })
        ]);

        return NextResponse.json({
          success: true,
          message: `Order #${orderId.slice(-6)} cancelled and ₹${order.charge.toFixed(2)} refunded to ${order.user.email}!`
        });
      }

      const updated = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: newStatus as any,
          failReason: reason || undefined
        }
      });

      return NextResponse.json({
        success: true,
        message: `Order #${orderId.slice(-6)} status updated to ${newStatus}`,
        order: updated
      });
    }

    // ──────────────── 4. FORCE RE-DISPATCH TO UPSTREAM PROVIDER ────────────────
    if (action === "REDISPATCH") {
      if (!orderId) {
        return NextResponse.json({ error: "Order ID required" }, { status: 400 });
      }

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { panel: true, service: true }
      });

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Choose panel
      let panel = order.panel;
      if (!panel || !panel.apiUrl || !panel.apiKeyEncrypted) {
        panel = await prisma.panel.findFirst({
          where: { isActive: true },
          orderBy: { priority: "asc" }
        });
      }

      if (!panel || !panel.apiUrl || !panel.apiKeyEncrypted) {
        return NextResponse.json({ error: "No active SMM provider panel available for re-dispatch" }, { status: 400 });
      }

      const client = new SmmPanelClient(panel.apiUrl, panel.apiKeyEncrypted);
      const primaryServiceId = order.service?.serviceId;

      if (!primaryServiceId) {
        return NextResponse.json({ error: "Missing upstream service ID on catalog service" }, { status: 400 });
      }

      let fallbackList: string[] = [];
      if (order.service?.fallbackServiceIds) {
        fallbackList = order.service.fallbackServiceIds
          .split(",")
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0 && s !== primaryServiceId);
      }
      const candidateServiceIds = [primaryServiceId, ...fallbackList];

      let addRes: any = null;
      let usedServiceId = primaryServiceId;

      for (const sid of candidateServiceIds) {
        try {
          addRes = await client.addOrder({
            serviceId: sid,
            link: order.link,
            quantity: order.quantity,
            runs: order.runs > 1 ? order.runs : undefined,
            interval: order.intervalMinutes > 0 ? order.intervalMinutes : undefined
          });
          if (addRes && addRes.order) {
            usedServiceId = sid;
            break;
          }
        } catch (err: any) {
          console.warn(`Redispatch fallback ${sid} error:`, err.message);
        }
      }

      if (!addRes || addRes.error || !addRes.order) {
        return NextResponse.json({
          success: false,
          error: `Upstream dispatch failed on all candidate IDs [${candidateServiceIds.join(", ")}]: ${addRes?.error || "No order ID returned"}`
        }, { status: 400 });
      }

      const updated = await prisma.order.update({
        where: { id: order.id },
        data: {
          providerOrderId: String(addRes.order),
          panelId: panel.id,
          status: "PROCESSING",
          failReason: null
        },
        include: {
          panel: true,
          service: true,
          user: true
        }
      });

      return NextResponse.json({
        success: true,
        message: `Successfully re-dispatched to ${panel.name}! Upstream Order ID: #${addRes.order}`,
        order: updated
      });
    }

    // ──────────────── 5. PAUSE ORDER ────────────────
    if (action === "PAUSE") {
      if (!orderId) return NextResponse.json({ error: "Order ID required" }, { status: 400 });
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

      let updatedComboData = order.comboData;
      if (order.comboData) {
        try {
          const combo = JSON.parse(order.comboData);
          combo.isPaused = true;
          combo.pausedAt = new Date().toISOString();
          if (Array.isArray(combo.batches)) {
            combo.batches = combo.batches.map((b: any) => {
              if (b.status === "PENDING") return { ...b, status: "PAUSED" };
              return b; // Running/DISPATCHED and COMPLETED batches remain untouched!
            });
          }
          updatedComboData = JSON.stringify(combo);
        } catch {}
      }

      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { status: "PAUSED", comboData: updatedComboData },
        include: { user: true, service: true, panel: true },
      });

      return NextResponse.json({
        success: true,
        message: `Order #${orderId.slice(-6)} paused. Active batch will complete safely; remaining pulses held.`,
        order: updated,
      });
    }

    // ──────────────── 6. RESUME ORDER ────────────────
    if (action === "RESUME") {
      if (!orderId) return NextResponse.json({ error: "Order ID required" }, { status: 400 });
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

      let updatedComboData = order.comboData;
      if (order.comboData) {
        try {
          const combo = JSON.parse(order.comboData);
          combo.isPaused = false;
          combo.resumedAt = new Date().toISOString();

          const intervalMins = Math.max(2, order.intervalMinutes || 5);
          const nowMs = Date.now();
          let offset = 0;
          if (Array.isArray(combo.batches)) {
            combo.batches = combo.batches.map((b: any) => {
              if (b.status === "PAUSED") {
                offset++;
                const newScheduledTime = new Date(nowMs + offset * intervalMins * 60 * 1000).toISOString();
                return { ...b, status: "PENDING", scheduledAt: newScheduledTime };
              }
              return b;
            });
          }
          updatedComboData = JSON.stringify(combo);
        } catch {}
      }

      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { status: "IN_PROGRESS", comboData: updatedComboData },
        include: { user: true, service: true, panel: true },
      });

      return NextResponse.json({
        success: true,
        message: `Order #${orderId.slice(-6)} resumed! Remaining pulses rescheduled.`,
        order: updated,
      });
    }

    // ──────────────── 7. CANCEL REMAINING BATCHES & PARTIAL REFUND ────────────────
    if (action === "CANCEL_PARTIAL") {
      if (!orderId) return NextResponse.json({ error: "Order ID required" }, { status: 400 });
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { user: true, service: true },
      });
      if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

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
              if (b.status === "DISPATCHED" || b.status === "COMPLETED" || b.upstreamOrderId) {
                dispatchedQuantity += bQty;
                return b;
              } else {
                cancelledQuantity += bQty;
                return { ...b, status: "CANCELLED" };
              }
            });
          }
          updatedComboData = JSON.stringify(combo);
        } catch {}
      } else {
        if (!order.providerOrderId) {
          cancelledQuantity = totalQuantity;
          dispatchedQuantity = 0;
        } else {
          const remains = order.remains !== null && order.remains !== undefined ? Number(order.remains) : 0;
          cancelledQuantity = Math.max(0, Math.min(totalQuantity, remains));
          dispatchedQuantity = totalQuantity - cancelledQuantity;
        }
      }

      let refundAmount = 0;
      if (totalQuantity > 0 && totalCharge > 0 && cancelledQuantity > 0) {
        refundAmount = Number(((cancelledQuantity / totalQuantity) * totalCharge).toFixed(2));
        refundAmount = Math.max(0, Math.min(totalCharge, refundAmount));
      }

      const finalStatus = dispatchedQuantity > 0 ? "PARTIAL" : "CANCELLED";
      const reasonMsg = dispatchedQuantity > 0
        ? `Cancelled by admin. Dispatched: ${dispatchedQuantity.toLocaleString()} views. Refunded: ₹${refundAmount.toFixed(2)} for ${cancelledQuantity.toLocaleString()} unsent views.`
        : `Cancelled before dispatch by admin. 100% refunded (₹${refundAmount.toFixed(2)}).`;

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
          include: { user: true, service: true, panel: true },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: `Order #${orderId.slice(-6)} cancelled. ₹${refundAmount.toFixed(2)} refunded to ${order.user.email} for unsent pulses.`,
        refundAmount,
        order: updatedOrder,
      });
    }

    // ──────────────── 8. MODIFY TARGET LINK ────────────────
    if (action === "MODIFY_LINK") {
      const { newLink } = body;
      if (!orderId || !newLink) return NextResponse.json({ error: "Order ID and newLink required" }, { status: 400 });
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

      const cleanLink = String(newLink).trim();
      let updatedComboData = order.comboData;
      if (order.comboData) {
        try {
          const combo = JSON.parse(order.comboData);
          combo.targetLink = cleanLink;
          combo.linkModifiedAt = new Date().toISOString();
          updatedComboData = JSON.stringify(combo);
        } catch {}
      }

      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { link: cleanLink, comboData: updatedComboData },
        include: { user: true, service: true, panel: true },
      });

      return NextResponse.json({
        success: true,
        message: `Target link updated to: ${cleanLink}`,
        order: updated,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/admin/orders/actions error:", error);
    return NextResponse.json({ error: error.message || "Failed to process order action" }, { status: 500 });
  }
}
