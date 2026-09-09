import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE, REFRESH_SKEW_MS, cookieOptions } from "@/lib/session-constants";
import type { Session } from "@/lib/session";
import type { Role } from "@/lib/types";

const API_URL = process.env.CLINIC_FLOW_API_URL || "http://localhost:8080";

/**
 * Two jobs, in one file because Next only runs one of these per request:
 *
 * 1. Gates /dashboard and /portal behind the httpOnly session cookie's mere
 *    presence, and behind which of the two a PACIENTE vs. a staff role gets
 *    — a cheap, non-cryptographic check. Every route handler and Server
 *    Action still calls lib/api.ts, which sends the actual JWT to the
 *    backend and lets @RolesAllowed enforce the real authorization; this is
 *    UX, not the security boundary — a patient token could not read
 *    /dashboard's data even if this redirect were skipped entirely.
 * 2. Silently renews the access token before it expires, using the refresh
 *    token — this is the one place that runs on every dashboard request
 *    regardless of which page it is, so it is the right spot for this
 *    instead of duplicating the same check in every page. Renewal never
 *    itself grants or denies access — the gate above still runs against
 *    whatever the renewal left behind.
 *
 * Can't reuse lib/session.ts's own read/write here: that module uses
 * next/headers' cookies(), which only works inside a Server Component/Action
 * render, not the Edge runtime this executes in — NextRequest/NextResponse
 * have their own separate cookie API.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let hasSession = request.cookies.has(ACCESS_COOKIE);
  let role: Role | null = null;
  let refreshedAccess: { value: string; maxAgeSeconds: number } | null = null;
  let refreshedRefresh: { value: string; maxAgeSeconds: number } | null = null;
  let refreshTokenIsDead = false;

  const accessRaw = request.cookies.get(ACCESS_COOKIE)?.value;
  let expiresAt: number | null = null;
  let existingEmail = "";
  if (accessRaw) {
    try {
      const parsed = JSON.parse(accessRaw) as Session;
      expiresAt = parsed.expiresAt;
      existingEmail = parsed.email;
      role = parsed.role;
    } catch {
      // Malformed cookie — treated the same as a missing one below: needs a refresh.
    }
  }

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (refreshToken) {
    const needsRefresh = !accessRaw || expiresAt === null || expiresAt - Date.now() < REFRESH_SKEW_MS;
    if (needsRefresh) {
      try {
        const res = await fetch(`${API_URL}/v1/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
          cache: "no-store",
        });

        if (res.ok) {
          const data = (await res.json()) as {
            token: string;
            expiresInSeconds: number;
            role: Role;
            refreshToken: string;
            refreshExpiresInSeconds: number;
          };
          const session: Session = {
            token: data.token,
            role: data.role,
            email: existingEmail,
            expiresAt: Date.now() + data.expiresInSeconds * 1000,
          };
          refreshedAccess = { value: JSON.stringify(session), maxAgeSeconds: data.expiresInSeconds };
          refreshedRefresh = { value: data.refreshToken, maxAgeSeconds: data.refreshExpiresInSeconds };
          hasSession = true;
          role = data.role;
        } else {
          // The refresh token is dead too (expired, revoked, or reused) —
          // clear both cookies below so this behaves exactly like no
          // session at all, instead of leaving a stale access-token cookie
          // that would still look "logged in" but 401 on every real request.
          refreshTokenIsDead = true;
          hasSession = false;
          role = null;
        }
      } catch {
        // Backend unreachable — proceed with whatever the request already
        // had rather than blocking every dashboard request on the backend
        // being reachable right now; if the access token really is expired,
        // the next real API call 401s and existing error handling takes over.
      }
    }
  }

  const isPatientPortal = pathname.startsWith("/portal");
  const isStaffArea = pathname.startsWith("/dashboard");
  const homeFor = (r: Role) => (r === "PACIENTE" ? "/portal" : "/dashboard");

  let response: NextResponse;
  if ((isStaffArea || isPatientPortal) && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    response = NextResponse.redirect(loginUrl);
  } else if (isStaffArea && role === "PACIENTE") {
    // A patient token reaching /dashboard: not just blocked, sent to the
    // area that's actually theirs — same as a signed-in user hitting /login.
    response = NextResponse.redirect(new URL("/portal", request.url));
  } else if (isPatientPortal && role !== null && role !== "PACIENTE") {
    response = NextResponse.redirect(new URL("/dashboard", request.url));
  } else if (pathname === "/login" && hasSession && role !== null) {
    response = NextResponse.redirect(new URL(homeFor(role), request.url));
  } else {
    response = NextResponse.next();
  }

  if (refreshedAccess) response.cookies.set(ACCESS_COOKIE, refreshedAccess.value, cookieOptions(refreshedAccess.maxAgeSeconds));
  if (refreshedRefresh) response.cookies.set(REFRESH_COOKIE, refreshedRefresh.value, cookieOptions(refreshedRefresh.maxAgeSeconds));
  if (refreshTokenIsDead) {
    response.cookies.delete(ACCESS_COOKIE);
    response.cookies.delete(REFRESH_COOKIE);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/portal/:path*", "/login"],
};
