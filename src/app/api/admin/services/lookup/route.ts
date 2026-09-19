import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { SmmPanelClient } from "@/lib/delivery/panel-client";

// GET /api/admin/services/lookup?serviceId=7537 - Lookup real upstream price & calculate 3x
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("serviceId");

    if (!serviceId) {
      return NextResponse.json({ error: "serviceId is required" }, { status: 400 });
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

    for (const panel of panels) {
      if (panel.apiUrl && panel.apiKeyEncrypted && panel.apiKeyEncrypted !== "PLACEHOLDER_KEY") {
        try {
          const client = new SmmPanelClient(panel.apiUrl, panel.apiKeyEncrypted);
          const services = await client.getServices();
          if (Array.isArray(services)) {
            const matched = services.find((s: any) => String(s.service) === String(serviceId));
            if (matched) {
              const rawRate = parseFloat(String(matched.rate || 0));
              let rateInr = rawRate;
              if (panel.currency?.toUpperCase() === "USD") {
                rateInr = rawRate * usdToInrRate;
              }
              const realOriginalRate = Math.round(rateInr * 100) / 100;
              const suggested3xRate = Math.max(1, Math.round(realOriginalRate * 3 * 100) / 100);

              let detectedPlatform = "INSTAGRAM";
              const nameLower = (matched.name || "").toLowerCase();
              if (nameLower.includes("tiktok")) detectedPlatform = "TIKTOK";
              else if (nameLower.includes("youtube") || nameLower.includes("shorts")) detectedPlatform = "YOUTUBE";
              else if (nameLower.includes("telegram")) detectedPlatform = "TELEGRAM";
              else if (nameLower.includes("twitter") || nameLower.includes("x ")) detectedPlatform = "X";

              return NextResponse.json({
                success: true,
                service: {
                  serviceId: String(matched.service),
                  name: matched.name,
                  category: matched.category || "General",
                  platform: detectedPlatform,
                  originalRate: realOriginalRate,
                  customRate: suggested3xRate,
                  minQuantity: parseInt(String(matched.min || 10)),
                  maxQuantity: parseInt(String(matched.max || 100000)),
                  panelId: panel.id,
                  panelName: panel.name
                }
              });
            }
          }
        } catch {}
      }
    }

    return NextResponse.json({ error: "Service ID not found in upstream providers" }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to lookup service" }, { status: 500 });
  }
}
