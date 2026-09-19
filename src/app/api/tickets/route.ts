import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          ...(session.id ? [{ id: session.id }] : []),
          ...(session.email ? [{ email: session.email }] : [])
        ]
      }
    });

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: dbUser?.id || session.id },
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
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          ...(session.id ? [{ id: session.id }] : []),
          ...(session.email ? [{ email: session.email }] : [])
        ]
      }
    });

    const targetUserId = dbUser?.id || session.id;

    const body = await request.json();
    const { subject, relatedOrderId, orderId, message } = body;
    const finalOrderId = (relatedOrderId || orderId || "").toString().trim() || null;

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: targetUserId,
        subject: subject.trim(),
        relatedOrderId: finalOrderId,
        status: "OPEN",
        messages: {
          create: {
            userId: targetUserId,
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
