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
    const statusParam = searchParams.get("status");
    const limit = Math.min(200, Math.max(10, Number(searchParams.get("limit") || 50)));

    const whereClause: any = {};
    if (statusParam && statusParam !== "ALL") {
      whereClause.status = statusParam;
    }

    const tickets = await prisma.supportTicket.findMany({
      where: whereClause,
      orderBy: { updatedAt: "desc" },
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true, balance: true, role: true } },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { name: true, email: true, role: true } }
          }
        }
      }
    });

    return NextResponse.json({ success: true, tickets });
  } catch (error: any) {
    console.error("GET /api/admin/tickets error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to load tickets" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const body = await request.json();
    const { ticketId, status } = body;

    if (!ticketId || !status) {
      return NextResponse.json({ error: "ticketId and status are required" }, { status: 400 });
    }

    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status }
    });

    return NextResponse.json({ success: true, ticket: updated });
  } catch (error: any) {
    console.error("PATCH /api/admin/tickets error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update ticket" }, { status: 500 });
  }
}
