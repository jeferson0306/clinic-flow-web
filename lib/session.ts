import "server-only";
import { cookies } from "next/headers";
import { ACCESS_COOKIE, REFRESH_COOKIE, cookieOptions } from "@/lib/session-constants";

/**
 * The JWT lives only in an httpOnly cookie — never in localStorage, never
 * passed to client-side JavaScript. A cookie client script cannot read is a
 * cookie an XSS payload cannot steal; the tradeoff is that every write goes
 * through a Server Action or Route Handler instead of a client-side fetch,
 * which this app already does for every mutation.
 *
 * The access token is short-lived (see AuthService.TOKEN_LIFETIME) and the
 * refresh token — a separate httpOnly cookie, never exposed in `Session` —
 * is what middleware.ts uses to silently renew it before it expires,
 * without asking for a password again.
 */
export type Session = { token: string; role: "ADMIN" | "DOCTOR"; email: string; expiresAt: number };

export async function setSession(session: {
  token: string;
  expiresInSeconds: number;
  role: "ADMIN" | "DOCTOR";
  email: string;
  refreshToken: string;
  refreshExpiresInSeconds: number;
}): Promise<void> {
  const store = await cookies();
  const accessValue: Session = {
    token: session.token,
    role: session.role,
    email: session.email,
    expiresAt: Date.now() + session.expiresInSeconds * 1000,
  };
  store.set(ACCESS_COOKIE, JSON.stringify(accessValue), cookieOptions(session.expiresInSeconds));
  store.set(REFRESH_COOKIE, session.refreshToken, cookieOptions(session.refreshExpiresInSeconds));
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(ACCESS_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    // A malformed cookie is not this app's problem to recover from — treat
    // it the same as no session at all rather than throwing mid-render.
    return null;
  }
}

export async function getRefreshToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(REFRESH_COOKIE)?.value ?? null;
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}
