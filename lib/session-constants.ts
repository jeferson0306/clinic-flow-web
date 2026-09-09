/**
 * Shared between lib/session.ts (Server Components/Actions, via
 * next/headers' cookies()) and middleware.ts (the Edge runtime, via
 * NextRequest/NextResponse's own cookie API) — two different cookie APIs
 * that must still agree on the same names and expiry, so those live here
 * once instead of as a literal string duplicated in both files.
 */
export const ACCESS_COOKIE = "clinic_flow_session";
export const REFRESH_COOKIE = "clinic_flow_refresh";

/** Trigger a refresh this long before the access token actually expires, not exactly at the deadline. */
export const REFRESH_SKEW_MS = 60_000;

export function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    // Strict, not Lax: every request that carries this cookie originates
    // from this app's own pages — no cross-site top-level navigation (an
    // OAuth-style redirect back, an external link into a specific page)
    // needs it sent along, so there is no reason to relax it.
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
