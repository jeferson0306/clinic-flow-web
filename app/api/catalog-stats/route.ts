import { NextResponse } from "next/server";
import { api } from "@/lib/api";

/**
 * Backs the landing page's "ao vivo" section — a real procedure count from
 * the live backend instead of a static, easy-to-fabricate number. GET
 * /v1/procedures is public on the backend (see ProcedureResource), so this
 * proxy needs no session; it exists only so the browser never has to know
 * the backend's own origin. Fails open with a 200 and `null` rather than an
 * error status: the backend is on Render's free tier and can be asleep, and
 * a stat this decorative should never look like the page itself is broken.
 */
export async function GET() {
  try {
    const procedures = await api.procedures.list();
    return NextResponse.json({ procedureCount: procedures.length });
  } catch {
    return NextResponse.json({ procedureCount: null });
  }
}
