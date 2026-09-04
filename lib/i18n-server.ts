import "server-only";
import { cookies } from "next/headers";
import pt from "@/locales/pt.json";
import en from "@/locales/en.json";
import es from "@/locales/es.json";
import type { Locale } from "@/lib/i18n";

const LOCALES: Record<Locale, typeof pt> = { pt, en, es };
const LOCALE_COOKIE = "locale";

function get(obj: Record<string, unknown>, path: string): string {
  const val = path
    .split(".")
    .reduce<unknown>(
      (o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined),
      obj,
    );
  return typeof val === "string" ? val : path;
}

/**
 * Mirrors lib/i18n.tsx's dictionary for server components, which have no
 * access to the client's localStorage. Reads the same choice from a cookie
 * that the client-side LocaleProvider also writes on every change, so a
 * router.refresh() after switching languages picks it up here too.
 */
export async function getDictionary() {
  const store = await cookies();
  const raw = store.get(LOCALE_COOKIE)?.value;
  const locale: Locale = raw === "en" || raw === "es" || raw === "pt" ? raw : "pt";
  const dict = LOCALES[locale] as unknown as Record<string, unknown>;
  return (key: string) => get(dict, key);
}
