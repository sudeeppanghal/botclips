import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: session.id },
      orderBy: { updatedAt: "desc" },
      include: {
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
    console.error("GET /api/tickets error:", error);
    return NextResponse.json({ success: false, tickets: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { subject, relatedOrderId, message } = body;

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session.id,
        subject: subject.trim(),
        relatedOrderId: relatedOrderId ? String(relatedOrderId).trim() : null,
        status: "OPEN",
        messages: {
          create: {
            userId: session.id,
            message: message.trim(),
            isAdmin: session.role === "ADMIN",
          }
        }
      },
      include: {
        messages: {
          include: {
            user: { select: { name: true, email: true, role: true } }
          }
        }
      }
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    console.error("POST /api/tickets error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create ticket" }, { status: 500 });
  }
}
