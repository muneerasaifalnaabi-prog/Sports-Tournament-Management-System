import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "stms_session";

const ADMIN_ONLY_PREFIXES = ["/admin"];
const AUTHENTICATED_PREFIXES = ["/dashboard", "/tournaments/new", "/teams/new"];
// Matches "/tournaments/:id/edit" and "/teams/:id/edit"
const EDIT_SUFFIX_PATTERN = /^\/(tournaments|teams)\/[^/]+\/edit$/;

async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as { sub: string; role: string; email: string; name: string };
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const needsAdmin = ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
  const needsAuth =
    needsAdmin ||
    AUTHENTICATED_PREFIXES.some((p) => pathname.startsWith(p)) ||
    EDIT_SUFFIX_PATTERN.test(pathname);

  if (!needsAuth) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifyToken(token) : null;

  if (!session) {
    const url = new URL("/login", req.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (needsAdmin && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/tournaments/new",
    "/teams/new",
    "/tournaments/:id/edit",
    "/teams/:id/edit",
  ],
};
