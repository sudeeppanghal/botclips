import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Bypass all internal and critical background services unconditionally:
  // - Background cron syncs & automated orders MUST continue running 100% without interruption
  // - Admin portal & authentication must remain accessible so admins can manage the site
  // - Static assets, images, and next.js bundles must load properly
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/cron") ||
    pathname.startsWith("/api/v2") ||
    pathname.startsWith("/api/orders") ||
    pathname.startsWith("/api/upload") ||
    pathname.startsWith("/api/billing") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/admin") ||
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
