import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { SmmPanelClient } from "@/lib/delivery/panel-client";

function detectPlatform(text: string): string {
  const t = text.toUpperCase();
  if (t.includes("INSTAGRAM") || t.includes("REELS") || t.includes("IG ")) return "INSTAGRAM";
  if (t.includes("YOUTUBE") || t.includes("YT ") || t.includes("SHORTS") || t.includes("SUBSCRIBER")) return "YOUTUBE";
  if (t.includes("TIKTOK") || t.includes("TT ")) return "TIKTOK";
  if (t.includes("TWITTER") || t.includes("X -") || t.includes(" X ")) return "TWITTER";
  if (t.includes("TELEGRAM") || t.includes("TG ")) return "TELEGRAM";
  if (t.includes("FACEBOOK") || t.includes("FB ")) return "FACEBOOK";
  if (t.includes("SPOTIFY")) return "SPOTIFY";
  return "OTHER";
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform") || "ALL";

    // 1. Fetch Farm Mode Packages from database
    const farmWhere: any = { isFarm: true };
    if (platform !== "ALL") {
      farmWhere.platform = platform;
    }

    const farmPackages = await prisma.adminService.findMany({
      where: farmWhere,
      orderBy: [{ platform: "asc" }, { customRate: "asc" }],
      include: {
        panel: {
          select: { id: true, name: true, apiUrl: true, status: true, balance: true, currency: true },
        },
      },
    });

    // 2. Fetch Active SMM Panels
    const panels = await prisma.panel.findMany({
      where: { isActive: true },
      orderBy: { priority: "asc" },
      select: { id: true, name: true, apiUrl: true, apiKeyEncrypted: true, status: true, balance: true, currency: true },
    });

    // 2.5 Fetch manual custom price overrides for upstream/premium services
    const premiumOverrides = await prisma.adminService.findMany({
      where: { isFarm: false, isActive: true },
      select: { id: true, panelId: true, serviceId: true, customRate: true },
    });
    const overrideMap = new Map<string, { id: string; customRate: number }>();
    for (const o of premiumOverrides) {
      overrideMap.set(`${o.panelId}_${o.serviceId}`, { id: o.id, customRate: o.customRate });
    }

    // 3. Auto dynamically fetch upstream services from all active panels
    const upstreamServices: any[] = [];
    for (const panel of panels) {
      if (panel.apiUrl && panel.apiKeyEncrypted && panel.apiKeyEncrypted !== "PLACEHOLDER_KEY") {
        try {
          const client = new SmmPanelClient(panel.apiUrl, panel.apiKeyEncrypted);
          const rawServices = await client.getServices();
          if (Array.isArray(rawServices)) {
            for (const raw of rawServices) {
              const rawCost = parseFloat(String(raw.rate || 0));
              if (rawCost <= 0) continue;

              let costInr = rawCost;
              if (panel.currency?.toUpperCase() === "USD") {
                costInr = rawCost * 96;
              }
              const defaultSellingRate = Math.max(1, Math.round(costInr * 3 * 100) / 100);

              const plat = detectPlatform(`${raw.category || ""} ${raw.name || ""}`);
              if (platform !== "ALL" && plat !== platform) {
                continue;
              }

              const override = overrideMap.get(`${panel.id}_${String(raw.service)}`);
              const sellingRate = override ? override.customRate : defaultSellingRate;

              upstreamServices.push({
                serviceId: String(raw.service),
                panelId: panel.id,
                panelName: panel.name,
                name: raw.name,
                category: raw.category || "General",
                platform: plat,
                originalRate: costInr,
                sellingRate, // Custom price if overridden, otherwise 3x price
                defaultSellingRate,
                isCustomPrice: !!override,
                overrideId: override?.id || null,
                minQuantity: Number(raw.min) || 10,
                maxQuantity: Number(raw.max) || 1000000,
                type: raw.type || "Default",
              });
            }
          }
        } catch (err: any) {
          console.error(`Admin auto-fetch error from panel ${panel.id}:`, err.message);
        }
      }
    }

    // Platform count breakdown for fast tab counters
    const platformCounts: Record<string, { farm: number; upstream: number }> = {
      ALL: { farm: farmPackages.length, upstream: upstreamServices.length },
      INSTAGRAM: { farm: 0, upstream: 0 },
      YOUTUBE: { farm: 0, upstream: 0 },
      TIKTOK: { farm: 0, upstream: 0 },
      TWITTER: { farm: 0, upstream: 0 },
      TELEGRAM: { farm: 0, upstream: 0 },
      FACEBOOK: { farm: 0, upstream: 0 },
      OTHER: { farm: 0, upstream: 0 },
    };

    for (const f of farmPackages) {
      const p = f.platform || "OTHER";
      if (!platformCounts[p]) platformCounts[p] = { farm: 0, upstream: 0 };
      platformCounts[p].farm++;
    }

    for (const u of upstreamServices) {
      const p = u.platform || "OTHER";
      if (!platformCounts[p]) platformCounts[p] = { farm: 0, upstream: 0 };
      platformCounts[p].upstream++;
    }

    return NextResponse.json({
      success: true,
      farmPackages,
      upstreamServices,
      panels: panels.map(p => ({
        id: p.id,
        name: p.name,
        apiUrl: p.apiUrl,
        status: p.status,
        balance: p.balance,
        currency: p.currency,
      })),
      platformCounts,
    });
  } catch (error: any) {
    console.error("GET /api/admin/services error:", error);
    return NextResponse.json({ error: error.message || "Failed to load services" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    // ──────────────── 1. QUICK INLINE UPDATE CUSTOM PRICE ────────────────
    if (action === "quick-update-price") {
      const { id, customRate } = body;
      if (!id || customRate === undefined) {
        return NextResponse.json({ error: "Service ID and custom rate are required" }, { status: 400 });
      }

      const updated = await prisma.adminService.update({
        where: { id },
        data: { customRate: parseFloat(String(customRate)) },
      });

      return NextResponse.json({ success: true, service: updated });
    }

    // ──────────────── 1.5 UPDATE PREMIUM MODE CUSTOM PRICE OVERRIDE ────────────────
    if (action === "update-premium-price") {
      const { panelId, serviceId, customRate, name, platform = "OTHER", category = "General", originalRate = 0, minQuantity = 10, maxQuantity = 1000000 } = body;
      if (!panelId || !serviceId || customRate === undefined) {
        return NextResponse.json({ error: "Panel ID, service ID, and custom rate are required" }, { status: 400 });
      }

      const numRate = parseFloat(String(customRate));
      if (isNaN(numRate) || numRate <= 0) {
        return NextResponse.json({ error: "Please provide a valid price greater than 0" }, { status: 400 });
      }

      const existing = await prisma.adminService.findFirst({
        where: {
          panelId,
          serviceId: String(serviceId),
          isFarm: false,
        },
      });

      let updatedService;
      if (existing) {
        updatedService = await prisma.adminService.update({
          where: { id: existing.id },
          data: {
            customRate: numRate,
            originalRate: originalRate ? parseFloat(String(originalRate)) : existing.originalRate,
            isActive: true,
          },
        });
      } else {
        updatedService = await prisma.adminService.create({
          data: {
            id: `srv_prem_${Date.now()}`,
            panelId,
            platform: platform as any,
            category: category || "General",
            name: name || `Service #${serviceId}`,
            serviceId: String(serviceId),
            originalRate: parseFloat(String(originalRate)),
            customRate: numRate,
            minQuantity: parseInt(String(minQuantity), 10),
            maxQuantity: parseInt(String(maxQuantity), 10),
            isFarm: false,
            badge: "PREMIUM OVERRIDE",
            isActive: true,
          },
        });
      }

      try {
        await prisma.serviceChangeLog.create({
          data: {
            serviceId: updatedService.id,
            serviceName: updatedService.name,
            platform: updatedService.platform,
            oldProviderId: String(serviceId),
            newProviderId: String(serviceId),
            oldRate: existing ? existing.customRate : null,
            newRate: numRate,
            reason: "Admin updated premium mode selling price",
            changedBy: session.email || "Admin",
          },
        });
      } catch {}

      return NextResponse.json({
        success: true,
        message: `Custom price updated to ₹${numRate.toFixed(2)}`,
        service: updatedService,
      });
    }

    // ──────────────── 1.6 RESET PREMIUM MODE PRICE TO DEFAULT 3X ────────────────
    if (action === "reset-premium-price") {
      const { panelId, serviceId } = body;
      if (!panelId || !serviceId) {
        return NextResponse.json({ error: "Panel ID and Service ID required" }, { status: 400 });
      }

      await prisma.adminService.deleteMany({
        where: {
          panelId,
          serviceId: String(serviceId),
          isFarm: false,
        },
      });

      return NextResponse.json({ success: true, message: "Reset to default 3x pricing" });
    }

    // ──────────────── 2. SAVE OR UPDATE FARM/GENERAL PACKAGE ────────────────
    if (action === "save-farm-package" || !action) {
      const {
        id,
        panelId,
        platform = "INSTAGRAM",
        category = "General",
        name,
        serviceId,
        fallbackServiceIds,
        originalRate = 0,
        customRate,
        minQuantity = 10,
        maxQuantity = 1000000,
        badge = "ALGORITHM FARM",
        reason,
        isActive = true,
      } = body;

      if (!name || !serviceId || customRate === undefined) {
        return NextResponse.json(
          { error: "Service name, upstream service ID, and custom price are required" },
          { status: 400 }
        );
      }

      // Default panel if not provided
      let targetPanelId = panelId;
      if (!targetPanelId) {
        const defaultPanel = await prisma.panel.findFirst({ where: { isActive: true } });
        targetPanelId = defaultPanel?.id;
      }

      if (!targetPanelId) {
        return NextResponse.json({ error: "Please connect an active SMM panel first" }, { status: 400 });
      }

      const existing = id ? await prisma.adminService.findUnique({ where: { id } }) : null;
      // Farm packages MUST have isFarm: true by default
      const isFarmValue = body.isFarm !== undefined ? Boolean(body.isFarm) : true;

      const service = await prisma.adminService.upsert({
        where: { id: id || `srv_${Date.now()}` },
        create: {
          id: id || `srv_${Date.now()}`,
          panelId: targetPanelId,
          platform: platform as any,
          category,
          name,
          serviceId: String(serviceId),
          fallbackServiceIds: fallbackServiceIds ? String(fallbackServiceIds) : null,
          originalRate: parseFloat(String(originalRate)),
          customRate: parseFloat(String(customRate)),
          minQuantity: parseInt(String(minQuantity), 10),
          maxQuantity: parseInt(String(maxQuantity), 10),
          isFarm: isFarmValue,
          badge: badge || "ALGORITHM FARM",
          isActive: isActive !== false,
        },
        update: {
          panelId: targetPanelId,
          platform: platform as any,
          category,
          name,
          serviceId: String(serviceId),
          fallbackServiceIds: fallbackServiceIds !== undefined ? (fallbackServiceIds ? String(fallbackServiceIds) : null) : undefined,
          originalRate: originalRate !== undefined ? parseFloat(String(originalRate)) : undefined,
          customRate: customRate !== undefined ? parseFloat(String(customRate)) : undefined,
          minQuantity: minQuantity !== undefined ? parseInt(String(minQuantity), 10) : undefined,
          maxQuantity: maxQuantity !== undefined ? parseInt(String(maxQuantity), 10) : undefined,
          isFarm: isFarmValue,
          badge: badge || undefined,
          isActive: isActive !== false,
        },
      });

      // Record Audit Trail Log
      try {
        await prisma.serviceChangeLog.create({
          data: {
            serviceId: service.id,
            serviceName: service.name,
            platform: service.platform,
            oldProviderId: existing?.serviceId || null,
            newProviderId: service.serviceId,
            oldRate: existing ? existing.customRate : null,
            newRate: service.customRate,
            reason: reason || (existing ? "Admin catalog price/ID update" : "New service mapping created"),
            changedBy: session.email || "Admin",
          },
        });
      } catch (logErr) {
        console.warn("Failed to create service change log:", logErr);
      }

      return NextResponse.json({ success: true, service });
    }

    // ──────────────── 3. PROMOTE UPSTREAM SERVICE TO FARM PACKAGE ────────────────
    if (action === "promote-to-farm") {
      const {
        serviceId,
        panelId,
        name,
        platform = "INSTAGRAM",
        category = "Farm Packages",
        originalRate = 0,
        customRate,
        minQuantity = 10,
        maxQuantity = 1000000,
        badge = "ALGORITHM FARM",
      } = body;

      if (!serviceId || !name || customRate === undefined) {
        return NextResponse.json(
          { error: "Service ID, package name, and custom price are required" },
          { status: 400 }
        );
      }

      let targetPanelId = panelId;
      if (!targetPanelId) {
        const defaultPanel = await prisma.panel.findFirst({ where: { isActive: true } });
        targetPanelId = defaultPanel?.id;
      }

      const newFarmService = await prisma.adminService.create({
        data: {
          id: `farm_${Date.now()}`,
          panelId: targetPanelId!,
          platform: platform as any,
          category,
          name,
          serviceId: String(serviceId),
          originalRate: parseFloat(String(originalRate)),
          customRate: parseFloat(String(customRate)),
          minQuantity: parseInt(String(minQuantity), 10),
          maxQuantity: parseInt(String(maxQuantity), 10),
          isFarm: true,
          badge,
          isActive: true,
        },
      });

      return NextResponse.json({ success: true, service: newFarmService });
    }

    // ──────────────── 4. TOGGLE ACTIVE STATUS ────────────────
    if (action === "toggle-status") {
      const { id } = body;
      const current = await prisma.adminService.findUnique({ where: { id } });
      if (!current) {
        return NextResponse.json({ error: "Service not found" }, { status: 404 });
      }

      const updated = await prisma.adminService.update({
        where: { id },
        data: { isActive: !current.isActive },
      });

      return NextResponse.json({ success: true, isActive: updated.isActive });
    }

    // ──────────────── 5. DELETE FARM PACKAGE ────────────────
    if (action === "delete") {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ error: "Service ID is required" }, { status: 400 });
      }

      await prisma.adminService.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/admin/services error:", error);
    return NextResponse.json({ error: error.message || "Failed to process request" }, { status: 500 });
  }
}
