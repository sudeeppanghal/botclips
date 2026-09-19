import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    let isEligible = false;
    let currentUserData: any = null;

    if (session) {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            ...(session.id ? [{ id: session.id }] : []),
            ...(session.email ? [{ email: session.email }] : [])
          ]
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          balance: true,
          totalSpent: true,
          canChat: true,
          upiPayments: {
            where: { status: "CONFIRMED" },
            take: 1,
            select: { id: true },
          },
          cryptoPayments: {
            where: { status: "CONFIRMED" },
            take: 1,
            select: { id: true },
          },
          orders: {
            take: 1,
            select: { id: true },
          },
        },
      });

      if (user) {
        const userTotalSpent = Number(user.totalSpent || 0);
        const meetsSpendThreshold = userTotalSpent >= 500;
        isEligible = user.role === "ADMIN" || Boolean(user.canChat) || meetsSpendThreshold;
        currentUserData = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          balance: user.balance,
          totalSpent: userTotalSpent,
          canChat: isEligible,
          spendThreshold: 500,
          spendNeeded: Math.max(0, 500 - userTotalSpent),
        };
      }
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(150, Math.max(10, Number(searchParams.get("limit") || 80)));

    const messages = await prisma.chatMessage.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            role: true,
            totalSpent: true,
          },
        },
      },
    });

    const formatted = messages.reverse().map((m) => {
      let badge = "COMMUNITY CLIPPER";
      if (m.user.role === "ADMIN") {
        badge = "👑 BOTCLIPS ADMIN";
      } else if (m.user.totalSpent >= 5000) {
        badge = "💎 VIP WHOP CLIPPER";
      } else if (m.user.totalSpent >= 1000) {
        badge = "⚡ TOP CLIPPER";
      } else if (m.user.totalSpent > 0) {
        badge = "🌟 VERIFIED CLIPPER";
      }

      let parsedReactions: Record<string, string[]> = {};
      if (m.reactions) {
        try {
          parsedReactions = JSON.parse(m.reactions);
        } catch {}
      }

      return {
        id: m.id,
        userId: m.userId,
        userName: m.user.name || m.user.email.split("@")[0],
        userEmail: m.user.email,
        userRole: m.user.role,
        userBadge: badge,
        avatarUrl: m.user.avatarUrl,
        message: m.message,
        imageUrl: m.imageUrl,
        reactions: parsedReactions,
        isPinned: m.isPinned,
        createdAt: m.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      messages: formatted,
      canChat: isEligible,
      currentUser: currentUserData,
    });
  } catch (error: any) {
    console.error("GET /api/chat error:", error);
    return NextResponse.json({ success: true, messages: [], canChat: false });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json(
        { error: "Please log in to participate in the Wins Chat." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(session.id ? [{ id: session.id }] : []),
          ...(session.email ? [{ email: session.email }] : [])
        ]
      },
      select: {
        id: true,
        role: true,
        balance: true,
        totalSpent: true,
        canChat: true,
        upiPayments: {
          where: { status: "CONFIRMED" },
          take: 1,
          select: { id: true },
        },
        cryptoPayments: {
          where: { status: "CONFIRMED" },
          take: 1,
          select: { id: true },
        },
        orders: {
          take: 1,
          select: { id: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User account not found." }, { status: 404 });
    }

    const userTotalSpent = Number(user.totalSpent || 0);
    const meetsSpendThreshold = userTotalSpent >= 500;
    const isEligible = user.role === "ADMIN" || Boolean(user.canChat) || meetsSpendThreshold;

    if (!isEligible) {
      const remaining = Math.max(0, 500 - userTotalSpent);
      return NextResponse.json(
        { 
          error: `🔒 To unlock Chat Box permissions & share your wins, you must spend ₹500 INR or more on BotClips services (Current lifetime spend: ₹${userTotalSpent.toFixed(2)} — ₹${remaining.toFixed(2)} remaining).`,
          locked: true,
          currentSpend: userTotalSpent,
          spendThreshold: 500,
          remaining,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { message = "", imageUrl = null, isPinned = false } = body;

    const cleanMessage = String(message || "").trim();
    if (!cleanMessage && !imageUrl) {
      return NextResponse.json(
        { error: "Message text or win image is required." },
        { status: 400 }
      );
    }

    const chatMsg = await prisma.chatMessage.create({
      data: {
        userId: user.id,
        message: cleanMessage,
        imageUrl: imageUrl ? String(imageUrl).trim() : null,
        isPinned: user.role === "ADMIN" ? Boolean(isPinned) : false,
        reactions: JSON.stringify({}),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            role: true,
            totalSpent: true,
          },
        },
      },
    });

    let badge = "COMMUNITY CLIPPER";
    if (chatMsg.user.role === "ADMIN") {
      badge = "👑 BOTCLIPS ADMIN";
    } else if (chatMsg.user.totalSpent >= 5000) {
      badge = "💎 VIP WHOP CLIPPER";
    } else if (chatMsg.user.totalSpent >= 1000) {
      badge = "⚡ TOP CLIPPER";
    } else if (chatMsg.user.totalSpent > 0) {
      badge = "🌟 VERIFIED CLIPPER";
    }

    return NextResponse.json({
      success: true,
      message: {
        id: chatMsg.id,
        userId: chatMsg.userId,
        userName: chatMsg.user.name || chatMsg.user.email.split("@")[0],
        userEmail: chatMsg.user.email,
        userRole: chatMsg.user.role,
        userBadge: badge,
        avatarUrl: chatMsg.user.avatarUrl,
        message: chatMsg.message,
        imageUrl: chatMsg.imageUrl,
        reactions: {},
        isPinned: chatMsg.isPinned,
        createdAt: chatMsg.createdAt,
      },
    });
  } catch (error: any) {
    console.error("POST /api/chat error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to post message." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Message ID required" }, { status: 400 });
    }

    const targetMsg = await prisma.chatMessage.findUnique({ where: { id } });
    if (!targetMsg) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (session.role !== "ADMIN" && targetMsg.userId !== targetUserId && targetMsg.userId !== session.id) {
      return NextResponse.json({ error: "Forbidden. You can only delete your own messages." }, { status: 403 });
    }

    await prisma.chatMessage.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Message deleted successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete message" }, { status: 500 });
  }
}
