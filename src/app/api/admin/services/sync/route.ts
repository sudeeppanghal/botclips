import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { SmmPanelClient } from "@/lib/delivery/panel-client";

// POST /api/admin/services/sync - Auto-fetch real upstream rates and apply 3x markup
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let usdToInrRate = 96;
    try {
      const settings = await prisma.adminSettings.findUnique({ where: { id: "global" } });
      if (settings?.usdToInrRate) usdToInrRate = Number(settings.usdToInrRate);
    } catch {}

    const panels = await prisma.panel.findMany({
      where: { isActive: true },
      orderBy: { priority: "asc" }
    });

    if (panels.length === 0) {
      return NextResponse.json({ error: "No active SMM panels found" }, { status: 400 });
    }

    const upstreamMap = new Map<string, { rateInr: number; raw: any; panelId: string }>();

    for (const panel of panels) {
      if (panel.apiUrl && panel.apiKeyEncrypted && panel.apiKeyEncrypted !== "PLACEHOLDER_KEY") {
        try {
          const client = new SmmPanelClient(panel.apiUrl, panel.apiKeyEncrypted);
          const services = await client.getServices();
          if (Array.isArray(services)) {
            for (const s of services) {
              const rawRate = parseFloat(String(s.rate || 0));
              let rateInr = rawRate;
              if (panel.currency?.toUpperCase() === "USD") {
                rateInr = rawRate * usdToInrRate;
              }
              const sKey = String(s.service);
              if (!upstreamMap.has(sKey)) {
                upstreamMap.set(sKey, { rateInr, raw: s, panelId: panel.id });
              }
            }
          }
        } catch (err: any) {
          console.error(`Failed to fetch services from panel ${panel.name}:`, err.message);
        }
      }
    }

    const existingServices = await prisma.adminService.findMany();
    let updatedCount = 0;
    const updateResults: any[] = [];

    for (const srv of existingServices) {
      const matched = upstreamMap.get(String(srv.serviceId));
      if (matched && matched.rateInr > 0) {
        const realOriginalRate = Math.round(matched.rateInr * 100) / 100;
        // Strict 3x multiplier
        const custom3xRate = Math.max(1, Math.round(realOriginalRate * 3 * 100) / 100);

        await prisma.adminService.update({
          where: { id: srv.id },
          data: {
            originalRate: realOriginalRate,
            customRate: custom3xRate,
            minQuantity: matched.raw.min ? parseInt(String(matched.raw.min)) : srv.minQuantity,
            maxQuantity: matched.raw.max ? parseInt(String(matched.raw.max)) : srv.maxQuantity,
          }
        });

        updatedCount++;
        updateResults.push({
          id: srv.id,
          name: srv.name,
          serviceId: srv.serviceId,
          realCostInr: realOriginalRate,
          sellingRate3x: custom3xRate,
          profitMargin: Math.round((custom3xRate - realOriginalRate) * 100) / 100
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully fetched real prices for ${updatedCount} services and calculated 3x selling prices!`,
      updatedCount,
      totalUpstreamAvailable: upstreamMap.size,
      services: updateResults
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to sync prices" }, { status: 500 });
  }
}
