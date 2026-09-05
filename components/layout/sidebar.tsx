"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
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
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import type { Role } from "@/lib/types";

const NAV_ITEMS = [
  { key: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "nav.patients", href: "/dashboard/patients", icon: Users },
  { key: "nav.doctors", href: "/dashboard/doctors", icon: Stethoscope },
  { key: "nav.procedures", href: "/dashboard/procedures", icon: ClipboardList },
  { key: "nav.appointments", href: "/dashboard/appointments", icon: CalendarClock },
  { key: "nav.calendar", href: "/dashboard/calendar", icon: CalendarDays },
  { key: "nav.exams", href: "/dashboard/exams", icon: FlaskConical },
] as const;

const ADMIN_NAV_ITEMS = [
  { key: "nav.system_health", href: "/dashboard/system-health", icon: Activity },
] as const;

const COLLAPSE_KEY = "sidebar-collapsed";

export function Sidebar({
  mobileOpen,
  onCloseMobile,
  role,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  role: Role;
}) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  // The desktop collapsed width never applies to the mobile drawer — it is
  // always full-width there, so its labels should never hide just because a
  // previous desktop session left "collapsed" in localStorage.
  const showLabels = mobileOpen || !collapsed || !mounted;

  // A route change is the moment the drawer should close on mobile — the
  // user navigated, there is nothing left for it to cover.
  useEffect(() => {
    onCloseMobile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

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
    <>
      {/* Backdrop: mobile only, and only while the drawer is open. Desktop
          never renders it — the sidebar there is permanent flex layout, not
          an overlay. */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "flex flex-col h-full shrink-0 overflow-hidden transition-[width] duration-200 ease-out",
          mounted ? (collapsed ? "md:w-[64px]" : "md:w-[220px]") : "md:w-[220px]",
          // Mobile: fixed off-canvas panel that slides in/out; desktop:
          // back to normal in-flow flex sizing above, translate reset to 0.
          "fixed inset-y-0 left-0 z-50 w-[240px] -translate-x-full md:static md:translate-x-0",
          mobileOpen && "translate-x-0",
        )}
        style={{ borderRight: "1px solid var(--border)", background: "var(--bg-body)" }}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] min-h-[52px]">
          <div className="w-6 h-6 rounded-md bg-[var(--accent)] flex items-center justify-center shrink-0">
            <Plus size={13} className="text-white" strokeWidth={3} />
          </div>
          {showLabels && (
            <span className="text-sm font-bold text-[var(--text-primary)] whitespace-nowrap flex-1">
              {t("app.name")}
            </span>
          )}
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label={t("common.close")}
            className="md:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        {[...NAV_ITEMS, ...(role === "ADMIN" ? ADMIN_NAV_ITEMS : [])].map(({ key, href, icon: Icon }) => {
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
              {showLabels && <span className="whitespace-nowrap">{t(key)}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="hidden md:flex items-center gap-2 px-4 py-3 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border-t border-[var(--border)] transition-colors"
      >
        {collapsed ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
        {(!collapsed || !mounted) && <span>{t("common.collapse")}</span>}
      </button>
      </aside>
    </>
  );
}
