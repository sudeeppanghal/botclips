import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { SmmPanelClient } from "@/lib/delivery/panel-client";

// Pricing in INR (based on $5/week and $25/month at ~₹88/USD)
const PLAN_PRICES = {
  WEEKLY: 440,   // $5 = ~₹440 INR
  MONTHLY: 2200, // $25 = ~₹2,200 INR
};

// GET /api/automation/plan - Fetch user's current automation mode & plan status
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        balance: true,
        customApiUrl: true,
        customApiKey: true,
        automationMode: true,
        planActive: true,
        planType: true,
        planExpiresAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if plan has expired
    let isPlanActive = user.planActive;
    if (user.planActive && user.planExpiresAt && new Date() > user.planExpiresAt) {
      isPlanActive = false;
      await prisma.user.update({
        where: { id: user.id },
        data: { planActive: false, automationMode: "MANAGED" },
      });
    }

    return NextResponse.json({
      success: true,
      plan: {
        planActive: isPlanActive,
        planType: user.planType,
        planExpiresAt: user.planExpiresAt,
        automationMode: isPlanActive ? user.automationMode : "MANAGED",
        customApiUrl: user.customApiUrl,
        hasApiKey: !!user.customApiKey,
        balance: user.balance,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch plan" }, { status: 500 });
  }
}

// POST /api/automation/plan - Purchase or renew Weekly ($5) or Monthly ($25) plan
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { planType } = body; // "WEEKLY" or "MONTHLY"

    if (planType !== "WEEKLY" && planType !== "MONTHLY") {
      return NextResponse.json({ error: "Invalid plan. Choose WEEKLY ($5) or MONTHLY ($25)." }, { status: 400 });
    }

    const cost = PLAN_PRICES[planType as keyof typeof PLAN_PRICES];

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, balance: true, planExpiresAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.balance < cost) {
      return NextResponse.json({
        error: `Insufficient wallet balance. This plan costs ₹${cost} ($${planType === "WEEKLY" ? "5" : "25"}). Your balance is ₹${user.balance.toFixed(2)}. Please add funds.`,
        required: cost,
        current: user.balance,
      }, { status: 400 });
    }

    // Calculate new expiration date (extend if already active)
    const now = new Date();
    const baseDate = (user.planExpiresAt && user.planExpiresAt > now) ? user.planExpiresAt : now;
    const daysToAdd = planType === "WEEKLY" ? 7 : 30;
    const expiresAt = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

    // Deduct cost and activate plan
    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: {
        balance: { decrement: cost },
        totalSpent: { increment: cost },
        planActive: true,
        planType,
        planExpiresAt: expiresAt,
        automationMode: "CUSTOM_API",
      },
      select: {
        id: true,
        balance: true,
        planActive: true,
        planType: true,
        planExpiresAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully subscribed to Premium BYO-API ${planType} plan! Active until ${expiresAt.toLocaleDateString()}.`,
      user: updatedUser,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to purchase plan" }, { status: 500 });
  }
}

// PUT /api/automation/plan - Save & test custom SMM panel API credentials
export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { customApiUrl, customApiKey, automationMode, testConnection } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, planActive: true, planExpiresAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isPlanValid = user.planActive && (!user.planExpiresAt || new Date() < user.planExpiresAt);

    if (!isPlanValid && automationMode === "CUSTOM_API") {
      return NextResponse.json({
        error: "Active Premium Plan required to use Custom SMM Panel API mode. Please activate the Weekly ($5) or Monthly ($25) plan.",
      }, { status: 403 });
    }

    // If testing connection with the provided custom API
    if (testConnection && customApiUrl && customApiKey) {
      try {
        const client = new SmmPanelClient(customApiUrl, customApiKey);
        const balanceRes = await client.getBalance();
        
        if (balanceRes.error) {
          return NextResponse.json({
            success: false,
            error: `Upstream panel rejected key: ${balanceRes.error}`,
          }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          message: "API Connection Verified!",
          balance: balanceRes.balance ?? "Connected",
          currency: balanceRes.currency ?? "USD",
        });
      } catch (connErr: any) {
        return NextResponse.json({
          success: false,
          error: `Failed to connect to ${customApiUrl}: ${connErr.message}`,
        }, { status: 400 });
      }
    }

    // Save user's custom API settings
    await prisma.user.update({
      where: { id: session.id },
      data: {
        customApiUrl: customApiUrl ? String(customApiUrl).trim() : null,
        customApiKey: customApiKey ? String(customApiKey).trim() : null,
        automationMode: automationMode === "CUSTOM_API" && isPlanValid ? "CUSTOM_API" : "MANAGED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Automation mode and API settings saved successfully.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update settings" }, { status: 500 });
  }
}
