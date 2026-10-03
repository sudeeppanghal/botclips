import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const banners = await prisma.promotionBanner.findMany({
      orderBy: [
        { priority: "asc" },
        { createdAt: "desc" },
      ],
    });

    const totalImpressions = banners.reduce((acc, b) => acc + (b.impressions || 0), 0);
    const totalPrimaryClicks = banners.reduce((acc, b) => acc + (b.primaryClicks || 0), 0);
    const totalSecondaryClicks = banners.reduce((acc, b) => acc + (b.secondaryClicks || 0), 0);
    const totalClicks = banners.reduce((acc, b) => acc + (b.clicks || 0), 0);
    const activeCount = banners.filter((b) => b.status === "ACTIVE" && b.showOnDashboard).length;
    const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";

    return NextResponse.json({
      success: true,
      banners,
      stats: {
        total: banners.length,
        active: activeCount,
        impressions: totalImpressions,
        primaryClicks: totalPrimaryClicks,
        secondaryClicks: totalSecondaryClicks,
        clicks: totalClicks,
        ctr: avgCtr,
      },
    });
  } catch (err: any) {
    console.error("Failed to fetch admin banners:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch banners" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      imageUrl,
      badge,
      title,
      description,
      primaryButtonText,
      primaryButtonUrl,
      secondaryButtonText,
      secondaryButtonUrl,
      openLinksNewTab = true,
      status = "ACTIVE",
      showOnDashboard = true,
      startDate,
      endDate,
      priority = 1,
    } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: "Banner Image URL is required" },
        { status: 400 }
      );
    }

    const banner = await prisma.promotionBanner.create({
      data: {
        name: name || "16:9 Views Promotion",
        imageUrl: imageUrl.trim(),
        badge: badge !== undefined ? badge : "PROMOTION",
        title: title || "PROMOTION BANNED",
        description: description || "Get real views for your 16:9 videos without any risk",
        primaryButtonText: primaryButtonText || "Go Now",
        primaryButtonUrl: primaryButtonUrl || "/dashboard/services",
        secondaryButtonText: secondaryButtonText || "Click Here",
        secondaryButtonUrl: secondaryButtonUrl || "https://t.me/botclipssmm",
        openLinksNewTab: Boolean(openLinksNewTab),
        status: status || "ACTIVE",
        showOnDashboard: showOnDashboard !== undefined ? Boolean(showOnDashboard) : true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        priority: Number(priority) || 1,
      },
    });

    return NextResponse.json({
      success: true,
      banner,
      message: "Promotion banner created successfully",
    });
  } catch (err: any) {
    console.error("Failed to create banner:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create banner" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      action, // "duplicate" | "toggle_status" | "toggle_dashboard" | "reset_stats"
      name,
      imageUrl,
      badge,
      title,
      description,
      primaryButtonText,
      primaryButtonUrl,
      secondaryButtonText,
      secondaryButtonUrl,
      openLinksNewTab,
      status,
      showOnDashboard,
      startDate,
      endDate,
      priority,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Banner ID is required" },
        { status: 400 }
      );
    }

    // Handle DUPLICATE Action
    if (action === "duplicate") {
      const original = await prisma.promotionBanner.findUnique({ where: { id } });
      if (!original) {
        return NextResponse.json({ success: false, error: "Banner not found" }, { status: 404 });
      }

      const duplicateBanner = await prisma.promotionBanner.create({
        data: {
          name: `${original.name} (Copy)`,
          imageUrl: original.imageUrl,
          badge: original.badge,
          title: original.title,
          description: original.description,
          primaryButtonText: original.primaryButtonText,
          primaryButtonUrl: original.primaryButtonUrl,
          secondaryButtonText: original.secondaryButtonText,
          secondaryButtonUrl: original.secondaryButtonUrl,
          openLinksNewTab: original.openLinksNewTab,
          status: "INACTIVE", // duplicate is inactive by default for safety
          showOnDashboard: original.showOnDashboard,
          startDate: original.startDate,
          endDate: original.endDate,
          priority: (original.priority || 1) + 1,
          impressions: 0,
          primaryClicks: 0,
          secondaryClicks: 0,
          clicks: 0,
        },
      });

      return NextResponse.json({
        success: true,
        banner: duplicateBanner,
        message: "Banner duplicated successfully",
      });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl.trim();
    if (badge !== undefined) updateData.badge = badge;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (primaryButtonText !== undefined) updateData.primaryButtonText = primaryButtonText;
    if (primaryButtonUrl !== undefined) updateData.primaryButtonUrl = primaryButtonUrl;
    if (secondaryButtonText !== undefined) updateData.secondaryButtonText = secondaryButtonText;
    if (secondaryButtonUrl !== undefined) updateData.secondaryButtonUrl = secondaryButtonUrl;
    if (openLinksNewTab !== undefined) updateData.openLinksNewTab = Boolean(openLinksNewTab);
    if (status !== undefined) updateData.status = status;
    if (showOnDashboard !== undefined) updateData.showOnDashboard = Boolean(showOnDashboard);
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (priority !== undefined) updateData.priority = Number(priority) || 1;
    if (action === "reset_stats") {
      updateData.clicks = 0;
      updateData.primaryClicks = 0;
      updateData.secondaryClicks = 0;
      updateData.impressions = 0;
    }

    const updated = await prisma.promotionBanner.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      banner: updated,
      message: "Promotion banner updated successfully",
    });
  } catch (err: any) {
    console.error("Failed to update banner:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update banner" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Banner ID is required" },
        { status: 400 }
      );
    }

    await prisma.promotionBanner.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Promotion banner deleted successfully",
    });
  } catch (err: any) {
    console.error("Failed to delete banner:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete banner" },
      { status: 500 }
    );
  }
}
