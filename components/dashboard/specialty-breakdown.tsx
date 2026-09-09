"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export type SpecialtyCount = { label: string; count: number };

// Fixed categorical order — never reassigned by rank, never cycled. A 6th
// bucket folds into "Outras" (done by the caller) rather than repeating a hue.
const COLORS = ["var(--accent)", "var(--color-info)", "var(--color-success)", "var(--color-warning)", "var(--color-danger)"];
const OTHER_COLOR = "var(--text-muted)";

export function SpecialtyBreakdown({
  data,
  title,
  emptyLabel,
  otherLabel,
}: {
  data: SpecialtyCount[];
  title: string;
  emptyLabel: string;
  otherLabel: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const max = Math.max(1, ...data.map((d) => d.count));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const bars = Array.from(container.querySelectorAll<HTMLElement>("[data-specialty-bar]"));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(bars, { scaleX: 1 });
      return;
    }

    const tween = gsap.fromTo(
      bars,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.6, ease: "power2.out", stagger: 0.06, transformOrigin: "left center" },
    );
    return () => {
      tween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data)]);

  return (
    <div className="rounded-[10px] border border-[var(--border)] bg-[var(--bg-surface)] p-4 h-full">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-4">{title}</p>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-[88px] text-sm text-[var(--text-muted)]">{emptyLabel}</div>
      ) : (
        <div ref={containerRef} className="flex flex-col gap-2.5">
          {data.map((d, i) => {
            const isOther = d.label === otherLabel;
            const color = isOther ? OTHER_COLOR : COLORS[i % COLORS.length];
            return (
              <div key={d.label} className="flex items-center gap-2.5">
                <span className="w-20 shrink-0 truncate text-xs text-[var(--text-secondary)]">{d.label}</span>
                <div className="relative flex-1 h-2 rounded-full bg-[var(--bg-hover)] overflow-hidden">
                  <div
                    data-specialty-bar
                    className="h-full rounded-full"
                    style={{ width: `${Math.max(6, (d.count / max) * 100)}%`, background: color }}
                  />
                </div>
                <span className="w-5 shrink-0 text-right text-xs font-medium text-[var(--text-primary)]">{d.count}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
