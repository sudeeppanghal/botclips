import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET /api/hybrid/plan - Check Hybrid Automation VIP Plan Status
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [user, settings] = await Promise.all([
      prisma.user.findFirst({
        where: {
          OR: [
            ...(session.id ? [{ id: session.id }] : []),
            ...(session.email ? [{ email: session.email }] : [])
          ]
        },
        select: {
          id: true,
          email: true,
          role: true,
          balance: true,
          hybridPlanActive: true,
          hybridExpiresAt: true,
        },
      }),
      prisma.adminSettings.findUnique({
        where: { id: "global" },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const usdRate = settings?.usdToInrRate || 96.0;
    const priceUsd = settings?.hybridSubscriptionPriceUsd || 50.0;
    const priceInr = Math.round(priceUsd * usdRate);

    const isAdmin = user.role === "ADMIN";
    let isPlanActive = user.hybridPlanActive;

    // Check expiry
    if (user.hybridPlanActive && user.hybridExpiresAt && new Date() > user.hybridExpiresAt) {
      isPlanActive = false;
      await prisma.user.update({
        where: { id: user.id },
        data: { hybridPlanActive: false },
      });
    }

    // Admins have automatic full access
    const hasAccess = isAdmin || isPlanActive;

    return NextResponse.json({
      success: true,
      hasAccess,
      isAdmin,
      isPlanActive,
      expiresAt: user.hybridExpiresAt,
      balance: user.balance,
      pricing: {
        priceUsd,
        priceInr,
        currencySymbol: settings?.currencySymbol || "₹",
        formattedPrice: `₹${priceInr.toLocaleString()}`,
        durationDays: 30,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load plan status" }, { status: 500 });
  }
}

// POST /api/hybrid/plan - Subscribe / Renew Hybrid VIP Plan for 30 Days
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(session.id ? [{ id: session.id }] : []),
          ...(session.email ? [{ email: session.email }] : [])
        ]
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const settings = await prisma.adminSettings.findUnique({
      where: { id: "global" },
    });

    const usdRate = settings?.usdToInrRate || 96.0;
    const priceUsd = settings?.hybridSubscriptionPriceUsd || 50.0;
    const priceInr = Math.round(priceUsd * usdRate);

    // If user is Admin, instant grant without fee
    if (user.role === "ADMIN") {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 365);
      await prisma.user.update({
        where: { id: user.id },
        data: { hybridPlanActive: true, hybridExpiresAt: expiresAt },
      });
      return NextResponse.json({
        success: true,
        message: "Admin unlimited access activated.",
        expiresAt,
      });
    }

    // Check balance
    if (user.balance < priceInr) {
      const shortfall = priceInr - user.balance;
      return NextResponse.json(
        {
          error: `Insufficient wallet balance. You need ₹${priceInr.toLocaleString()} (Shortfall: ₹${shortfall.toLocaleString()}). Please deposit funds first.`,
          requiredAmount: priceInr,
          currentBalance: user.balance,
          shortfall,
        },
        { status: 400 }
      );
    }

    // Calculate expiry (extend if already active)
    const baseDate = user.hybridPlanActive && user.hybridExpiresAt && user.hybridExpiresAt > new Date()
      ? new Date(user.hybridExpiresAt)
      : new Date();
    const newExpiresAt = new Date(baseDate);
    newExpiresAt.setDate(newExpiresAt.getDate() + 30);

    // Atomic transaction: Deduct balance & activate plan
    const updatedUser = await prisma.$transaction(async (tx) => {
      const deductResult = await tx.user.updateMany({
        where: { id: user.id, balance: { gte: priceInr } },
        data: {
          balance: { decrement: priceInr },
          totalSpent: { increment: priceInr },
          hybridPlanActive: true,
          hybridExpiresAt: newExpiresAt,
        },
      });

      if (deductResult.count === 0) {
        throw new Error("Insufficient wallet balance or concurrent transaction detected. Please refresh and try again.");
      }

      const u = await tx.user.findUniqueOrThrow({ where: { id: user.id } });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "HYBRID_SUBSCRIPTION_PURCHASE",
          details: `Subscribed to Hybrid Automation Engine 30-Day VIP Access for ₹${priceInr} ($${priceUsd})`,
        },
      });

      return u;
    });

    return NextResponse.json({
      success: true,
      message: `Successfully subscribed to Hybrid Automation Engine! Access unlocked until ${newExpiresAt.toLocaleDateString()}.`,
      balance: updatedUser.balance,
      expiresAt: newExpiresAt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process subscription" }, { status: 500 });
  }
}
