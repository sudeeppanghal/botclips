import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { SmmPanelClient } from "@/lib/delivery/panel-client";

export async function GET(request: NextRequest) {
  try {
    const services = await prisma.adminService.findMany({
      orderBy: [{ platform: "asc" }, { name: "asc" }],
      include: {
        panel: {
          select: { id: true, name: true, apiUrl: true, status: true, balance: true, currency: true },
        },
      },
    });

    return NextResponse.json({ success: true, services });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (session && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { action, id, panelId, platform, category, name, serviceId, originalRate, customRate, minQuantity, maxQuantity, isActive } = body;

    // 1. Fetch raw services directly from upstream SMM panel
    if (action === "fetch-upstream-services") {
      const targetPanelId = panelId || body.panel?.id;
      const panel = await prisma.panel.findFirst({
        where: targetPanelId ? { id: targetPanelId } : { isActive: true },
      });

      if (!panel || !panel.apiUrl || !panel.apiKeyEncrypted || panel.apiKeyEncrypted === "PLACEHOLDER_KEY") {
        return NextResponse.json(
          { error: "No active SMM panel with valid API credentials found. Please configure your SMM panel API Key first." },
          { status: 400 }
        );
      }

      try {
        const client = new SmmPanelClient(panel.apiUrl, panel.apiKeyEncrypted);
        const upstreamServices = await client.getServices();
        return NextResponse.json({
          success: true,
          panel: { id: panel.id, name: panel.name },
          count: upstreamServices.length,
          services: upstreamServices,
        });
      } catch (err: any) {
        return NextResponse.json({ error: `Upstream error: ${err.message}` }, { status: 500 });
      }
    }

    // 2. Add or Update a Service
    if (!name || !serviceId || customRate === undefined) {
      return NextResponse.json({ error: "Name, upstream Service ID, and Custom Rate are required" }, { status: 400 });
    }

    // Find default panel if not provided
    let targetPanelId = panelId;
    if (!targetPanelId) {
      const defaultPanel = await prisma.panel.findFirst({ where: { isActive: true } });
      targetPanelId = defaultPanel?.id;
    }

    if (!targetPanelId) {
      return NextResponse.json({ error: "Please configure an active SMM panel first" }, { status: 400 });
    }

    const service = await prisma.adminService.upsert({
      where: { id: id || `srv_${Date.now()}` },
      create: {
        id: id || `srv_${Date.now()}`,
        panelId: targetPanelId,
        platform: platform || "INSTAGRAM",
        category: category || "General Services",
        name,
        serviceId: String(serviceId),
        originalRate: parseFloat(String(originalRate || 0)),
        customRate: parseFloat(String(customRate || 0)),
        minQuantity: parseInt(String(minQuantity || 10), 10),
        maxQuantity: parseInt(String(maxQuantity || 1000000), 10),
        isActive: isActive !== false,
      },
      update: {
        panelId: targetPanelId,
        platform: platform || undefined,
        category: category || undefined,
        name,
        serviceId: String(serviceId),
        originalRate: originalRate !== undefined ? parseFloat(String(originalRate)) : undefined,
        customRate: customRate !== undefined ? parseFloat(String(customRate)) : undefined,
        minQuantity: minQuantity !== undefined ? parseInt(String(minQuantity), 10) : undefined,
        maxQuantity: maxQuantity !== undefined ? parseInt(String(maxQuantity), 10) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    return NextResponse.json({ success: true, service });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save service" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (session && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Service ID is required" }, { status: 400 });
    }

    await prisma.adminService.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete service" }, { status: 500 });
  }
}
