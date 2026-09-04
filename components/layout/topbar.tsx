"use client";

import { useState } from "react";
import { LogOut, Menu, Moon, Sun } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { useTheme } from "@/lib/theme";
import { LOCALE_LABELS, useTranslation, type Locale } from "@/lib/i18n";
import type { Role } from "@/lib/types";

export function Topbar({
  username,
  role,
  onOpenMobileNav,
}: {
  username: string;
  role: Role;
  onOpenMobileNav: () => void;
}) {
  const { theme, toggle } = useTheme();
  const { locale, setLocale, t } = useTranslation();
  const [localeOpen, setLocaleOpen] = useState(false);

  return (
    <header className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-[var(--border)] bg-[var(--bg-body)]">
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Open navigation"
          className="md:hidden flex items-center justify-center h-8 w-8 -ml-1.5 shrink-0 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
        >
          <Menu size={17} />
        </button>
        <p className="text-xs text-[var(--text-muted)] truncate">
          {t("auth.signed_in_as")} <span className="font-medium text-[var(--text-secondary)]">{username}</span>{" "}
          &middot; {role}
        </p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
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

        <form action={logout}>
          <button
            type="submit"
            title={t("auth.logout")}
            className="flex items-center justify-center h-8 w-8 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--color-danger)] transition-colors"
          >
            <LogOut size={15} />
          </button>
        </form>
      </div>
    </header>
  );
}
