import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET /api/admin/hybrid - Fetch Admin Hybrid Configuration & Stats
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const [settings, panels, activeServices, campaignsCount, subscribersCount] = await Promise.all([
      prisma.adminSettings.findUnique({ where: { id: "global" } }),
      prisma.panel.findMany({
        where: { isActive: true },
        select: { id: true, name: true, apiUrl: true, status: true, balance: true },
      }),
      prisma.adminService.findMany({
        where: { isActive: true },
        select: { id: true, name: true, category: true, serviceId: true, customRate: true, panelId: true },
      }),
      prisma.hybridCampaign.count(),
      prisma.user.count({
        where: { hybridPlanActive: true },
      }),
    ]);

    let metricPanels = {
      views: { panelId: "", serviceId: "" },
      likes: { panelId: "", serviceId: "" },
      comments: { panelId: "", serviceId: "" },
      shares: { panelId: "", serviceId: "" },
      saves: { panelId: "", serviceId: "" },
      reposts: { panelId: "", serviceId: "" },
    };

    if (settings?.hybridMetricPanels) {
      try {
        metricPanels = { ...metricPanels, ...JSON.parse(settings.hybridMetricPanels) };
      } catch {}
    }

    return NextResponse.json({
      success: true,
      config: {
        subscriptionPriceUsd: settings?.hybridSubscriptionPriceUsd ?? 50.0,
        enabled: settings?.hybridEnabled ?? true,
        minDelay: settings?.hybridMinDelay ?? 2,
        maxDelay: settings?.hybridMaxDelay ?? 6,
        humanMode: settings?.hybridHumanMode ?? true,
        metricPanels,
      },
      stats: {
        totalCampaigns: campaignsCount,
        activeSubscribers: subscribersCount,
      },
      availablePanels: panels,
      availableServices: activeServices,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load admin hybrid config" }, { status: 500 });
  }
}

// POST /api/admin/hybrid - Update Settings or Grant User Subscription
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    // Action 1: Grant VIP Access to specific user
    if (action === "grant_user") {
      const { email, days = 30 } = body;
      const targetUser = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
      });

      if (!targetUser) {
        return NextResponse.json({ error: `User with email ${email} not found.` }, { status: 404 });
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + Number(days));

      await prisma.user.update({
        where: { id: targetUser.id },
        data: {
          hybridPlanActive: true,
          hybridExpiresAt: expiresAt,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Granted ${days} days Hybrid VIP access to ${targetUser.email}`,
      });
    }

    // Action 2: Revoke VIP Access
    if (action === "revoke_user") {
      const { email } = body;
      if (!email) {
        return NextResponse.json({ error: "Email is required." }, { status: 400 });
      }
      const updated = await prisma.user.updateMany({
        where: { email: email.trim().toLowerCase() },
        data: { hybridPlanActive: false },
      });
      if (updated.count === 0) {
        return NextResponse.json({ error: `User with email ${email} not found.` }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: `Revoked Hybrid VIP access for ${email}`,
      });
    }

    // Action 3: Save Global Config
    const { subscriptionPriceUsd, enabled, minDelay, maxDelay, humanMode, metricPanels } = body;

    const updated = await prisma.adminSettings.upsert({
      where: { id: "global" },
      update: {
        ...(subscriptionPriceUsd !== undefined ? { hybridSubscriptionPriceUsd: Number(subscriptionPriceUsd) } : {}),
        ...(enabled !== undefined ? { hybridEnabled: Boolean(enabled) } : {}),
        ...(minDelay !== undefined ? { hybridMinDelay: Number(minDelay) } : {}),
        ...(maxDelay !== undefined ? { hybridMaxDelay: Number(maxDelay) } : {}),
        ...(humanMode !== undefined ? { hybridHumanMode: Boolean(humanMode) } : {}),
        ...(metricPanels ? { hybridMetricPanels: JSON.stringify(metricPanels) } : {}),
      },
      create: {
        id: "global",
        hybridSubscriptionPriceUsd: Number(subscriptionPriceUsd || 50.0),
        hybridEnabled: Boolean(enabled ?? true),
        hybridMinDelay: Number(minDelay || 2),
        hybridMaxDelay: Number(maxDelay || 6),
        hybridHumanMode: Boolean(humanMode ?? true),
        hybridMetricPanels: metricPanels ? JSON.stringify(metricPanels) : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Hybrid Automation settings saved successfully.",
      settings: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update admin hybrid settings" }, { status: 500 });
  }
}
