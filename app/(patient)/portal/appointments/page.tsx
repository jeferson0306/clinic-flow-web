import { api } from "@/lib/api";
import { getDictionary } from "@/lib/i18n-server";
import type { Appointment, Doctor, Procedure } from "@/lib/types";

export default async function PortalAppointmentsPage() {
  const [t, appointments, doctors, procedures] = await Promise.all([
    getDictionary(),
    api.me.appointments().catch(() => [] as Appointment[]),
    api.doctors.list().catch(() => [] as Doctor[]),
    api.procedures.list().catch(() => [] as Procedure[]),
  ]);

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-base font-semibold text-[var(--text-primary)] mb-1">{t("portal.appointments_title")}</h1>
        <p className="text-sm text-[var(--text-secondary)]">{t("portal.appointments_subtitle")}</p>
      </div>

      {appointments.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">{t("portal.appointments_empty")}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {appointments.map((a) => {
            const doctor = doctors.find((d) => d.id === a.doctorId);
            const procedure = procedures.find((p) => p.id === a.procedureId);
            return (
              <div
                key={a.id}
                className="flex items-center justify-between gap-4 rounded-[10px] border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{procedure?.name ?? "—"}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    {doctor?.fullName ?? "—"} · {doctor?.specialty ?? "—"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p suppressHydrationWarning className="text-xs text-[var(--text-secondary)]">
                    {new Date(a.startsAt).toLocaleString(undefined, {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p
                    className={
                      a.status === "SCHEDULED"
                        ? "text-xs font-medium text-[var(--color-success)]"
                        : "text-xs font-medium text-[var(--text-muted)]"
                    }
                  >
                    {a.status === "SCHEDULED" ? t("appointments.status_scheduled") : t("appointments.status_cancelled")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
