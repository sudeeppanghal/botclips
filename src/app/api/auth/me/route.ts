import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser();

    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          balance: true,
          apiKey: true,
        },
      });

      if (dbUser) {
        return NextResponse.json({ authenticated: true, user: dbUser });
      }
    } catch {
      // Fallback
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.id,
        email: session.email,
        name: session.name || "Roonie",
        role: session.role,
        balance: 0.00,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
  }
}
