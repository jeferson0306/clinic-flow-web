"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CalendarClock,
  CalendarDays,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  FlaskConical,
  LayoutDashboard,
  Plus,
  Stethoscope,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

const NAV_ITEMS = [
  { key: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "nav.patients", href: "/dashboard/patients", icon: Users },
  { key: "nav.doctors", href: "/dashboard/doctors", icon: Stethoscope },
  { key: "nav.procedures", href: "/dashboard/procedures", icon: ClipboardList },
  { key: "nav.appointments", href: "/dashboard/appointments", icon: CalendarClock },
  { key: "nav.calendar", href: "/dashboard/calendar", icon: CalendarDays },
  { key: "nav.exams", href: "/dashboard/exams", icon: FlaskConical },
] as const;

const COLLAPSE_KEY = "sidebar-collapsed";

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // localStorage does not exist during SSR, so the saved preference can
    // only be read after mount — there is no render-time value to derive
    // this from, unlike the effects this rule usually flags.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      // localStorage unavailable (private browsing) — default to expanded.
    }
  }, []);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
    } catch {
      // Nothing to persist to; the in-memory toggle still works this session.
    }
  }

  return (
    <aside
      className={cn(
        "flex flex-col h-full shrink-0 overflow-hidden transition-[width] duration-200 ease-out",
        mounted ? (collapsed ? "w-[64px]" : "w-[220px]") : "w-[220px]",
      )}
      style={{ borderRight: "1px solid var(--border)", background: "var(--bg-body)" }}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] min-h-[52px]">
        <div className="w-6 h-6 rounded-md bg-[var(--accent)] flex items-center justify-center shrink-0">
          <Plus size={13} className="text-white" strokeWidth={3} />
        </div>
        {(!collapsed || !mounted) && (
          <span className="text-sm font-bold text-[var(--text-primary)] whitespace-nowrap">
            {t("app.name")}
          </span>
        )}
      </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        {NAV_ITEMS.map(({ key, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? t(key) : undefined}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                isActive
                  ? "text-[var(--text-primary)] bg-[var(--bg-hover)] font-medium"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
              )}
            >
              <Icon size={15} className="shrink-0" />
              {(!collapsed || !mounted) && <span className="whitespace-nowrap">{t(key)}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="flex items-center gap-2 px-4 py-3 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border-t border-[var(--border)] transition-colors"
      >
        {collapsed ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
        {(!collapsed || !mounted) && <span>{t("common.collapse")}</span>}
      </button>
    </aside>
  );
}
