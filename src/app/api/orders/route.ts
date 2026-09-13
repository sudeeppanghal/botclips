import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { SmmPanelClient } from "@/lib/delivery/panel-client";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser();
    const whereClause: any = {};
    if (session && session.role !== "ADMIN") {
      whereClause.userId = session.id;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        service: { select: { name: true, platform: true } },
      },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      orders: []
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { error: "You must be signed in to place orders. Please sign in or create an account." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      serviceId,
      link,
      quantity,
      runs = 1,
      intervalMinutes = 0,
      charge = 0,
      category,
      service: serviceName,
      deliveryGraphId,
      deliveryGraphName,
      durationHours,
    } = body;

    if (!link || !quantity || Number(quantity) <= 0) {
      return NextResponse.json(
        { error: "Target link and valid quantity are required" },
        { status: 400 }
      );
    }

    // 1. Fetch user profile from database
    const dbUser = await prisma.user.findUnique({
      where: { id: session.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User account not found" }, { status: 404 });
    }

    // 2. Determine Execution Mode
    const isSubscriber = dbUser.planActive && (!dbUser.planExpiresAt || new Date(dbUser.planExpiresAt) > new Date());
    const isCustomApiMode = isSubscriber && dbUser.automationMode === "CUSTOM_API" && dbUser.customApiUrl && dbUser.customApiKey;

    // ──────────────── MODE 2: SUBSCRIBER'S OWN CONNECTED SMM API ────────────────
    if (isCustomApiMode) {
      let subscriberServiceId = serviceId;

      // Check if user has a mapped default service ID
      if (dbUser.defaultServices) {
        try {
          const defaults = JSON.parse(dbUser.defaultServices);
          if (category && defaults[category]) {
            subscriberServiceId = defaults[category];
          } else if (defaults.DEFAULT) {
            subscriberServiceId = defaults.DEFAULT;
          }
        } catch {}
      }

      let providerOrderId: string | null = null;
      try {
        const client = new SmmPanelClient(dbUser.customApiUrl!, dbUser.customApiKey!);
        const result = await client.addOrder({
          serviceId: subscriberServiceId || "1",
          link,
          quantity: Number(quantity),
          runs: Number(runs),
          interval: Number(intervalMinutes),
        });

        if (result && result.order) {
          providerOrderId = String(result.order);
        } else if (result && result.error) {
          return NextResponse.json(
            { error: `Your connected SMM panel returned an error: ${result.error}. Please check your panel balance and service ID.` },
            { status: 400 }
          );
        }
      } catch (err: any) {
        return NextResponse.json(
          { error: `Failed to dispatch order to your connected SMM panel: ${err.message}` },
          { status: 500 }
        );
      }

      // Ensure valid serviceId foreign key for Order model
      let dbService = await prisma.adminService.findFirst({
        where: {
          OR: [
            { id: String(serviceId) },
            { serviceId: String(serviceId) },
          ],
        },
      });
      if (!dbService) {
        dbService = await prisma.adminService.findFirst();
      }

      // Record order without deducting BotClips wallet balance (subscriber pays $5/$25 fee)
      const order = await prisma.order.create({
        data: {
          userId: dbUser.id,
          serviceId: dbService?.id || String(serviceId),
          link,
          quantity: Number(quantity),
          charge: 0, // Funded directly from subscriber's SMM panel balance
          runs: Number(runs),
          intervalMinutes: Number(intervalMinutes),
          curveStyle: deliveryGraphName ? `${deliveryGraphName} (${deliveryGraphId || "custom"})` : (deliveryGraphId || "CUSTOM_API"),
          providerOrderId,
          status: "PROCESSING",
        },
      });

      return NextResponse.json({
        success: true,
        mode: "CUSTOM_API",
        order,
        balance: dbUser.balance,
        message: "Order dispatched directly via your connected SMM Panel API!",
      });
    }

    // ──────────────── MODE 1: MANAGED SMM AUTO-DISPATCH WITH CUSTOM PRICING ────────────────
    // Look up service in AdminService catalog to determine custom selling price and upstream ID
    let mappedUpstreamServiceId = serviceId || "1";
    let calculatedRate = Number(charge || 0);
    let targetPanelId: string | null = null;
    let adminServiceRecord: any = null;

    try {
      const adminService = await prisma.adminService.findFirst({
        where: {
          OR: [
            { id: String(serviceId) },
            { serviceId: String(serviceId) },
            { name: { contains: String(serviceName || ""), mode: "insensitive" } },
          ],
          isActive: true,
        },
        include: { panel: true },
      });

      if (adminService) {
        adminServiceRecord = adminService;
        mappedUpstreamServiceId = adminService.serviceId;
        calculatedRate = adminService.customRate;
        targetPanelId = adminService.panelId;
      }
    } catch {}

    const totalQuantity = Number(runs) > 1 ? Number(quantity) * Number(runs) : Number(quantity);
    const totalCost = calculatedRate > 0 ? (totalQuantity / 1000) * calculatedRate : Number(charge || 0);

    // Verify wallet balance
    if (dbUser.balance < totalCost) {
      return NextResponse.json(
        {
          error: `Insufficient wallet balance. Available: ₹${dbUser.balance.toFixed(2)}, Required: ₹${totalCost.toFixed(2)}. Please add funds on your Wallet page.`,
        },
        { status: 400 }
      );
    }

    // Auto-deduct wallet balance
    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        balance: { decrement: totalCost },
        totalSpent: { increment: totalCost },
      },
    });

    // Find upstream panel to dispatch to
    let panel = null;
    if (targetPanelId) {
      panel = await prisma.panel.findUnique({ where: { id: targetPanelId } });
    }
    if (!panel || !panel.isActive) {
      panel = await prisma.panel.findFirst({ where: { isActive: true } });
    }

    let providerOrderId: string | null = null;

    if (panel && panel.apiUrl && panel.apiKeyEncrypted && panel.apiKeyEncrypted !== "PLACEHOLDER_KEY") {
      try {
        const client = new SmmPanelClient(panel.apiUrl, panel.apiKeyEncrypted);
        const result = await client.addOrder({
          serviceId: mappedUpstreamServiceId,
          link,
          quantity: Number(quantity),
          runs: Number(runs),
          interval: Number(intervalMinutes),
        });

        if (result && result.order) {
          providerOrderId = String(result.order);
        }
      } catch (panelErr) {
        console.error("Upstream SMM panel dispatch warning:", panelErr);
      }
    }

    // Record order in database
    const resolvedAdminService = adminServiceRecord || (await prisma.adminService.findFirst());
    const order = await prisma.order.create({
      data: {
        userId: dbUser.id,
        serviceId: resolvedAdminService ? resolvedAdminService.id : String(mappedUpstreamServiceId),
        panelId: panel?.id || null,
        link,
        quantity: Number(quantity),
        charge: totalCost,
        runs: Number(runs),
        intervalMinutes: Number(intervalMinutes),
        curveStyle: deliveryGraphName ? `${deliveryGraphName} (${deliveryGraphId || "custom"})` : (deliveryGraphId || "ORGANIC"),
        providerOrderId,
        status: "PROCESSING",
      },
    });

    return NextResponse.json({
      success: true,
      mode: "MANAGED",
      order,
      balance: updatedUser.balance,
      message: `Order submitted successfully! ₹${totalCost.toFixed(2)} deducted from balance.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process order" },
      { status: 500 }
    );
  }
}
