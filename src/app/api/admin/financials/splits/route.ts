import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    // 1. Calculate overall business financials
    const [upiPayments, cryptoPayments, orders, savedSplits] = await Promise.all([
      prisma.upiPayment.findMany({ where: { status: "CONFIRMED" } }),
      prisma.cryptoPayment.findMany({ where: { status: "CONFIRMED" } }),
      prisma.order.findMany({
        where: { status: { in: ["COMPLETED", "IN_PROGRESS", "PROCESSING"] } },
        include: { service: true }
      }),
      prisma.profitSplit.findMany({ orderBy: { createdAt: "desc" }, take: 100 })
    ]);

    const totalUpiRevenue = upiPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const totalCryptoRevenue = cryptoPayments.reduce((acc, p) => acc + (Number(p.amountInr) || (Number(p.amountUsdt) * 96) || 0), 0);
    const totalGrossRevenue = totalUpiRevenue + totalCryptoRevenue;

    const totalClientCharged = orders.reduce((acc, o) => acc + (Number(o.charge) || 0), 0);
    const totalWholesaleCost = orders.reduce((acc, o) => {
      const origRate = Number(o.service?.originalRate || 0);
      const qty = Number(o.quantity || 0);
      return acc + (origRate > 0 ? (qty / 1000) * origRate : 0);
    }, 0);

    const netGrossProfit = Math.max(0, totalClientCharged - totalWholesaleCost);
    const profitMarginPct = totalClientCharged > 0 ? Math.round((netGrossProfit / totalClientCharged) * 100) : 0;

    // Settled vs Pending splits
    const settledAmount = savedSplits.filter(s => s.isSettled).reduce((acc, s) => acc + (Number(s.grossProfit) || 0), 0);
    const pendingAmount = Math.max(0, netGrossProfit - settledAmount);

    return NextResponse.json({
      success: true,
      summary: {
        totalGrossRevenue,
        totalClientCharged,
        totalWholesaleCost,
        netGrossProfit,
        profitMarginPct,
        settledAmount,
        pendingAmount,
        totalConfirmedDeposits: upiPayments.length + cryptoPayments.length,
      },
      splits: savedSplits
    });
  } catch (error: any) {
    console.error("GET /api/admin/financials/splits error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to calculate profit splits" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const body = await request.json();
    const { action, splitId, amountInr, grossProfit, partner1Name, partner1Percent, partner2Name, partner2Percent, notes } = body;

    if (action === "TOGGLE_SETTLE" && splitId) {
      const existing = await prisma.profitSplit.findUnique({ where: { id: splitId } });
      if (!existing) return NextResponse.json({ error: "Split not found" }, { status: 404 });

      const updated = await prisma.profitSplit.update({
        where: { id: splitId },
        data: { isSettled: !existing.isSettled }
      });
      return NextResponse.json({ success: true, split: updated });
    }

    // Record new partner settlement record
    const p1Percent = Number(partner1Percent || 50);
    const p2Percent = Number(partner2Percent || 50);
    const profit = Number(grossProfit || amountInr || 0);

    const p1Share = Number(((profit * p1Percent) / 100).toFixed(2));
    const p2Share = Number(((profit * p2Percent) / 100).toFixed(2));

    const newSplit = await prisma.profitSplit.create({
      data: {
        source: body.source || "MANUAL",
        amountInr: Number(amountInr || profit),
        grossProfit: profit,
        partner1Name: partner1Name || "Jack",
        partner1Percent: p1Percent,
        partner1Share: p1Share,
        partner2Name: partner2Name || "Daniel",
        partner2Percent: p2Percent,
        partner2Share: p2Share,
        isSettled: Boolean(body.isSettled),
        notes: notes || "Partner profit distribution",
      }
    });

    return NextResponse.json({ success: true, split: newSplit });
  } catch (error: any) {
    console.error("POST /api/admin/financials/splits error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to record split" }, { status: 500 });
  }
}
