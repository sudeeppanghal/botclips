import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin required." }, { status: 403 });
    }

    const body = await request.json();
    const { action, userId, canChat } = body;

    if (action === "TOGGLE_USER_CHAT") {
      if (!userId) {
        return NextResponse.json({ error: "User ID required" }, { status: 400 });
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { canChat: Boolean(canChat) },
        select: { id: true, email: true, name: true, canChat: true },
      });

      return NextResponse.json({
        success: true,
        message: `User ${updated.email} chat permission set to ${updated.canChat ? "ALLOWED" : "LOCKED"}.`,
        user: updated,
      });
    }

    if (action === "CLEAR_CHAT") {
      await prisma.chatMessage.deleteMany({});
      return NextResponse.json({ success: true, message: "Chat feed cleared successfully." });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update chat permissions" }, { status: 500 });
  }
}
