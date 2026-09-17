import { NextRequest, NextResponse } from "next/server";
import { signJwt, COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  let host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "botclips.online";
  if (!host.startsWith("localhost") && !host.includes("vercel.app")) {
    host = "botclips.online";
  }
  const protocol = host.includes("localhost") ? "http" : "https";
  const redirectUri = `${protocol}://${host}/api/auth/callback/google`;
  const baseUrl = `${protocol}://${host}`;

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(`${baseUrl}/login?error=GoogleAuthFailed`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("Missing Google OAuth credentials in environment");
    return NextResponse.redirect(`${baseUrl}/login?error=MissingGoogleConfig`);
  }

  try {
    // 1. Exchange authorization code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("Google token exchange error:", tokenData);
      return NextResponse.redirect(`${baseUrl}/login?error=TokenExchangeFailed`);
    }

    // 2. Retrieve user profile using access token
    const userinfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userinfoResponse.json();

    if (!userinfoResponse.ok || !googleUser.email) {
      console.error("Failed to fetch Google user profile:", googleUser);
      return NextResponse.redirect(`${baseUrl}/login?error=ProfileFetchFailed`);
    }

    const email = googleUser.email.toLowerCase().trim();
    const name = googleUser.name || email.split("@")[0];
    const avatarUrl = googleUser.picture || null;
    const role = email === "dipeshdhillon2006@gmail.com" ? "ADMIN" : "USER";

    // 3. Find or create user in database
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name,
            avatarUrl,
            role,
            balance: 0.0, // Strict ₹0.00 initial balance for new signups
            status: "ACTIVE",
          },
        });
      } else if (avatarUrl && !user.avatarUrl) {
        // Update avatar if not previously set
        user = await prisma.user.update({
          where: { email },
          data: { avatarUrl },
        });
      }
    } catch (dbErr: any) {
      console.error("Database user lookup/creation error:", dbErr.message);
      // Fallback session if database is momentarily disconnected
      user = {
        id: "google_" + (googleUser.sub || Date.now().toString()),
        email,
        name,
        role,
      };
    }

    // 4. Generate JWT session token
    const userRole: "USER" | "ADMIN" = user.role === "ADMIN" ? "ADMIN" : "USER";
    const sessionToken = signJwt({
      id: user.id,
      email: user.email,
      name: user.name || email.split("@")[0],
      role: userRole,
    });

    // 5. Set session cookie and redirect
    const targetPath = userRole === "ADMIN" ? "/admin" : "/dashboard";
    const response = NextResponse.redirect(`${baseUrl}${targetPath}`);

    response.cookies.set({
      name: COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Unhandled Google OAuth callback error:", err);
    return NextResponse.redirect(`${baseUrl}/login?error=ServerError`);
  }
}
