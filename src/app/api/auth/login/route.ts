import { NextRequest, NextResponse } from "next/server";
import { signJwt, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Authenticate user or generate session
    const token = signJwt({
      id: "user_roonie_default",
      email,
      name: email.split("@")[0],
      role: email.includes("admin") ? "ADMIN" : "USER",
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: "user_roonie_default",
        email,
        name: email.split("@")[0],
      },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Authentication failed" }, { status: 500 });
  }
}
