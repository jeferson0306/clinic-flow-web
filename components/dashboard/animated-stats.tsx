"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export type Stat = { label: string; value: number };

export function AnimatedStats({ stats }: { stats: Stat[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cards = Array.from(container.querySelectorAll<HTMLElement>("[data-stat-card]"));
    const tweens = gsap.timeline().from(cards, {
      opacity: 0,
      y: 12,
      duration: 0.45,
      ease: "power2.out",
      stagger: 0.08,
    });

    cards.forEach((card) => {
      const valueEl = card.querySelector<HTMLElement>("[data-stat-value]");
      const target = Number(valueEl?.dataset.target ?? 0);
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
  }, [JSON.stringify(stats)]);

  return (
    <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map(({ label, value }) => (
        <div
          key={label}
          data-stat-card
          className="rounded-[10px] border border-[var(--border)] bg-[var(--bg-surface)] p-4"
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            {label}
          </p>
          <p
            data-stat-value
            data-target={value}
            className="mt-2 text-2xl font-bold text-[var(--text-primary)]"
          >
            0
          </p>
        </div>
      ))}
    </div>
  );
}
