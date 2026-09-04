import { api } from "@/lib/api";
import { getDictionary } from "@/lib/i18n-server";
import { AppointmentsTable } from "@/components/dashboard/appointments/appointments-table";
import { ScheduleDialog } from "@/components/dashboard/appointments/schedule-dialog";
import type { Appointment, Doctor, Patient, Procedure } from "@/lib/types";

export default async function AppointmentsPage() {
  const [t, appointments, patients, doctors, procedures] = await Promise.all([
    getDictionary(),
    api.appointments.list().catch(() => [] as Appointment[]),
    api.patients.list().catch(() => [] as Patient[]),
    api.doctors.list().catch(() => [] as Doctor[]),
    api.procedures.list().catch(() => [] as Procedure[]),
  ]);

  return (
    <main className="p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-base font-semibold text-[var(--text-primary)] mb-1">{t("appointments.title")}</h1>
          <p className="text-sm text-[var(--text-secondary)]">{t("appointments.subtitle")}</p>
        </div>
        <ScheduleDialog patients={patients} doctors={doctors} procedures={procedures} />
      </div>

      <AppointmentsTable
        appointments={appointments}
        patients={patients}
        doctors={doctors}
        procedures={procedures}
      />
    </main>
  );
}
