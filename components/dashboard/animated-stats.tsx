"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ClipboardList, Stethoscope, Users, type LucideIcon } from "lucide-react";

export type StatColor = "accent" | "info" | "success" | "warning";
export type StatIcon = "patients" | "doctors" | "procedures";

// A component reference (a function) can't cross the Server->Client
// Component boundary — passing `icon: Users` as a prop from a Server
// Component fails RSC serialization. So this client component owns the icon
// set itself and the caller only sends a plain, serializable string key.
const ICONS: Record<StatIcon, LucideIcon> = { patients: Users, doctors: Stethoscope, procedures: ClipboardList };

export type Stat = { label: string; value: number; icon: StatIcon; color: StatColor };

const COLOR_VAR: Record<StatColor, string> = {
  accent: "var(--accent)",
  info: "var(--color-info)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
};

export function AnimatedStats({ stats }: { stats: Stat[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cards = Array.from(container.querySelectorAll<HTMLElement>("[data-stat-card]"));
    const values = cards.map((card) => {
      const valueEl = card.querySelector<HTMLElement>("[data-stat-value]");
      return { valueEl, target: Number(valueEl?.dataset.target ?? 0) };
    });

    if (reduceMotion) {
      values.forEach(({ valueEl, target }) => {
        if (valueEl) valueEl.textContent = String(target);
      });
      return;
    }

    const tweens = gsap.timeline().from(cards, {
      opacity: 0,
      y: 12,
      duration: 0.45,
      ease: "power2.out",
      stagger: 0.08,
    });

    values.forEach(({ valueEl, target }) => {
      if (!valueEl) return;
      const counter = { n: 0 };
      tweens.to(
        counter,
        {
          n: target,
          duration: 0.6,
          ease: "power1.out",
          onUpdate: () => {
            valueEl.textContent = String(Math.round(counter.n));
          },
        },
        "<",
      );
    });

    return () => {
      tweens.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(stats.map((s) => [s.label, s.value]))]);

  return (
    <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map(({ label, value, icon, color }) => {
        const c = COLOR_VAR[color];
        const Icon = ICONS[icon];
        return (
          <div
            key={label}
            data-stat-card
            className="group relative overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--bg-surface)] p-4 transition-all duration-300 hover:-translate-y-0.5"
            style={{ ["--stat-color" as string]: c }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: `radial-gradient(120px circle at 20% 0%, color-mix(in srgb, ${c} 16%, transparent), transparent)` }}
            />
            <div className="relative flex items-start justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">{label}</p>
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                style={{ background: `color-mix(in srgb, ${c} 15%, transparent)`, color: c }}
              >
                <Icon size={14} />
              </div>
            </div>
            <p data-stat-value data-target={value} className="relative mt-2 text-2xl font-bold text-[var(--text-primary)]">
              0
            </p>
            <div
              className="absolute inset-x-0 bottom-0 h-[2px] scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"
              style={{ background: c }}
            />
          </div>
        );
      })}
    </div>
  );
}
