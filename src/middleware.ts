import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function verifyAdminSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const [headerB64, payloadB64, signatureB64] = parts;

    const secret = process.env.JWT_SECRET || "dhillionsmm_fallback_secret_key_849204";
    const encoder = new TextEncoder();
    const dataToVerify = encoder.encode(`${headerB64}.${payloadB64}`);
    const keyData = encoder.encode(secret);

    // Decode URL-safe base64 signature
    const sigStr = signatureB64.replace(/-/g, "+").replace(/_/g, "/");
    const sigPad = sigStr + "=".repeat((4 - (sigStr.length % 4)) % 4);
    const sigBinary = Uint8Array.from(atob(sigPad), (c) => c.charCodeAt(0));

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const isValid = await crypto.subtle.verify("HMAC", cryptoKey, sigBinary, dataToVerify);
    if (!isValid) return false;

    const payloadStr = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
    const payloadPad = payloadStr + "=".repeat((4 - (payloadStr.length % 4)) % 4);
    const payload = JSON.parse(atob(payloadPad));

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return false;
    }

    const ADMIN_EMAILS = [
      "dipeshdhillon2006@gmail.com",
      "spkchaudhary9211@gmail.com",
      "master@botclips.online",
    ];

    if (payload.email && ADMIN_EMAILS.includes(payload.email.toLowerCase())) {
      return true;
    }

    return payload.role === "ADMIN";
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Strict route protection for /admin (requires verified cryptographically signed ADMIN role)
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("dhillion_token")?.value;
    const isAdmin = await verifyAdminSession(token);
    if (!isAdmin) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 1b. Strict API protection for /api/admin/* (returns 401/403 JSON)
  if (pathname.startsWith("/api/admin")) {
    const token = request.cookies.get("dhillion_token")?.value;
    const isAdmin = await verifyAdminSession(token);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden. Admin privileges required." }, { status: 403 });
    }
  }

  // 2. Protected /dashboard routes (require authenticated user session)
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("dhillion_token")?.value;
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Bypass internal services, API routes & static assets:
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/maintenance") ||
    pathname.startsWith("/screenshots") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // 2. Check if maintenance mode is active
  const isMaintenanceActive = request.cookies.get("botclips_maintenance")?.value === "true";

  if (isMaintenanceActive) {
    // Check if the user is an authorized admin via session cookie
    const token = request.cookies.get("dhillion_token")?.value;
    if (token) {
      try {
        // Base64 decode JWT payload to check role without external dependency in edge runtime
        const parts = token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
          if (payload.role === "ADMIN") {
            // Admin bypasses maintenance mode
            return NextResponse.next();
          }
        }
      } catch {
        // If token decode fails, proceed with maintenance redirect
      }
    }

    // Rewrite regular visitors to the maintenance screen
    const url = request.nextUrl.clone();
    url.pathname = "/maintenance";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/cron (background workers)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
