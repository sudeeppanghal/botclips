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

    const { id } = await params;
    const body = await request.json();
    const { emoji } = body;

    const allowedEmojis = ["🔥", "🚀", "💰", "❤️", "👑", "🎯"];
    if (!emoji || !allowedEmojis.includes(emoji)) {
      return NextResponse.json({ error: "Invalid reaction emoji" }, { status: 400 });
    }

    const message = await prisma.chatMessage.findUnique({
      where: { id },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    let reactionsMap: Record<string, string[]> = {};
    if (message.reactions) {
      try {
        reactionsMap = JSON.parse(message.reactions);
      } catch {}
    }

    if (!Array.isArray(reactionsMap[emoji])) {
      reactionsMap[emoji] = [];
    }

    const userIndex = reactionsMap[emoji].indexOf(session.id);
    if (userIndex > -1) {
      reactionsMap[emoji].splice(userIndex, 1);
      if (reactionsMap[emoji].length === 0) {
        delete reactionsMap[emoji];
      }
    } else {
      reactionsMap[emoji].push(session.id);
    }

    await prisma.chatMessage.update({
      where: { id },
      data: {
        reactions: JSON.stringify(reactionsMap),
      },
    });

    return NextResponse.json({
      success: true,
      reactions: reactionsMap,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to toggle reaction" }, { status: 500 });
  }
}
