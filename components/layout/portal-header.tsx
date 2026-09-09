"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { KeyRound, LogOut, Moon, Sun } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { useTheme } from "@/lib/theme";
import { LOCALE_LABELS, useTranslation, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * The patient portal's own header — deliberately not Topbar/Sidebar: those
 * are built around DashboardShell's admin nav (mobile drawer, role-gated
 * CRUD links) that a read-only single-patient view has no use for. Same
 * theme/language controls, same visual language, a much smaller surface.
 */
export function PortalHeader({ email }: { email: string }) {
  const { theme, toggle } = useTheme();
  const { locale, setLocale, t } = useTranslation();
  const [localeOpen, setLocaleOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/portal", label: t("portal.nav_home") },
    { href: "/portal/appointments", label: t("portal.nav_appointments") },
  ];

  return (
    <header className="border-b border-[var(--border)] bg-[var(--bg-body)]">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3">
        <div className="flex items-center gap-6 min-w-0">
          <span className="text-sm font-semibold text-[var(--text-primary)] shrink-0">{t("portal.title")}</span>
          <nav className="hidden sm:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-2.5 py-1.5 rounded-md text-sm transition-colors",
                  pathname === link.href
                    ? "bg-[var(--bg-hover)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <p className="hidden md:block text-xs text-[var(--text-muted)] truncate mr-1">{email}</p>

          <div className="relative">
            <button
              type="button"
              onClick={() => setLocaleOpen((v) => !v)}
              onBlur={() => setTimeout(() => setLocaleOpen(false), 120)}
              aria-label="Change language"
              className="flex items-center justify-center h-8 w-8 rounded-lg text-sm hover:bg-[var(--bg-hover)] transition-colors"
            >
              {LOCALE_LABELS[locale].flag}
            </button>
            {localeOpen && (
              <div className="absolute right-0 mt-1 w-36 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow)] py-1 z-10">
                {(Object.keys(LOCALE_LABELS) as Locale[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onMouseDown={() => setLocale(l)}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                  >
                    <span>{LOCALE_LABELS[l].flag}</span>
                    <span>{LOCALE_LABELS[l].label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle theme"
            className="flex items-center justify-center h-8 w-8 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <Link
            href="/portal/settings"
            title={t("auth.change_password")}
            aria-label={t("auth.change_password")}
            className="flex items-center justify-center h-8 w-8 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            <KeyRound size={15} />
          </Link>

          <form action={logout}>
            <button
              type="submit"
              title={t("auth.logout")}
              aria-label={t("auth.logout")}
              className="flex items-center justify-center h-8 w-8 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--color-danger)] transition-colors"
            >
              <LogOut size={15} />
            </button>
          </form>
        </div>
      </div>

      <nav className="flex sm:hidden items-center gap-1 px-4 pb-2 -mt-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "px-2.5 py-1.5 rounded-md text-sm transition-colors",
              pathname === link.href
                ? "bg-[var(--bg-hover)] text-[var(--text-primary)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
