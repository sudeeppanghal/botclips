import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const ticketId = resolvedParams.id;
    const body = await request.json();
    const { message, status } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Ensure non-admins can only message their own tickets
    if (session.role !== "ADMIN" && ticket.userId !== session.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const isAdmin = session.role === "ADMIN";
    const nextStatus = status || (isAdmin ? "ANSWERED" : "CUSTOMER_REPLY");

    const [newMsg, updatedTicket] = await prisma.$transaction([
      prisma.ticketMessage.create({
        data: {
          ticketId,
          userId: session.id,
          message: message.trim(),
          isAdmin,
        },
        include: {
          user: { select: { name: true, email: true, role: true } }
        }
      }),
      prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          status: nextStatus,
          updatedAt: new Date()
        }
      })
    ]);

    return NextResponse.json({ success: true, message: newMsg, ticket: updatedTicket });
  } catch (error: any) {
    console.error("POST /api/tickets/[id]/messages error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to send message" }, { status: 500 });
  }
}
