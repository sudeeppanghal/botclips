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
    const session = await getSessionUser();
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
      const upstreamServiceId = order.service?.serviceId;

      if (!upstreamServiceId) {
        return NextResponse.json({ error: "Missing upstream service ID on catalog service" }, { status: 400 });
      }

      const addRes = await client.addOrder({
        serviceId: upstreamServiceId,
        link: order.link,
        quantity: order.quantity,
        runs: order.runs > 1 ? order.runs : undefined,
        interval: order.intervalMinutes > 0 ? order.intervalMinutes : undefined
      });

      if (addRes.error || !addRes.order) {
        return NextResponse.json({
          success: false,
          error: `Upstream dispatch failed: ${addRes.error || "No order ID returned by provider"}`
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

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/admin/orders/actions error:", error);
    return NextResponse.json({ error: error.message || "Failed to process order action" }, { status: 500 });
  }
}
