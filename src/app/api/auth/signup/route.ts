import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signJwt, COOKIE_NAME } from "@/lib/auth";
import { generateUniqueReferralCode } from "@/lib/referral";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, password, referralCode: inputRef } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const hashedPassword = await hashPassword(password);

    // Check referral code from request body or cookie
    const cookieRef = request.cookies.get("botclips_ref")?.value;
    const refCodeToLookup = (inputRef || cookieRef || "").trim().toUpperCase();

    let referredById: string | null = null;
    if (refCodeToLookup) {
      const promoter = await prisma.user.findUnique({
        where: { referralCode: refCodeToLookup },
        select: { id: true },
      });
      if (promoter) {
        referredById = promoter.id;
      }
    }

    let user: any = null;

    try {
      // Check if user already exists
      const existing = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (existing) {
        return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 });
      }

      // Generate unique referral code for this new user
      const assignedRefCode = await generateUniqueReferralCode(name || cleanEmail.split("@")[0]);

      // Create user in DB with initial balance of 0.0 (users must deposit to place orders)
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          passwordHash: hashedPassword,
          name: name || cleanEmail.split("@")[0],
          phone: phone || null,
          balance: 0.0,
          role: cleanEmail === "dipeshdhillon2006@gmail.com" ? "ADMIN" : "USER",
          referralCode: assignedRefCode,
          referredById: referredById,
        },
      });
    } catch (dbErr: any) {
      console.error("Database signup error:", dbErr.message);
      return NextResponse.json({ error: "Failed to create account. Please try again." }, { status: 500 });
    }

    const token = signJwt({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        balance: user.balance,
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
    return NextResponse.json({ error: error.message || "Failed to create account" }, { status: 500 });
  }
}
