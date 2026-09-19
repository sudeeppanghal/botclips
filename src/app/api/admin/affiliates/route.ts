import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin privileges required." }, { status: 403 });
    }

    // 1. App-wide referral totals
    const totalUsers = await prisma.user.count();
    const referredUsersCount = await prisma.user.count({
      where: { referredById: { not: null } },
    });

    const allRewards = await prisma.referralReward.findMany({
      where: { status: "CONFIRMED" },
      select: { depositAmount: true, nominalProfit: true, commissionAmount: true },
    });

    const totalReferralDeposits = allRewards.reduce((sum, r) => sum + r.depositAmount, 0);
    const totalNominalProfit = allRewards.reduce((sum, r) => sum + r.nominalProfit, 0);
    const totalCommissionsEarned = allRewards.reduce((sum, r) => sum + r.commissionAmount, 0);

    // 2. All payout requests
    const payouts = await prisma.referralPayout.findMany({
      include: {
        promoter: {
          select: {
            id: true,
            name: true,
            email: true,
            referralCode: true,
            influencerChannel: true,
            payoutUpi: true,
            payoutCrypto: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalPayoutsPaid = payouts
      .filter((p) => p.status === "PAID")
      .reduce((sum, p) => sum + p.amount, 0);
    const totalPayoutsPending = payouts
      .filter((p) => p.status === "PENDING")
      .reduce((sum, p) => sum + p.amount, 0);

    // 3. Top / Active Promoters
    const promoters = await prisma.user.findMany({
      where: {
        OR: [
          { isPromoter: true },
          { isInfluencer: true },
          { referrals: { some: {} } },
          { referralRewards: { some: {} } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        referralCode: true,
        isInfluencer: true,
        isPromoter: true,
        influencerChannel: true,
        createdAt: true,
        _count: {
          select: {
            referrals: true,
            referralRewards: true,
            referralPayouts: true,
          },
        },
        referralRewards: {
          select: {
            depositAmount: true,
            nominalProfit: true,
            commissionAmount: true,
          },
        },
        referralPayouts: {
          select: {
            amount: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const promoterStats = promoters.map((p) => {
      const deposits = p.referralRewards.reduce((sum, r) => sum + r.depositAmount, 0);
      const nominalProfit = p.referralRewards.reduce((sum, r) => sum + r.nominalProfit, 0);
      const commission = p.referralRewards.reduce((sum, r) => sum + r.commissionAmount, 0);
      const paid = p.referralPayouts
        .filter((pay) => pay.status === "PAID")
        .reduce((sum, pay) => sum + pay.amount, 0);
      const pending = p.referralPayouts
        .filter((pay) => pay.status === "PENDING")
        .reduce((sum, pay) => sum + pay.amount, 0);

      return {
        id: p.id,
        name: p.name,
        email: p.email,
        referralCode: p.referralCode,
        isInfluencer: p.isInfluencer,
        influencerChannel: p.influencerChannel,
        referralsCount: p._count.referrals,
        totalDeposits: Math.round(deposits * 100) / 100,
        nominalProfit: Math.round(nominalProfit * 100) / 100, // 30% nominal profit
        commissionEarned: Math.round(commission * 100) / 100, // 10% of nominal profit
        paidAmount: Math.round(paid * 100) / 100,
        pendingAmount: Math.round(pending * 100) / 100,
        availableBalance: Math.max(0, Math.round((commission - paid - pending) * 100) / 100),
        createdAt: p.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      metrics: {
        totalUsers,
        referredUsersCount,
        totalReferralDeposits: Math.round(totalReferralDeposits * 100) / 100,
        totalNominalProfit: Math.round(totalNominalProfit * 100) / 100,
        totalCommissionsEarned: Math.round(totalCommissionsEarned * 100) / 100,
        totalPayoutsPaid: Math.round(totalPayoutsPaid * 100) / 100,
        totalPayoutsPending: Math.round(totalPayoutsPending * 100) / 100,
      },
      payouts,
      promoters: promoterStats,
    });
  } catch (error: any) {
    console.error("Admin affiliates get error:", error);
    return NextResponse.json({ error: error.message || "Failed to load admin affiliates" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin privileges required." }, { status: 403 });
    }

    const body = await request.json();
    const { action, payoutId, utrOrTxHash, userId, customCode, influencerChannel } = body;

    // Action 1: Handle Payout approval/rejection
    if (action === "APPROVE_PAYOUT" || action === "REJECT_PAYOUT") {
      if (!payoutId) {
        return NextResponse.json({ error: "payoutId is required" }, { status: 400 });
      }

      const payout = await prisma.referralPayout.findUnique({
        where: { id: payoutId },
      });

      if (!payout) {
        return NextResponse.json({ error: "Payout request not found" }, { status: 404 });
      }

      if (action === "APPROVE_PAYOUT") {
        const updated = await prisma.referralPayout.update({
          where: { id: payoutId },
          data: {
            status: "PAID",
            utrOrTxHash: utrOrTxHash || `PAY-${Date.now()}`,
            paidAt: new Date(),
          },
        });
        return NextResponse.json({ success: true, message: "Payout marked as PAID", payout: updated });
      } else {
        const updated = await prisma.referralPayout.update({
          where: { id: payoutId },
          data: {
            status: "REJECTED",
            utrOrTxHash: utrOrTxHash || "Rejected by admin",
          },
        });
        return NextResponse.json({ success: true, message: "Payout marked as REJECTED", payout: updated });
      }
    }

    // Action 2: Set custom vanity code & influencer status for an influencer/promoter
    if (action === "SET_VANITY_CODE") {
      if (!userId || !customCode) {
        return NextResponse.json({ error: "userId and customCode are required" }, { status: 400 });
      }

      const cleanCode = String(customCode).trim().toUpperCase();
      if (!/^[A-Z0-9_-]{3,20}$/.test(cleanCode)) {
        return NextResponse.json({
          error: "Referral code must be 3-20 characters alphanumeric (letters, numbers, dash/underscore only)",
        }, { status: 400 });
      }

      // Check collision
      const existing = await prisma.user.findFirst({
        where: {
          referralCode: cleanCode,
          NOT: { id: userId },
        },
      });

      if (existing) {
        return NextResponse.json({ error: "This referral code is already taken by another user." }, { status: 400 });
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          referralCode: cleanCode,
          isInfluencer: true,
          isPromoter: true,
          influencerChannel: influencerChannel ? String(influencerChannel).trim() : undefined,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Custom vanity code ${cleanCode} assigned successfully!`,
        user: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          referralCode: updated.referralCode,
          influencerChannel: updated.influencerChannel,
        },
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin affiliates PUT error:", error);
    return NextResponse.json({ error: error.message || "Failed to update affiliate data" }, { status: 500 });
  }
}
