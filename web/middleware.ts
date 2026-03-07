import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "session";

const PROTECTED_PATHS = ["/write", "/profile/edit"];
const AUTH_PATHS = ["/login", "/register"];

function getSecret(): Uint8Array {
  const secret =
    process.env.AUTH_SECRET ||
    process.env.CRYPTO_SECRET ||
    "dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const loggedIn = await hasValidSession(request);

  if (isProtectedPath(pathname) && !loggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPath(pathname) && loggedIn) {
    const redirectTo = request.nextUrl.searchParams.get("redirect") || "/";
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/write/:path*",
    "/profile/edit/:path*",
    "/login",
    "/register",
  ],
};