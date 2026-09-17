import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, signJwt } from "@/lib/auth";

// POST /api/admin/impersonate - 1-Click Login into any user account
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Sign a fresh token for target user
    const token = signJwt({
      id: targetUser.id,
      email: targetUser.email,
      name: targetUser.name || targetUser.email.split("@")[0],
      role: targetUser.role as "USER" | "ADMIN",
    });

    const response = NextResponse.json({
      success: true,
      token,
      message: `Logged in as ${targetUser.email}`,
      redirectUrl: "/dashboard",
    });

    // Set auth cookie
    response.cookies.set("dhillion_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to login as user" }, { status: 500 });
  }
}
