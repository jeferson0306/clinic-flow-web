import { api } from "@/lib/api";
import { getSession } from "@/lib/session";
import { getDictionary } from "@/lib/i18n-server";
import { PortalNextAppointmentCard } from "@/components/portal/next-appointment-card";
import type { Appointment, Doctor, Exam, Procedure } from "@/lib/types";

function nextAppointment(appointments: Appointment[], doctors: Doctor[], procedures: Procedure[]) {
  const now = Date.now();
  const upcoming = appointments
    .filter((a) => a.status === "SCHEDULED" && new Date(a.startsAt).getTime() >= now)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0];
  if (!upcoming) return null;

  const doctor = doctors.find((d) => d.id === upcoming.doctorId);
  const procedure = procedures.find((p) => p.id === upcoming.procedureId);
  if (!doctor) return null;

  return {
    doctorName: doctor.fullName,
    specialty: doctor.specialty,
    procedureName: procedure?.name ?? "",
    startsAt: upcoming.startsAt,
  };
}

function upcomingAppointments(appointments: Appointment[], limit: number): Appointment[] {
  const now = Date.now();
  return appointments
    .filter((a) => a.status === "SCHEDULED" && new Date(a.startsAt).getTime() >= now)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .slice(0, limit);
}

export default async function PortalHomePage() {
  const [session, t] = await Promise.all([getSession(), getDictionary()]);

  const [patient, appointments, doctors, procedures, exams] = await Promise.all([
    api.me.patient().catch(() => null),
    api.me.appointments().catch(() => [] as Appointment[]),
    api.doctors.list().catch(() => [] as Doctor[]),
    api.procedures.list().catch(() => [] as Procedure[]),
    api.me.exams().catch(() => [] as Exam[]),
  ]);

  const upcoming = upcomingAppointments(appointments, 5);
  const recentExams = exams.slice(0, 5);

  return (
    <main className="p-6">
      <h1 className="text-base font-semibold text-[var(--text-primary)] mb-1">
        {t("portal.welcome")}, {patient?.fullName ?? session?.email}
      </h1>

      <div className="mt-6">
        <PortalNextAppointmentCard
          info={nextAppointment(appointments, doctors, procedures)}
          title={t("portal.next_appointment_title")}
          emptyLabel={t("portal.next_appointment_empty")}
          withLabel={t("portal.with_doctor")}
        />
      </div>

      <div className="mt-8">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">
          {t("portal.upcoming_section_title")}
        </p>
        {upcoming.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">{t("portal.appointments_empty")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {upcoming.map((a) => {
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
                  <p suppressHydrationWarning className="text-xs text-[var(--text-secondary)] shrink-0">
                    {new Date(a.startsAt).toLocaleString(undefined, {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-8">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">
          {t("portal.recent_exams_title")}
        </p>
        {recentExams.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">{t("portal.recent_exams_empty")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {recentExams.map((exam) => (
              <div
                key={exam.id}
                className="flex items-center justify-between gap-4 rounded-[10px] border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{exam.type}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{exam.result ?? t("exams.no_result")}</p>
                </div>
                <p suppressHydrationWarning className="text-xs text-[var(--text-secondary)] shrink-0">
                  {new Date(exam.requestedAt).toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
