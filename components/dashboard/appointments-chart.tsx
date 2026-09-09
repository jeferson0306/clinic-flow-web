"use client";

import { useId, useMemo, useState } from "react";

export type DayCount = { date: string; count: number };

const CHART_HEIGHT = 140;
const BAR_MAX_WIDTH = 24;
const BAR_GAP = 6;

/**
 * A single-series bar chart (appointments per day) — one hue, no legend
 * needed per the dataviz house rules (a single series' identity is already
 * named by the title). Hover/focus carries the exact count + date, since a
 * value on every bar would be noise at 14 bars wide.
 */
export function AppointmentsChart({ data, title, emptyLabel }: { data: DayCount[]; title: string; emptyLabel: string }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const gradientId = useId();

  const max = useMemo(() => Math.max(1, ...data.map((d) => d.count)), [data]);
  const hasData = data.some((d) => d.count > 0);

  const barWidth = Math.min(BAR_MAX_WIDTH, 100 / data.length - BAR_GAP);
  const step = 100 / data.length;

  const yTicks = useMemo(() => {
    const top = Math.max(1, Math.ceil(max / 2) * 2);
    return [0, Math.round(top / 2), top];
  }, [max]);

  return (
    <div className="rounded-[10px] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-4">{title}</p>

      {!hasData ? (
        <div className="flex items-center justify-center h-[140px] text-sm text-[var(--text-muted)]">
          {emptyLabel}
        </div>
      ) : (
        <div className="relative">
          <svg
            viewBox={`0 0 100 ${CHART_HEIGHT}`}
            preserveAspectRatio="none"
            className="w-full"
            style={{ height: CHART_HEIGHT }}
            role="img"
            aria-label={title}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="1" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.75" />
              </linearGradient>
            </defs>

            {/* Gridlines — hairline, recessive, round numbers only */}
            {yTicks.map((tick) => {
              const y = CHART_HEIGHT - 18 - (tick / yTicks[2]) * (CHART_HEIGHT - 28);
              return (
                <line
                  key={tick}
                  x1={0}
                  x2={100}
                  y1={y}
                  y2={y}
                  stroke="var(--border)"
                  strokeWidth={0.5}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}

            {/* Bars */}
            {data.map((d, i) => {
              const barH = (d.count / yTicks[2]) * (CHART_HEIGHT - 28);
              const x = i * step + (step - barWidth) / 2;
              const y = CHART_HEIGHT - 18 - barH;
              const isActive = activeIndex === i;
              return (
                <g key={d.date}>
                  {/* Larger, invisible hit target than the painted bar */}
                  <rect
                    x={i * step}
                    y={0}
                    width={step}
                    height={CHART_HEIGHT}
                    fill="transparent"
                    onPointerEnter={() => setActiveIndex(i)}
                    onPointerLeave={() => setActiveIndex((cur) => (cur === i ? null : cur))}
                    onFocus={() => setActiveIndex(i)}
                    onBlur={() => setActiveIndex((cur) => (cur === i ? null : cur))}
                    tabIndex={0}
                  />
                  {d.count > 0 && (
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={Math.max(barH, 2)}
                      rx={2}
                      fill={`url(#${gradientId})`}
                      opacity={isActive ? 1 : 0.85}
                      style={{ transition: "opacity 0.15s ease" }}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* X-axis day labels — every other day to avoid crowding at 14 bars */}
          <div className="flex text-[9px] text-[var(--text-muted)] mt-1">
            {data.map((d, i) => (
              <div key={d.date} style={{ width: `${step}%` }} className="text-center truncate">
                {i % 2 === 0 ? new Date(d.date).toLocaleDateString(undefined, { day: "2-digit", month: "2-digit" }) : ""}
              </div>
            ))}
          </div>

          {activeIndex !== null && (
            <div
              className="absolute top-0 -translate-x-1/2 pointer-events-none rounded-md border border-[var(--border)] bg-[var(--bg-hover)] px-2 py-1 text-xs shadow-[var(--shadow)] whitespace-nowrap"
              style={{ left: `${activeIndex * step + step / 2}%` }}
            >
              <span className="font-semibold text-[var(--text-primary)]">{data[activeIndex].count}</span>{" "}
              <span suppressHydrationWarning className="text-[var(--text-secondary)]">
                {new Date(data[activeIndex].date).toLocaleDateString(undefined, {
                  weekday: "short",
                  day: "2-digit",
                  month: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
