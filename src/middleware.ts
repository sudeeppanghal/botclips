import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Strict route protection for /admin (requires verified ADMIN role)
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("dhillion_token")?.value;
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
        if (payload.role !== "ADMIN") {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      } else {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
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
