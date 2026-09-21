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

    // 3. All Registered Users for Affiliate Management (Active promoters first, then newest)
    const promoters = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        referralCode: true,
        isInfluencer: true,
        isPromoter: true,
        referralCommissionRate: true,
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
      orderBy: [
        { isPromoter: "desc" },
        { createdAt: "desc" },
      ],
      take: 500,
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
        isPromoter: Boolean(p.isPromoter),
        referralCommissionRate: p.referralCommissionRate ?? 5.0,
        influencerChannel: p.influencerChannel,
        referralsCount: p._count.referrals,
        totalDeposits: Math.round(deposits * 100) / 100,
        nominalProfit: Math.round(nominalProfit * 100) / 100, // 30% nominal profit
        commissionEarned: Math.round(commission * 100) / 100,
        paidAmount: Math.round(paid * 100) / 100,
        pendingAmount: Math.round(pending * 100) / 100,
        availableBalance: Math.max(0, Math.round((commission - paid - pending) * 100) / 100),
        createdAt: p.createdAt,
      };
    });

    // Fetch all registered users for admin candidate selector
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        referralCode: true,
        isPromoter: true,
        referralCommissionRate: true,
        influencerChannel: true,
      },
      orderBy: { createdAt: "desc" },
      take: 300,
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
      allUsers,
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
    const { action, payoutId, utrOrTxHash, userId, customCode, influencerChannel, isPromoter } = body;

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

    // Action 2: Toggle Promoter / Affiliate Status (Enable or Disable)
    if (action === "TOGGLE_PROMOTER") {
      if (!userId) {
        return NextResponse.json({ error: "userId is required" }, { status: 400 });
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const newStatus = isPromoter !== undefined ? Boolean(isPromoter) : !user.isPromoter;
      const updateData: any = {
        isPromoter: newStatus,
        isInfluencer: newStatus,
      };

      // Auto-generate a code if enabling and user doesn't have one
      if (newStatus && !user.referralCode) {
        const { generateUniqueReferralCode } = await import("@/lib/referral");
        updateData.referralCode = await generateUniqueReferralCode(user.name || user.email.split("@")[0]);
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      return NextResponse.json({
        success: true,
        message: `Affiliate access ${newStatus ? "ENABLED" : "DISABLED"} for ${updated.email}!`,
        user: {
          id: updated.id,
          email: updated.email,
          isPromoter: updated.isPromoter,
          referralCode: updated.referralCode,
        },
      });
    }

    // Action 3: Set custom vanity code & influencer status for an influencer/promoter
    if (action === "SET_VANITY_CODE" || action === "ASSIGN_PROMOTER") {
      if (!userId) {
        return NextResponse.json({ error: "userId is required" }, { status: 400 });
      }

      let cleanCode = customCode ? String(customCode).trim().toUpperCase() : "";

      if (cleanCode && !/^[A-Z0-9_-]{3,25}$/.test(cleanCode)) {
        return NextResponse.json({
          error: "Referral code must be 3-25 characters alphanumeric (letters, numbers, dash/underscore only)",
        }, { status: 400 });
      }

      // If no code provided, generate one
      if (!cleanCode) {
        const targetUser = await prisma.user.findUnique({ where: { id: userId } });
        if (targetUser?.referralCode) {
          cleanCode = targetUser.referralCode;
        } else {
          const { generateUniqueReferralCode } = await import("@/lib/referral");
          cleanCode = await generateUniqueReferralCode(targetUser?.name || targetUser?.email.split("@")[0]);
        }
      }

      // Check collision
      const existing = await prisma.user.findFirst({
        where: {
          referralCode: cleanCode,
          NOT: { id: userId },
        },
      });

      if (existing) {
        return NextResponse.json({ error: `Referral code "${cleanCode}" is already taken by another user.` }, { status: 400 });
      }

      const updatePayload: any = {
        referralCode: cleanCode,
        isInfluencer: true,
        isPromoter: isPromoter !== undefined ? Boolean(isPromoter) : true,
        influencerChannel: influencerChannel ? String(influencerChannel).trim() : undefined,
      };

      if (body.commissionRate !== undefined) {
        const rateNum = Number(body.commissionRate);
        if (!isNaN(rateNum) && rateNum >= 0 && rateNum <= 100) {
          updatePayload.referralCommissionRate = rateNum;
        }
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: updatePayload,
      });

      return NextResponse.json({
        success: true,
        message: `Affiliate Partner assigned with code "${cleanCode}" successfully!`,
        user: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          isPromoter: updated.isPromoter,
          referralCode: updated.referralCode,
          referralCommissionRate: updated.referralCommissionRate,
          influencerChannel: updated.influencerChannel,
        },
      });
    }

    // Action 4: Update commission rate percentage for a promoter
    if (action === "UPDATE_COMMISSION_RATE") {
      if (!userId) {
        return NextResponse.json({ error: "userId is required" }, { status: 400 });
      }

      const rateNum = Number(body.commissionRate);
      if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) {
        return NextResponse.json({ error: "Commission rate must be a valid percentage between 0% and 100%" }, { status: 400 });
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { referralCommissionRate: rateNum },
      });

      return NextResponse.json({
        success: true,
        message: `Commission rate for ${updated.name || updated.email} updated to ${rateNum}%!`,
        rate: updated.referralCommissionRate,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin affiliates PUT error:", error);
    return NextResponse.json({ error: error.message || "Failed to update affiliate data" }, { status: 500 });
  }
}
