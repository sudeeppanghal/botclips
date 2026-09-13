import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

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
    }
  }
};

export async function GET() {
  try {
    const settings = await prisma.adminSettings.findUnique({
      where: { id: "global" }
    });

    let comboSettings = DEFAULT_COMBO_MAPPINGS;
    if (settings?.comboDefaults) {
      try {
        comboSettings = JSON.parse(settings.comboDefaults);
      } catch {}
    }

    // Also fetch available services for dropdowns
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

    return NextResponse.json({
      success: true,
      comboSettings,
      availableServices: services
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      comboSettings: DEFAULT_COMBO_MAPPINGS,
      availableServices: []
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await request.json();
    const { comboSettings } = body;

    if (!comboSettings) {
      return NextResponse.json({ error: "Missing comboSettings payload" }, { status: 400 });
    }

    await prisma.adminSettings.upsert({
      where: { id: "global" },
      create: {
        id: "global",
        comboDefaults: JSON.stringify(comboSettings)
      },
      update: {
        comboDefaults: JSON.stringify(comboSettings)
      }
    });

    return NextResponse.json({
      success: true,
      message: "Whop & Combo settings saved successfully!",
      comboSettings
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update combo settings" }, { status: 500 });
  }
}