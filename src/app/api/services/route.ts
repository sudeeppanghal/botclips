import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SmmPanelClient } from "@/lib/delivery/panel-client";

// In-memory cache for upstream services with 10-minute TTL
let upstreamCache: {
  timestamp: number;
  services: any[];
} | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000;

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

function cleanServiceName(rawName: string, isFarm: boolean): string {
  let name = rawName
    // Remove emojis
    .replace(/[^\x00-\x7F]/g, "")
    // Remove vendor watermarks and internal keywords
    .replace(/\b(JAP|Peakerr|SMMWorld|SMMKings|HQ-Server|S1|S2|S3|Main Provider|Direct)\b/gi, "")
    // Remove bracket tags with server info
    .replace(/\[(?:Provider|Cheapest|Server|Fast Server)[^\]]*\]/gi, "")
    .trim();

  // Normalize spaces and trim punctuation
  name = name.replace(/\s+/g, " ").replace(/^[-|:\s]+|[-|:\s]+$/g, "").trim();

  if (isFarm) {
    return name.startsWith("BotClips Farm") ? name : `BotClips Farm - ${name}`;
  }
  return name.startsWith("BotClips Premium") ? name : `BotClips Premium - ${name}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "FARM"; // "FARM" | "PREMIUM" | "ALL"
    const platform = searchParams.get("platform") || "ALL";
    const search = (searchParams.get("search") || "").toLowerCase().trim();

    // ──────────────── 1. FETCH FARM SERVICES (ADMIN CONFIGURED PACKAGES) ────────────────
    const farmWhere: any = { isActive: true };
    if (platform !== "ALL") {
      farmWhere.platform = platform;
    }

    const farmDbServices = await prisma.adminService.findMany({
      where: farmWhere,
      orderBy: [{ isFarm: "desc" }, { platform: "asc" }, { customRate: "asc" }],
      select: {
        id: true,
        platform: true,
        category: true,
        name: true,
        serviceId: true,
        customRate: true,
        originalRate: true,
        minQuantity: true,
        maxQuantity: true,
        badge: true,
        isFarm: true,
      },
    });

    const farmList = farmDbServices.map((s) => {
      const rateInr = Number(s.customRate || 0);
      const rateUsd = Number((rateInr / 96).toFixed(2));
      return {
        id: s.id,
        serviceId: s.serviceId,
        platform: s.platform,
        cat: s.category,
        category: s.category,
        name: s.name,
        rate: rateInr,
        rateInr,
        rateUsd,
        rateInrFormatted: `₹${rateInr.toFixed(2)}`,
        rateUsdFormatted: `$${rateUsd.toFixed(2)}`,
        min: s.minQuantity,
        max: s.maxQuantity,
        badge: s.badge || "ALGORITHM FARM",
        isFarm: true,
      };
    });

    // ──────────────── 2. FETCH PREMIUM SERVICES (AUTO-FETCHED FROM SMM PANELS AT 3X) ────────────────
    let premiumList: any[] = [];

    // Only load upstream if PREMIUM or ALL mode requested, or check cache
    if (mode === "PREMIUM" || mode === "ALL") {
      const now = Date.now();
      if (upstreamCache && now - upstreamCache.timestamp < CACHE_TTL_MS) {
        premiumList = upstreamCache.services;
      } else {
        // Auto-fetch from active connected SMM panels
        const activePanels = await prisma.panel.findMany({
          where: { isActive: true },
          orderBy: { priority: "asc" },
        });

        const fetchedAll: any[] = [];

        for (const panel of activePanels) {
          if (!panel.apiUrl || !panel.apiKeyEncrypted || panel.apiKeyEncrypted === "PLACEHOLDER_KEY") {
            continue;
          }

          try {
            const client = new SmmPanelClient(panel.apiUrl, panel.apiKeyEncrypted);
            const rawServices = await client.getServices();

            if (Array.isArray(rawServices)) {
              for (const raw of rawServices) {
                const rawRate = parseFloat(String(raw.rate || 0));
                if (rawRate <= 0) continue;

                // 3X PRICE MULTIPLIER (Cost price * 3)
                // If panel currency is USD, convert to INR first (* 96) then * 3
                let rateInr = rawRate;
                if (panel.currency?.toUpperCase() === "USD") {
                  rateInr = rawRate * 96;
                }
                const sellingRate = Math.max(1, Math.round(rateInr * 3 * 100) / 100);
                const sellingUsd = Math.round((sellingRate / 96) * 100) / 100;

                const detectedPlat = detectPlatform(`${raw.category || ""} ${raw.name || ""}`);
                const cleanName = cleanServiceName(raw.name || `Service ${raw.service}`, false);

                fetchedAll.push({
                  id: `prem_${panel.id}_${raw.service}`,
                  serviceId: String(raw.service),
                  panelId: panel.id,
                  platform: detectedPlat,
                  category: raw.category || "General Services",
                  cat: raw.category || "General Services",
                  name: cleanName,
                  rate: sellingRate, // Clean 3x rate presented directly
                  rateInr: sellingRate,
                  rateUsd: sellingUsd,
                  rateInrFormatted: `₹${sellingRate.toFixed(2)}`,
                  rateUsdFormatted: `$${sellingUsd.toFixed(2)}`,
                  min: Number(raw.min) || 10,
                  max: Number(raw.max) || 1000000,
                  badge: "PREMIUM SPEED",
                  isFarm: false,
                });
              }
            }
          } catch (err: any) {
            console.error(`Error fetching services from panel ${panel.id}:`, err.message);
          }
        }

        // Cache the parsed 3x catalog
        if (fetchedAll.length > 0) {
          upstreamCache = {
            timestamp: now,
            services: fetchedAll,
          };
          premiumList = fetchedAll;
        }
      }
    }

    // Apply platform & search filters to premiumList if in PREMIUM mode
    let filteredPremium = premiumList;
    if (platform !== "ALL") {
      filteredPremium = filteredPremium.filter((s) => s.platform === platform);
    }
    if (search) {
      filteredPremium = filteredPremium.filter(
        (s) =>
          s.name.toLowerCase().includes(search) ||
          s.category.toLowerCase().includes(search) ||
          s.serviceId.includes(search)
      );
    }

    // Determine what array to return as primary `services` based on requested mode
    let outputServices: any[] = [];
    if (mode === "PREMIUM") {
      outputServices = filteredPremium;
    } else if (mode === "ALL") {
      outputServices = [...farmList, ...filteredPremium];
    } else {
      // Default: FARM mode
      outputServices = farmList;
      if (search) {
        outputServices = outputServices.filter(
          (s) =>
            s.name.toLowerCase().includes(search) ||
            s.category.toLowerCase().includes(search) ||
            s.serviceId.includes(search)
        );
      }
    }

    return NextResponse.json({
      success: true,
      mode,
      services: outputServices,
      farmServices: farmList,
      premiumCount: premiumList.length,
      farmCount: farmList.length,
    });
  } catch (error: any) {
    console.error("GET /api/services error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load services" },
      { status: 500 }
    );
  }
}
