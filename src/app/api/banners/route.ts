import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackAction = searchParams.get("track"); // "impression" | "primary_click" | "secondary_click"
    const bannerId = searchParams.get("id");

    // Track user action via GET beacon if specified
    if (trackAction && bannerId) {
      try {
        if (trackAction === "impression") {
          await prisma.promotionBanner.update({
            where: { id: bannerId },
            data: { impressions: { increment: 1 } },
          });
        } else if (trackAction === "primary_click") {
          await prisma.promotionBanner.update({
            where: { id: bannerId },
            data: {
              primaryClicks: { increment: 1 },
              clicks: { increment: 1 },
            },
          });
        } else if (trackAction === "secondary_click") {
          await prisma.promotionBanner.update({
            where: { id: bannerId },
            data: {
              secondaryClicks: { increment: 1 },
              clicks: { increment: 1 },
            },
          });
        }
        return NextResponse.json({ success: true, tracked: trackAction });
      } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 400 });
      }
    }

    // Find highest-priority active banner configured to show on dashboard
    const now = new Date();
    const activeBanner = await prisma.promotionBanner.findFirst({
      where: {
        status: "ACTIVE",
        showOnDashboard: true,
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: now }, endDate: null },
          { startDate: null, endDate: { gte: now } },
          { startDate: { lte: now }, endDate: { gte: now } },
        ],
      },
      orderBy: [
        { priority: "asc" }, // 1 is highest priority
        { createdAt: "desc" },
      ],
    });

    if (activeBanner) {
      return NextResponse.json({
        success: true,
        banner: activeBanner,
      });
    }

    // If no banner is active or configured, return null so UI can cleanly hide
    return NextResponse.json({
      success: true,
      banner: null,
    });
  } catch (err: any) {
    console.error("Error loading promotion banner:", err);
    return NextResponse.json({
      success: false,
      banner: null,
      error: err.message || "Failed to fetch banner",
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, isPreview } = body;

    // Do NOT count admin preview clicks as real user clicks
    if (isPreview || !id) {
      return NextResponse.json({ success: true, skipped: true });
    }

    if (action === "impression") {
      await prisma.promotionBanner.update({
        where: { id },
        data: { impressions: { increment: 1 } },
      });
    } else if (action === "primary_click") {
      await prisma.promotionBanner.update({
        where: { id },
        data: {
          primaryClicks: { increment: 1 },
          clicks: { increment: 1 },
        },
      });
    } else if (action === "secondary_click") {
      await prisma.promotionBanner.update({
        where: { id },
        data: {
          secondaryClicks: { increment: 1 },
          clicks: { increment: 1 },
        },
      });
    }

    return NextResponse.json({ success: true, tracked: action });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to record banner metric" },
      { status: 500 }
    );
  }
}
