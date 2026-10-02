import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// Helper: Calculate campaign cost based on active services
async function calculateSlotsCost(slots: any[]): Promise<number> {
  const activeServices = await prisma.adminService.findMany({
    where: { isActive: true },
    select: { id: true, category: true, name: true, customRate: true },
  });

  // Find best default rate per 1000 for each metric
  const getRate = (keyword: string, fallback: number) => {
    const match = activeServices.find(s => 
      s.name.toLowerCase().includes(keyword) || s.category.toLowerCase().includes(keyword)
    );
    return match?.customRate ? match.customRate / 1000 : fallback / 1000;
  };

  const rateViews = getRate("view", 7.5);
  const rateLikes = getRate("like", 10.5);
  const rateComments = getRate("comment", 345.0);
  const rateShares = getRate("share", 2.0);
  const rateSaves = 0.002;
  const rateReposts = 0.005;

  let totalCost = 0;
  for (const s of slots) {
    totalCost += (Number(s.views || 0) * rateViews);
    totalCost += (Number(s.likes || 0) * rateLikes);
    totalCost += (Number(s.comments || 0) * rateComments);
    totalCost += (Number(s.shares || 0) * rateShares);
    totalCost += (Number(s.saves || 0) * rateSaves);
    totalCost += (Number(s.reposts || 0) * rateReposts);
  }

  return Number(totalCost.toFixed(2));
}

// GET /api/hybrid/campaigns - List User's Hybrid Campaigns
export async function GET(request: NextRequest) {
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

    const campaigns = await prisma.hybridCampaign.findMany({
      where: user.role === "ADMIN" ? {} : { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        slots: {
          orderBy: { slotIndex: "asc" },
        },
      },
      take: 50,
    });

    return NextResponse.json({ success: true, campaigns });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load campaigns" }, { status: 500 });
  }
}

// POST /api/hybrid/campaigns - Create & Schedule Hybrid Automation Campaign
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

    // Access check: User must be Admin or have an active Hybrid Plan
    const isPlanActive = user.hybridPlanActive && user.hybridExpiresAt && user.hybridExpiresAt > new Date();
    if (user.role !== "ADMIN" && !isPlanActive) {
      return NextResponse.json(
        { error: "Hybrid Automation requires an active VIP Subscription (₹50/mo). Please subscribe first." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, videoUrl, mode, intervalMinutes, multiplier, slots, ratios } = body;

    if (!videoUrl || !videoUrl.trim().startsWith("http")) {
      return NextResponse.json({ error: "A valid target video URL is required." }, { status: 400 });
    }

    const slotList = Array.isArray(slots) ? slots : [];
    if (slotList.length === 0) {
      return NextResponse.json({ error: "At least 1 injection slot is required." }, { status: 400 });
    }

    const totalViews = slotList.reduce((acc, s) => acc + Number(s.views || 0), 0);
    const campaignCost = await calculateSlotsCost(slotList);

    // Balance check
    if (user.balance < campaignCost) {
      return NextResponse.json(
        {
          error: `Insufficient wallet balance for this campaign. Required: ₹${campaignCost.toFixed(2)}, Available: ₹${user.balance.toFixed(2)}. Please deposit funds.`,
          required: campaignCost,
          balance: user.balance,
        },
        { status: 400 }
      );
    }

    const now = new Date();
    const interval = Number(intervalMinutes || 72);

    // Atomic transaction: Deduct cost, create campaign, create scheduled slots
    const result = await prisma.$transaction(async (tx) => {
      // 1. Deduct cost from wallet atomically
      if (campaignCost > 0) {
        const deducted = await tx.user.updateMany({
          where: { id: user.id, balance: { gte: campaignCost } },
          data: {
            balance: { decrement: campaignCost },
            totalSpent: { increment: campaignCost },
          },
        });
        if (deducted.count === 0) {
          throw new Error("Insufficient wallet balance or concurrent transaction detected. Please refresh and try again.");
        }
      }

      // 2. Create Campaign
      const campaign = await tx.hybridCampaign.create({
        data: {
          userId: user.id,
          name: name || `HYBRID-${Date.now().toString().slice(-6)}`,
          videoUrl: videoUrl.trim(),
          mode: mode || "bimodal_curve",
          status: "active",
          intervalMinutes: interval,
          multiplier: Number(multiplier || 1.0),
          totalSlots: slotList.length,
          completedSlots: 0,
          totalViews,
          deliveredViews: 0,
          totalCharge: campaignCost,
          ratios: ratios ? JSON.stringify(ratios) : null,
          nextOrderAt: now,
        },
      });

      // 3. Create Slots
      const slotCreations = slotList.map((s, idx) => {
        const offsetMs = s.offsetMinutes != null
          ? Number(s.offsetMinutes) * 60 * 1000
          : idx * interval * 60 * 1000;

        const scheduledTime = new Date(now.getTime() + offsetMs);

        const pulseViews = Number(s.views || 0);
        const safeViews = pulseViews > 0 ? Math.max(100, pulseViews) : 0;

        return tx.hybridSlot.create({
          data: {
            campaignId: campaign.id,
            slotIndex: idx,
            scheduledAt: scheduledTime,
            offsetMinutes: s.offsetMinutes != null ? Number(s.offsetMinutes) : idx * interval,
            status: "pending",
            views: safeViews,
            likes: Number(s.likes || 0),
            comments: Number(s.comments || 0),
            shares: Number(s.shares || 0),
            saves: Number(s.saves || 0),
            reposts: Number(s.reposts || 0),
            commentLines: s.commentLines && Array.isArray(s.commentLines) && s.commentLines.length > 0
              ? JSON.stringify(s.commentLines)
              : null,
            metricPanelIds: s.metricPanelIds ? JSON.stringify(s.metricPanelIds) : null,
          },
        });
      });

      await Promise.all(slotCreations);

      return campaign;
    });

    return NextResponse.json({
      success: true,
      message: `Hybrid campaign "${result.name}" successfully launched with ${slotList.length} scheduled pulses!`,
      campaign: result,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create campaign" }, { status: 500 });
  }
}
