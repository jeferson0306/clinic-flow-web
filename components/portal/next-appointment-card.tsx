export type PortalAppointmentInfo = {
  doctorName: string;
  specialty: string;
  procedureName: string;
  startsAt: string;
};

/** The patient's own view of "next appointment" — no patient name shown, unlike the staff dashboard's card (it would just be their own name). */
export function PortalNextAppointmentCard({
  info,
  title,
  emptyLabel,
  withLabel,
}: {
  info: PortalAppointmentInfo | null;
  title: string;
  emptyLabel: string;
  withLabel: string;
}) {
  return (
    <div className="rounded-[10px] border border-[var(--border)] bg-[var(--bg-surface)] p-5">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">{title}</p>
      {!info ? (
        <p className="text-sm text-[var(--text-muted)]">{emptyLabel}</p>
      ) : (
        <div>
          <p className="text-base font-semibold text-[var(--text-primary)]">{info.procedureName}</p>
          <p className="text-sm text-[var(--text-secondary)]">
            {withLabel} {info.doctorName} <span className="text-[var(--text-muted)]">· {info.specialty}</span>
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
