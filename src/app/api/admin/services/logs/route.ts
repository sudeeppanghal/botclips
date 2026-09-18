import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(200, Math.max(10, Number(searchParams.get("limit") || 50)));

    const logs = await prisma.serviceChangeLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            platform: true,
            category: true,
            serviceId: true,
            customRate: true,
          }
        }
      }
    });

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error("GET /api/admin/services/logs error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch logs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const body = await request.json();
    const { serviceId, serviceName, platform, oldProviderId, newProviderId, oldRate, newRate, reason } = body;

    if (!serviceId) {
      return NextResponse.json({ error: "Service ID required" }, { status: 400 });
    }

    const log = await prisma.serviceChangeLog.create({
      data: {
        serviceId,
        serviceName: serviceName || undefined,
        platform: platform || "INSTAGRAM",
        oldProviderId: oldProviderId ? String(oldProviderId) : undefined,
        newProviderId: newProviderId ? String(newProviderId) : undefined,
        oldRate: oldRate !== undefined ? Number(oldRate) : undefined,
        newRate: newRate !== undefined ? Number(newRate) : undefined,
        reason: reason || "Manual modification by Admin",
        changedBy: session.name || session.email || "Admin",
      }
    });

    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    console.error("POST /api/admin/services/logs error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to record log" }, { status: 500 });
  }
}
