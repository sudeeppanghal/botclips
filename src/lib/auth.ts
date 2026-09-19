import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "dhillionsmm_fallback_secret_key_849204";
const COOKIE_NAME = "dhillion_token";

export interface SessionUser {
  id: string;
  email: string;
  name?: string;
  role: "USER" | "ADMIN";
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function signJwt(payload: SessionUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export const ADMIN_EMAILS = [
  "dipeshdhillon2006@gmail.com",
  "spkchaudhary9211@gmail.com",
  "master@botclips.online",
];

export function verifyJwt(token: string): SessionUser | null {
  try {
    const user = jwt.verify(token, JWT_SECRET) as SessionUser;
    if (user && user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      user.role = "ADMIN";
    }
    return user;
  } catch {
    return null;
  }
}

export async function getSessionUser(req?: NextRequest): Promise<SessionUser | null> {
  // 1. Check Bearer token or cookie from request argument if passed
  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const user = verifyJwt(token);
      if (user) return user;
    }

    try {
      const cookieToken = req.cookies.get(COOKIE_NAME)?.value;
      if (cookieToken) {
        const user = verifyJwt(cookieToken);
        if (user) return user;
      }
    } catch {}
  }

  // 2. Check Next.js headers()
  try {
    const headerStore = await headers();
    const authHeader = headerStore.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const user = verifyJwt(token);
      if (user) return user;
    }
  } catch {}

  // 3. Check cookies()
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (token) {
      return verifyJwt(token);
    }
  } catch {}

  return null;
}

export { COOKIE_NAME };
