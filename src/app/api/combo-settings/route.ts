import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DEFAULT_COMBO_MAPPINGS = {
  INSTAGRAM: {
    viewsServiceId: "srv_ig_106",
    likesServiceId: "srv_ig_104",
    sharesServiceId: "srv_ig_110",
    savesServiceId: "srv_ig_110",
    commentsServiceId: "srv_ig_108",
    defaultRatios: {
      views: 10000,
      likes: 950,
      shares: 180,
      saves: 90,
      comments: 35
    },
    jitterConfig: {
      defaultCurve: "TIKTOK_REELS_S_CURVE",
      minBatches: 8,
      maxBatches: 36,
      humanVariancePercent: 15,
      allowEngagementOnly: true,
      allowViewsOnly: true,
      avgIntervalMinutes: 15
    }
  },
  TIKTOK: {
    viewsServiceId: "srv_tk_302",
    likesServiceId: "srv_tk_304",
    sharesServiceId: "srv_tk_305",
    savesServiceId: "srv_tk_305",
    commentsServiceId: "srv_tk_304",
    defaultRatios: {
      views: 10000,
      likes: 850,
      shares: 200,
      saves: 110,
      comments: 30
    },
    jitterConfig: {
      defaultCurve: "TIKTOK_REELS_S_CURVE",
      minBatches: 8,
      maxBatches: 36,
      humanVariancePercent: 15,
      allowEngagementOnly: true,
      allowViewsOnly: true,
      avgIntervalMinutes: 12
    }
  },
  YOUTUBE: {
    viewsServiceId: "srv_yt_203",
    likesServiceId: "srv_yt_205",
    sharesServiceId: "srv_yt_205",
    savesServiceId: "srv_yt_205",
    commentsServiceId: "srv_yt_207",
    defaultRatios: {
      views: 5000,
      likes: 450,
      shares: 100,
      saves: 50,
      comments: 25
    },
    jitterConfig: {
      defaultCurve: "YOUTUBE_SHORTS_DRIP",
      minBatches: 6,
      maxBatches: 24,
      humanVariancePercent: 15,
      allowEngagementOnly: true,
      allowViewsOnly: true,
      avgIntervalMinutes: 20
    }
  }
};

export async function GET() {
  try {
    const settings = await prisma.adminSettings.findUnique({
      where: { id: "global" }
    });

    let comboSettings: any = DEFAULT_COMBO_MAPPINGS;
    if (settings?.comboDefaults) {
      try {
        const parsed = JSON.parse(settings.comboDefaults);
        comboSettings = {
          INSTAGRAM: {
            ...DEFAULT_COMBO_MAPPINGS.INSTAGRAM,
            ...parsed.INSTAGRAM,
            defaultRatios: { ...DEFAULT_COMBO_MAPPINGS.INSTAGRAM.defaultRatios, ...parsed.INSTAGRAM?.defaultRatios },
            jitterConfig: { ...DEFAULT_COMBO_MAPPINGS.INSTAGRAM.jitterConfig, ...parsed.INSTAGRAM?.jitterConfig }
          },
          TIKTOK: {
            ...DEFAULT_COMBO_MAPPINGS.TIKTOK,
            ...parsed.TIKTOK,
            defaultRatios: { ...DEFAULT_COMBO_MAPPINGS.TIKTOK.defaultRatios, ...parsed.TIKTOK?.defaultRatios },
            jitterConfig: { ...DEFAULT_COMBO_MAPPINGS.TIKTOK.jitterConfig, ...parsed.TIKTOK?.jitterConfig }
          },
          YOUTUBE: {
            ...DEFAULT_COMBO_MAPPINGS.YOUTUBE,
            ...parsed.YOUTUBE,
            defaultRatios: { ...DEFAULT_COMBO_MAPPINGS.YOUTUBE.defaultRatios, ...parsed.YOUTUBE?.defaultRatios },
            jitterConfig: { ...DEFAULT_COMBO_MAPPINGS.YOUTUBE.jitterConfig, ...parsed.YOUTUBE?.jitterConfig }
          },
        };
      } catch {}
    }

    const services = await prisma.adminService.findMany({
      where: { isActive: true },
      select: {
        id: true,
        serviceId: true,
        platform: true,
        category: true,
        name: true,
        customRate: true,
        minQuantity: true,
        maxQuantity: true
      },
      orderBy: { platform: "asc" }
    });

    const findSvc = (idOrSvcId: string, plat: string) => {
      if (!idOrSvcId) return null;
      return (
        services.find(s => s.id === idOrSvcId || s.serviceId === idOrSvcId) ||
        services.find(s => s.platform === plat && s.id === idOrSvcId) ||
        null
      );
    };

    const resolvedRates: Record<string, any> = {};
    for (const plat of ["INSTAGRAM", "TIKTOK", "YOUTUBE"]) {
      const cfg = comboSettings[plat] || (DEFAULT_COMBO_MAPPINGS as any)[plat];
      const vSvc = findSvc(cfg?.viewsServiceId, plat);
      const lSvc = findSvc(cfg?.likesServiceId, plat);
      const shSvc = findSvc(cfg?.sharesServiceId, plat);
      const saSvc = findSvc(cfg?.savesServiceId, plat);
      const cSvc = findSvc(cfg?.commentsServiceId, plat);

      resolvedRates[plat] = {
        viewsRate: vSvc?.customRate ?? (plat === "TIKTOK" ? 18.0 : plat === "YOUTUBE" ? 60.0 : 15.0),
        likesRate: lSvc?.customRate ?? (plat === "TIKTOK" ? 90.0 : plat === "YOUTUBE" ? 150.0 : 45.0),
        sharesRate: shSvc?.customRate ?? (plat === "TIKTOK" ? 60.0 : plat === "YOUTUBE" ? 80.0 : 36.0),
        savesRate: saSvc?.customRate ?? (plat === "TIKTOK" ? 60.0 : plat === "YOUTUBE" ? 80.0 : 36.0),
        commentsRate: cSvc?.customRate ?? (plat === "TIKTOK" ? 250.0 : plat === "YOUTUBE" ? 350.0 : 360.0),
        viewsService: vSvc ? { id: vSvc.id, serviceId: vSvc.serviceId, name: vSvc.name, customRate: vSvc.customRate, minQuantity: vSvc.minQuantity } : null,
        likesService: lSvc ? { id: lSvc.id, serviceId: lSvc.serviceId, name: lSvc.name, customRate: lSvc.customRate, minQuantity: lSvc.minQuantity } : null,
        sharesService: shSvc ? { id: shSvc.id, serviceId: shSvc.serviceId, name: shSvc.name, customRate: shSvc.customRate, minQuantity: shSvc.minQuantity } : null,
        savesService: saSvc ? { id: saSvc.id, serviceId: saSvc.serviceId, name: saSvc.name, customRate: saSvc.customRate, minQuantity: saSvc.minQuantity } : null,
        commentsService: cSvc ? { id: cSvc.id, serviceId: cSvc.serviceId, name: cSvc.name, customRate: cSvc.customRate, minQuantity: cSvc.minQuantity } : null,
      };
    }

    return NextResponse.json({
      success: true,
      comboSettings,
      resolvedRates,
      availableServices: services
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      comboSettings: DEFAULT_COMBO_MAPPINGS,
      resolvedRates: {},
      availableServices: []
    });
  }
}
