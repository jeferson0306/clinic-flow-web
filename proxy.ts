import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "clinic_flow_session";

/**
 * Gates /dashboard behind the httpOnly session cookie's mere presence — a
 * cheap, non-cryptographic check. Every route handler and Server Action
 * still calls lib/api.ts, which sends the actual JWT to the backend and
 * lets @RolesAllowed enforce the real authorization; this is just UX, not
 * the security boundary.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    const hasSession = request.cookies.has(SESSION_COOKIE);
    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname === "/login") {
    const hasSession = request.cookies.has(SESSION_COOKIE);
    if (hasSession) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
