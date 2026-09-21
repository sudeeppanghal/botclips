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

    if (action === "MUTE_USER") {
      if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { isChatMuted: true },
        select: { id: true, email: true, name: true, isChatMuted: true },
      });
      return NextResponse.json({
        success: true,
        message: `User ${updated.name || updated.email} has been MUTED in chat.`,
        user: updated,
      });
    }

    if (action === "UNMUTE_USER") {
      if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { isChatMuted: false },
        select: { id: true, email: true, name: true, isChatMuted: true },
      });
      return NextResponse.json({
        success: true,
        message: `User ${updated.name || updated.email} has been UNMUTED.`,
        user: updated,
      });
    }

    if (action === "BAN_USER") {
      if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { isChatBanned: true, isChatMuted: true },
        select: { id: true, email: true, name: true, isChatBanned: true },
      });
      return NextResponse.json({
        success: true,
        message: `User ${updated.name || updated.email} has been BANNED from chat.`,
        user: updated,
      });
    }

    if (action === "UNBAN_USER") {
      if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { isChatBanned: false, isChatMuted: false },
        select: { id: true, email: true, name: true, isChatBanned: true },
      });
      return NextResponse.json({
        success: true,
        message: `User ${updated.name || updated.email} has been UNBANNED.`,
        user: updated,
      });
    }

    if (action === "DELETE_USER_MESSAGES") {
      if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });
      const deleted = await prisma.chatMessage.deleteMany({
        where: { userId },
      });
      return NextResponse.json({
        success: true,
        message: `Deleted ${deleted.count} messages from this user.`,
        count: deleted.count,
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
