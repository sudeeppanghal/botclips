import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateUniqueReferralCode } from "@/lib/referral";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user details
    let user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        referralCode: true,
        isPromoter: true,
        isInfluencer: true,
        influencerChannel: true,
        payoutUpi: true,
        payoutCrypto: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Auto-generate referral code if missing
    let code = user.referralCode;
    if (!code) {
      code = await generateUniqueReferralCode(user.name || user.email.split("@")[0]);
      await prisma.user.update({
        where: { id: user.id },
        data: { referralCode: code },
      });
    }

    // Community scale: Total users in BotClips
    const totalAppUsers = await prisma.user.count();

    // Promoter's referred users count
    const referredUsersCount = await prisma.user.count({
      where: { referredById: user.id },
    });

    // Promoter's referral rewards
    const rewards = await prisma.referralReward.findMany({
      where: {
        promoterId: user.id,
        status: "CONFIRMED",
      },
      include: {
        referredUser: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Payout requests
    const payouts = await prisma.referralPayout.findMany({
      where: { promoterId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Compute totals
    let totalDeposits = 0;
    let totalNominalProfit = 0;
    let totalCommission = 0;

    rewards.forEach((r) => {
      totalDeposits += r.depositAmount;
      totalNominalProfit += r.nominalProfit;
      totalCommission += r.commissionAmount;
    });

    totalDeposits = Math.round(totalDeposits * 100) / 100;
    totalNominalProfit = Math.round(totalNominalProfit * 100) / 100;
    totalCommission = Math.round(totalCommission * 100) / 100;

    let paidCommission = 0;
    let pendingCommission = 0;

    payouts.forEach((p) => {
      if (p.status === "PAID") {
        paidCommission += p.amount;
      } else if (p.status === "PENDING") {
        pendingCommission += p.amount;
      }
    });

    paidCommission = Math.round(paidCommission * 100) / 100;
    pendingCommission = Math.round(pendingCommission * 100) / 100;

    const availableBalance = Math.max(0, Math.round((totalCommission - paidCommission - pendingCommission) * 100) / 100);

    // Format safe rewards list with masked identifiers
    const safeRewards = rewards.map((r) => {
      const email = r.referredUser?.email || "";
      const maskedEmail = email
        ? email.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => `${a}${"*".repeat(Math.min(4, b.length))}${c}`)
        : "Referred User";

      return {
        id: r.id,
        user: r.referredUser?.name || maskedEmail,
        depositAmount: r.depositAmount,
        nominalProfit: r.nominalProfit, // Strictly 30% of deposit
        commissionAmount: r.commissionAmount, // Strictly 10% of nominal profit
        paymentType: r.paymentType,
        createdAt: r.createdAt,
      };
    });

    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "botclips.online";
    const protocol = host.includes("localhost") ? "http" : "https";
    const referralLink = `${protocol}://${host}/signup?ref=${code}`;

    return NextResponse.json({
      success: true,
      stats: {
        referralCode: code,
        referralLink,
        totalAppUsers,
        referredUsersCount,
        totalDeposits,
        totalNominalProfit, // 30% nominal profit
        totalCommission, // 10% of nominal profit (3% of deposits)
        paidCommission,
        pendingCommission,
        availableBalance,
        minPayout: 50,
        payoutUpi: user.payoutUpi || "",
        payoutCrypto: user.payoutCrypto || "",
        isInfluencer: user.isInfluencer,
        influencerChannel: user.influencerChannel || "",
        commissionFormula: {
          nominalProfitRate: "30%",
          influencerShareRate: "10% of profit",
          explanation: "Platform calculates a 30% nominal margin on referral deposits. You earn exactly 10% of this platform profit (₹3 on every ₹100 deposit)."
        }
      },
      rewards: safeRewards,
      payouts,
    });
  } catch (error: any) {
    console.error("Affiliates stats error:", error);
    return NextResponse.json({ error: error.message || "Failed to load affiliate stats" }, { status: 500 });
  }
}
