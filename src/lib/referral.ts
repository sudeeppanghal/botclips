import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const NOMINAL_PROFIT_PERCENT = 30; // 30% platform profit presented to promoters
export const PROMOTER_SHARE_OF_PROFIT_PERCENT = 10; // 10% cut of the nominal profit

/**
 * Calculates nominal profit (displayed 30%) and promoter commission (10% of nominal profit).
 * Example: ₹100 deposit -> ₹30 nominal profit -> ₹3.00 promoter cut.
 */
export function calculateReferralEarning(depositAmount: number) {
  const nominalProfit = Math.round(depositAmount * 0.30 * 100) / 100;
  const commissionAmount = Math.round(nominalProfit * 0.10 * 100) / 100;
  return { nominalProfit, commissionAmount };
}

/**
 * Generates an uppercase unique referral code for a user.
 */
export async function generateUniqueReferralCode(hint?: string): Promise<string> {
  let cleanHint = (hint || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (cleanHint.length < 3) cleanHint = "VIP";
  const prefix = cleanHint.slice(0, 5);

  for (let attempt = 0; attempt < 10; attempt++) {
    const randomHex = crypto.randomBytes(2).toString("hex").toUpperCase();
    const candidate = `${prefix}${randomHex}`;
    const exists = await prisma.user.findUnique({
      where: { referralCode: candidate },
      select: { id: true },
    });
    if (!exists) {
      return candidate;
    }
  }

  // Fallback if collision
  return `VIP${Date.now().toString(36).toUpperCase()}`;
}

/**
 * Records a referral commission when a deposit (UPI or Crypto) is confirmed.
 */
export async function recordReferralReward(params: {
  userId: string;
  depositAmount: number;
  paymentType: "UPI" | "CRYPTO";
  paymentId?: string;
}) {
  const { userId, depositAmount, paymentType, paymentId } = params;
  if (!depositAmount || depositAmount <= 0) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, referredById: true },
    });

    if (!user || !user.referredById) {
      return null;
    }

    // Check if duplicate for same paymentId
    if (paymentId) {
      const existing = await prisma.referralReward.findFirst({
        where: { paymentId },
      });
      if (existing) {
        return existing;
      }
    }

    const { nominalProfit, commissionAmount } = calculateReferralEarning(depositAmount);
    if (commissionAmount <= 0) return null;

    const reward = await prisma.referralReward.create({
      data: {
        promoterId: user.referredById,
        referredUserId: user.id,
        depositAmount,
        nominalProfit,
        commissionAmount,
        paymentType,
        paymentId: paymentId || null,
        status: "CONFIRMED",
      },
    });

    return reward;
  } catch (err: any) {
    console.error("Error recording referral reward:", err?.message || err);
    return null;
  }
}
