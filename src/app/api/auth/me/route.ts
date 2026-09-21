import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);

    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    try {
      const dbUser = await prisma.user.findFirst({
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
          apiKey: true,
          canChat: true,
          isPromoter: true,
          referralCode: true,
          influencerChannel: true,
        },
      });

      if (dbUser) {
        return NextResponse.json({ success: true, authenticated: true, user: dbUser });
      }
    } catch {
      // Fallback
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: session.id,
        email: session.email,
        name: session.name || session.email?.split("@")[0] || "User",
        role: session.role,
        balance: 0.00,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
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

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const updateData: any = {};

    if (typeof body.name === "string") updateData.name = body.name.trim();
    if (typeof body.phone === "string") updateData.phone = body.phone.trim();
    if (body.regenerateApiKey) {
      updateData.apiKey = "dhl_" + Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        balance: true,
        apiKey: true,
        canChat: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
  }
}

