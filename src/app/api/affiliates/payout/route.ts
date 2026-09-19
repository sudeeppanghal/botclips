import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, method, destination, channel } = body;

    const withdrawAmount = Number(amount);
    if (!withdrawAmount || withdrawAmount < 50) {
      return NextResponse.json({ error: "Minimum payout amount is ₹50 INR" }, { status: 400 });
    }

    const payoutMethod = (method || "UPI").toUpperCase();
    if (!["UPI", "USDT"].includes(payoutMethod)) {
      return NextResponse.json({ error: "Invalid payout method. Choose UPI or USDT." }, { status: 400 });
    }

    const cleanDest = String(destination || "").trim();
    if (!cleanDest) {
      return NextResponse.json({ error: "Payout address / UPI ID is required" }, { status: 400 });
    }

    // Verify user balance
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, name: true, email: true, influencerChannel: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Sum total commission earned
    const rewards = await prisma.referralReward.findMany({
      where: { promoterId: user.id, status: "CONFIRMED" },
      select: { commissionAmount: true },
    });
    const totalCommission = rewards.reduce((sum, r) => sum + r.commissionAmount, 0);

    // Sum already paid or pending payouts
    const existingPayouts = await prisma.referralPayout.findMany({
      where: { promoterId: user.id },
      select: { amount: true, status: true },
    });
    const committedAmount = existingPayouts.reduce((sum, p) => {
      if (p.status === "PAID" || p.status === "PENDING") {
        return sum + p.amount;
      }
      return sum;
    }, 0);

    const availableBalance = Math.max(0, Math.round((totalCommission - committedAmount) * 100) / 100);

    if (withdrawAmount > availableBalance) {
      return NextResponse.json({
        error: `Insufficient affiliate balance. Available: ₹${availableBalance.toFixed(2)}, Requested: ₹${withdrawAmount.toFixed(2)}`
      }, { status: 400 });
    }

    // Create payout request
    const payout = await prisma.referralPayout.create({
      data: {
        promoterId: user.id,
        amount: withdrawAmount,
        method: payoutMethod,
        destination: cleanDest,
        status: "PENDING",
      },
    });

    // Save user's payout destination preference
    const updateData: any = {};
    if (payoutMethod === "UPI") {
      updateData.payoutUpi = cleanDest;
    } else {
      updateData.payoutCrypto = cleanDest;
    }
    if (channel && typeof channel === "string") {
      updateData.influencerChannel = channel.trim();
      updateData.isInfluencer = true;
      updateData.isPromoter = true;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Payout request for ₹${withdrawAmount.toFixed(2)} submitted successfully! Admin will process via ${payoutMethod}.`,
      payout,
    });
  } catch (error: any) {
    console.error("Payout request error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit payout request" }, { status: 500 });
  }
}
