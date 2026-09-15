import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { SmmPanelClient } from "@/lib/delivery/panel-client";
import { generateOrganicPacedBatches } from "@/lib/delivery-graphs";

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
      take: 100,
      include: {
        service: { 
          select: { 
            id: true, 
            serviceId: true, 
            name: true, 
            platform: true,
            category: true,
            customRate: true,
            originalRate: true,
          } 
        },
        panel: {
          select: {
            id: true,
            name: true,
            apiUrl: true,
            status: true,
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          }
        }
      },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error("GET /api/orders error:", error);
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
      isCombo = false,
      comboData,
      jitterSchedule,
      platform,
      minQty,
      maxQty,
      isAutomatedTask = false,
    } = body;

    const cleanQuantity = Math.floor(Number(quantity));
    const cleanInterval = Math.max(0, Math.floor(Number(intervalMinutes) || 0));

    // Calculate runs and batch quantities for automated engagement tasks
    let calculatedRuns = Math.max(1, Math.floor(Number(runs) || 1));
    let batchQuantity = cleanQuantity;

    if (isAutomatedTask && minQty && maxQty && (Number(minQty) + Number(maxQty) > 0)) {
      const avgBatch = (Number(minQty) + Number(maxQty)) / 2;
      calculatedRuns = Math.max(1, Math.ceil(cleanQuantity / avgBatch));
      batchQuantity = Math.max(1, Math.round(cleanQuantity / calculatedRuns));
    }

    const cleanRuns = calculatedRuns;

    if (!link || !cleanQuantity || cleanQuantity <= 0 || isNaN(cleanQuantity)) {
      return NextResponse.json(
        { error: "Target link and valid positive quantity are required" },
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
        let result = await client.addOrder({
          serviceId: subscriberServiceId || "1",
          link,
          quantity: isAutomatedTask ? batchQuantity : Number(quantity),
          runs: calculatedRuns > 1 ? calculatedRuns : undefined,
          interval: cleanInterval > 0 ? cleanInterval : undefined,
        });

        // Automatic Fallback Retry: If upstream rejects dripfeed parameters, retry as a clean single bulk order
        if (result && result.error && (
          result.error.toLowerCase().includes("drip") || 
          result.error.toLowerCase().includes("runs") || 
          result.error.toLowerCase().includes("interval")
        )) {
          result = await client.addOrder({
            serviceId: subscriberServiceId || "1",
            link,
            quantity: Number(quantity),
          });
        }

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

    // ──────────────── MODE 3: WHOP CLIPPERS MULTI-SIGNAL VIRAL COMBO WITH JITTER ────────────────
    if (isCombo) {
      const totalCost = Number(charge || 0);

      if (totalCost <= 0 || isNaN(totalCost)) {
        return NextResponse.json(
          { error: "Invalid combo package price. Please select a valid combo package." },
          { status: 400 }
        );
      }

      if (dbUser.balance < totalCost) {
        return NextResponse.json(
          {
            error: `Insufficient wallet balance. Total combo cost is ₹${totalCost.toFixed(2)}, but you only have ₹${dbUser.balance.toFixed(2)}. Please add funds on your Wallet page.`,
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

      // Find default service and active panel
      const panel = await prisma.panel.findFirst({ where: { isActive: true } });
      const defaultService = (await prisma.adminService.findFirst({
        where: {
          platform: (platform as any) || "INSTAGRAM",
          isActive: true,
        },
      })) || (await prisma.adminService.findFirst());

      const numBatches = Number(comboData?.batches || runs || 12);
      const windowHours = Number(durationHours || 24);

      // Record combo order in database with non-linear jitter schedule
      const order = await prisma.order.create({
        data: {
          userId: dbUser.id,
          serviceId: defaultService ? defaultService.id : "srv_ig_106",
          panelId: panel?.id || null,
          link,
          quantity: Number(quantity),
          charge: totalCost,
          runs: numBatches,
          intervalMinutes: Math.max(5, Math.round((windowHours * 60) / numBatches)),
          curveStyle: deliveryGraphName ? `${deliveryGraphName} (${deliveryGraphId || "whop_clipper_organic_signature"})` : (deliveryGraphId || "WHOP_COMBO"),
          isCombo: true,
          comboData: JSON.stringify({
            ...comboData,
            jitterSchedulePreview: jitterSchedule ? jitterSchedule.slice(0, 15) : [],
          }),
          status: "PROCESSING",
        },
      });

      return NextResponse.json({
        success: true,
        mode: "WHOP_COMBO",
        order,
        balance: updatedUser.balance,
        message: `Whop Multi-Signal Combo launched successfully! ₹${totalCost.toFixed(2)} deducted. Jitter delivery active.`,
      });
    }

    // ──────────────── MODE 1: MANAGED SMM AUTO-DISPATCH WITH CUSTOM PRICING ────────────────
    // Look up service in AdminService catalog to determine custom selling price and upstream ID
    let mappedUpstreamServiceId = serviceId || "1";
    let targetPanelId: string | null = null;
    let adminServiceRecord: any = null;

    try {
      // 1. First priority: Exact match by serviceId (e.g. "5245") or internal id
      let adminService = null;
      if (serviceId) {
        adminService = await prisma.adminService.findFirst({
          where: {
            OR: [
              { id: String(serviceId) },
              { serviceId: String(serviceId) },
            ],
            isActive: true,
          },
          include: { panel: true },
        });
      }

      // 2. Fallback: only if serviceId not matched and serviceName has valid search text
      if (!adminService && serviceName && String(serviceName).trim().length >= 3) {
        const cleanSearch = String(serviceName).replace(/\s*\(\d+\)\s*$/, "").trim();
        if (cleanSearch.length >= 2) {
          adminService = await prisma.adminService.findFirst({
            where: {
              name: { contains: cleanSearch, mode: "insensitive" },
              isActive: true,
            },
            include: { panel: true },
          });
        }
      }

      if (adminService) {
        adminServiceRecord = adminService;
        mappedUpstreamServiceId = adminService.serviceId;
        targetPanelId = adminService.panelId;
      }
    } catch (lookupErr) {
      console.error("Error looking up service in database:", lookupErr);
    }

    if (!adminServiceRecord || Number(adminServiceRecord.customRate) <= 0) {
      return NextResponse.json(
        { error: "Selected service is currently unavailable or has invalid pricing. Please select another service." },
        { status: 400 }
      );
    }

    // Enforce min and max quantity limits
    if (adminServiceRecord.minQuantity && cleanQuantity < adminServiceRecord.minQuantity) {
      return NextResponse.json(
        { error: `Minimum quantity for this service is ${adminServiceRecord.minQuantity.toLocaleString()}` },
        { status: 400 }
      );
    }
    if (adminServiceRecord.maxQuantity && cleanQuantity > adminServiceRecord.maxQuantity) {
      return NextResponse.json(
        { error: `Maximum quantity for this service is ${adminServiceRecord.maxQuantity.toLocaleString()}` },
        { status: 400 }
      );
    }

    const totalQuantity = isAutomatedTask ? cleanQuantity : (cleanRuns > 1 ? cleanQuantity * cleanRuns : cleanQuantity);
    // Server-enforced custom rate strictly from adminService (never trust client-submitted charge)
    const serverRate = Number(adminServiceRecord.customRate);
    const totalCost = Number(((totalQuantity / 1000) * serverRate).toFixed(4));

    if (totalCost <= 0 || isNaN(totalCost)) {
      return NextResponse.json(
        { error: "Error calculating order cost. Please check service quantity." },
        { status: 400 }
      );
    }

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
    let upstreamError: string | null = null;
    let jitterBatches: any[] = [];
    let initialPulseQuantity = Number(quantity);

    // If automated engagement task, generate organic non-linear jitter pulses
    if (isAutomatedTask && minQty && maxQty && (Number(minQty) + Number(maxQty) > 0)) {
      jitterBatches = generateOrganicPacedBatches({
        goal: cleanQuantity,
        minQty: Number(minQty),
        maxQty: Number(maxQty),
        avgIntervalMinutes: cleanInterval > 0 ? cleanInterval : 20,
        startTime: new Date(),
      });
      if (jitterBatches.length > 0) {
        initialPulseQuantity = jitterBatches[0].views;
      }
    }

    if (panel && panel.apiUrl && panel.apiKeyEncrypted && panel.apiKeyEncrypted !== "PLACEHOLDER_KEY") {
      try {
        const client = new SmmPanelClient(panel.apiUrl, panel.apiKeyEncrypted);
        // Dispatch Pulse 1 directly to upstream SMM provider as a clean standalone order
        let result = await client.addOrder({
          serviceId: mappedUpstreamServiceId,
          link,
          quantity: initialPulseQuantity,
        });

        if (result && result.order) {
          providerOrderId = String(result.order);
          if (jitterBatches.length > 0) {
            jitterBatches[0].status = "DISPATCHED";
            jitterBatches[0].upstreamOrderId = String(result.order);
            jitterBatches[0].dispatchedAt = new Date().toISOString();
          }
        } else if (result && result.error) {
          upstreamError = result.error;
        }
      } catch (panelErr: any) {
        upstreamError = panelErr.message;
        console.error("Upstream SMM panel dispatch warning:", panelErr);
      }
    } else {
      upstreamError = "No active upstream SMM provider panel configured";
    }

    // If upstream rejected the order and no providerOrderId was generated:
    if (upstreamError && !providerOrderId) {
      // Auto-refund user wallet balance immediately
      const refundedUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          balance: { increment: totalCost },
          totalSpent: { decrement: totalCost },
        },
      });

      return NextResponse.json(
        { 
          error: `Upstream SMM API returned: "${upstreamError}". Please check your link format and service parameters. Your balance of ₹${totalCost.toFixed(2)} has been fully refunded.`,
          balance: refundedUser.balance
        },
        { status: 400 }
      );
    }

    // Record order in database with non-linear jitter schedule
    const resolvedAdminService = adminServiceRecord || (await prisma.adminService.findFirst());
    const finalRuns = jitterBatches.length > 0 ? jitterBatches.length : cleanRuns;
    const finalCurve = jitterBatches.length > 0 ? "ALGORITHMIC_JITTER" : (deliveryGraphName ? `${deliveryGraphName} (${deliveryGraphId || "custom"})` : "ORGANIC");
    const finalComboData = jitterBatches.length > 0 
      ? JSON.stringify({
          isJitterEngine: true,
          upstreamServiceId: mappedUpstreamServiceId,
          panelId: panel?.id,
          totalGoal: cleanQuantity,
          totalBatches: jitterBatches.length,
          batches: jitterBatches,
        })
      : null;

    const order = await prisma.order.create({
      data: {
        userId: dbUser.id,
        serviceId: resolvedAdminService ? resolvedAdminService.id : String(mappedUpstreamServiceId),
        panelId: panel?.id || null,
        link,
        quantity: Number(quantity),
        charge: totalCost,
        runs: finalRuns,
        intervalMinutes: Number(intervalMinutes),
        curveStyle: finalCurve,
        comboData: finalComboData,
        providerOrderId,
        status: providerOrderId ? "IN_PROGRESS" : "PROCESSING",
      },
      include: {
        panel: { select: { id: true, name: true, apiUrl: true } },
        service: { select: { name: true, serviceId: true, platform: true } },
      }
    });

    return NextResponse.json({
      success: true,
      mode: "MANAGED",
      order,
      balance: updatedUser.balance,
      message: `Order submitted successfully! Upstream Order #${providerOrderId || "Processing"}. ₹${totalCost.toFixed(2)} charged.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process order" },
      { status: 500 }
    );
  }
}
