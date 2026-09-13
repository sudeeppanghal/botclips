import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform");

    const where: any = { isActive: true };
    if (platform && platform !== "ALL") {
      where.platform = platform;
    }

    const services = await prisma.adminService.findMany({
      where,
      orderBy: [{ platform: "asc" }, { customRate: "asc" }],
      select: {
        id: true,
        platform: true,
        category: true,
        name: true,
        serviceId: true,
        customRate: true,
        minQuantity: true,
        maxQuantity: true,
      },
    });

    if (services.length > 0) {
      return NextResponse.json({
        success: true,
        services: services.map((s) => ({
          id: s.id,
          platform: s.platform,
          cat: s.category,
          name: s.name,
          serviceId: s.serviceId,
          rate: s.customRate,
          min: s.minQuantity,
          max: s.maxQuantity,
        })),
      });
    }

    // Fallback default services with transparent pricing if database is freshly initialized
    const defaultFallback = [
      { id: "1024", platform: "INSTAGRAM", cat: "Instagram Followers", name: "Instagram Real HQ Followers [Instant, 30 Days Refill]", serviceId: "1024", rate: 180, min: 50, max: 100000 },
      { id: "1025", platform: "INSTAGRAM", cat: "Instagram Likes", name: "Instagram High Retention Likes [Real Active Users]", serviceId: "1025", rate: 45, min: 50, max: 500000 },
      { id: "1026", platform: "INSTAGRAM", cat: "Instagram Views", name: "Instagram Reels Views [Fast Viral Algorithm Boost]", serviceId: "1026", rate: 15, min: 100, max: 10000000 },
      { id: "2011", platform: "YOUTUBE", cat: "YouTube Views", name: "YouTube High Retention Views [Monetizable, Safe for Ads]", serviceId: "2011", rate: 240, min: 500, max: 2000000 },
      { id: "2012", platform: "YOUTUBE", cat: "YouTube Subscribers", name: "YouTube Real Non-Drop Subscribers [Gradual Delivery]", serviceId: "2012", rate: 1200, min: 50, max: 20000 },
      { id: "3015", platform: "TIKTOK", cat: "TikTok Followers", name: "TikTok Real Followers [Guaranteed No Drop]", serviceId: "3015", rate: 190, min: 100, max: 50000 },
      { id: "3016", platform: "TIKTOK", cat: "TikTok Views", name: "TikTok Video Views [Instant Delivery + Viral Push]", serviceId: "3016", rate: 20, min: 100, max: 5000000 },
      { id: "4010", platform: "TELEGRAM", cat: "Telegram Members", name: "Telegram Channel Members [Global Non-Drop 60D]", serviceId: "4010", rate: 120, min: 100, max: 100000 },
      { id: "4011", platform: "TELEGRAM", cat: "Telegram Views", name: "Telegram Post Views [1-5 Recent Posts Autoview]", serviceId: "4011", rate: 10, min: 100, max: 500000 },
      { id: "5001", platform: "TWITTER", cat: "Twitter (X) Followers", name: "Twitter (X) Followers [Real Profiles with PFP]", serviceId: "5001", rate: 350, min: 50, max: 50000 },
      { id: "5002", platform: "TWITTER", cat: "Twitter (X) Likes", name: "Twitter (X) High Speed Likes & Retweets", serviceId: "5002", rate: 110, min: 50, max: 100000 },
      { id: "6001", platform: "FACEBOOK", cat: "Facebook Page Likes", name: "Facebook Page Followers & Likes [Real Indian Profiles]", serviceId: "6001", rate: 290, min: 100, max: 50000 },
    ];

    return NextResponse.json({ success: true, services: defaultFallback });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load services" }, { status: 500 });
  }
}
