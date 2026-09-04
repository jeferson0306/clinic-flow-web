import "server-only";
import { cookies } from "next/headers";

/**
 * The JWT lives only in an httpOnly cookie — never in localStorage, never
 * passed to client-side JavaScript. A cookie client script cannot read is a
 * cookie an XSS payload cannot steal; the tradeoff is that every write goes
 * through a Server Action or Route Handler instead of a client-side fetch,
 * which this app already does for every mutation.
 */
const COOKIE_NAME = "clinic_flow_session";

export type Session = { token: string; role: "ADMIN" | "DOCTOR"; username: string };

export async function setSession(session: Session): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // matches AuthService.TOKEN_LIFETIME on the backend
  });
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    // A malformed cookie is not this app's problem to recover from — treat
    // it the same as no session at all rather than throwing mid-render.
    return null;
  }
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
