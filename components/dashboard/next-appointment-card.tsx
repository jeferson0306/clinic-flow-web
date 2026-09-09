import { CalendarClock } from "lucide-react";

export type NextAppointmentInfo = {
  patientName: string;
  doctorName: string;
  specialty: string;
  startsAt: string;
  isToday: boolean;
};

export function NextAppointmentCard({
  info,
  title,
  emptyLabel,
  todayLabel,
  upcomingLabel,
}: {
  info: NextAppointmentInfo | null;
  title: string;
  emptyLabel: string;
  todayLabel: string;
  upcomingLabel: string;
}) {
  return (
    <div
      data-reveal
      className="relative overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--bg-surface)] p-4 h-full"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">{title}</p>
        <CalendarClock size={14} className="text-[var(--accent)]" />
      </div>

      {!info ? (
        <div className="flex items-center justify-center h-[88px] text-sm text-[var(--text-muted)]">{emptyLabel}</div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="pulse-dot absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--accent)]">
              {info.isToday ? todayLabel : upcomingLabel}
            </span>
          </div>

          <p className="text-base font-semibold text-[var(--text-primary)] truncate">{info.patientName}</p>
          <p className="text-sm text-[var(--text-secondary)] truncate">
            {info.doctorName} <span className="text-[var(--text-muted)]">· {info.specialty}</span>
          </p>

          <p suppressHydrationWarning className="mt-3 text-sm font-medium text-[var(--text-primary)]">
            {new Date(info.startsAt).toLocaleDateString(undefined, { weekday: "long", day: "2-digit", month: "2-digit" })}
          </p>
          <p suppressHydrationWarning className="text-xs text-[var(--text-muted)]">
            {new Date(info.startsAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      )}
    </div>
  );
}
