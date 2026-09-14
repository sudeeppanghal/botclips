import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.adminSettings.findUnique({
      where: { id: "global" },
      select: {
        maintenanceMode: true,
        maintenanceMessage: true,
      },
    });

    return NextResponse.json({
      maintenanceMode: settings?.maintenanceMode ?? false,
      maintenanceMessage: settings?.maintenanceMessage ?? "Scheduled maintenance in progress.",
    });
  } catch (error: any) {
    return NextResponse.json({
      maintenanceMode: false,
      maintenanceMessage: "Operational",
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const body = await request.json();
    const { maintenanceMode, maintenanceMessage } = body;

    const updated = await prisma.adminSettings.upsert({
      where: { id: "global" },
      create: {
        id: "global",
        maintenanceMode: Boolean(maintenanceMode),
        maintenanceMessage: maintenanceMessage || "Scheduled maintenance in progress. Orders continue running normally.",
      },
      update: {
        maintenanceMode: Boolean(maintenanceMode),
        ...(maintenanceMessage ? { maintenanceMessage } : {}),
      },
    });

    const response = NextResponse.json({
      success: true,
      maintenanceMode: updated.maintenanceMode,
      maintenanceMessage: updated.maintenanceMessage,
    });

    // Set or clear maintenance cookie for instant edge propagation
    if (updated.maintenanceMode) {
      response.cookies.set({
        name: "botclips_maintenance",
        value: "true",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    } else {
      response.cookies.delete("botclips_maintenance");
    }

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update maintenance mode" }, { status: 500 });
  }
}
