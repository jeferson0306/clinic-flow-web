import { api } from "@/lib/api";
import { getDictionary } from "@/lib/i18n-server";
import { formatDatetime } from "@/lib/utils";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { ScheduleDialog } from "@/components/dashboard/appointments/schedule-dialog";
import { CancelButton } from "@/components/dashboard/appointments/cancel-button";
import type { Appointment, Doctor, Patient, Procedure } from "@/lib/types";

export default async function AppointmentsPage() {
  const [t, appointments, patients, doctors, procedures] = await Promise.all([
    getDictionary(),
    api.appointments.list().catch(() => [] as Appointment[]),
    api.patients.list().catch(() => [] as Patient[]),
    api.doctors.list().catch(() => [] as Doctor[]),
    api.procedures.list().catch(() => [] as Procedure[]),
  ]);

  const patientName = new Map(patients.map((p) => [p.id, p.fullName]));
  const doctorName = new Map(doctors.map((d) => [d.id, d.fullName]));
  const procedureName = new Map(procedures.map((p) => [p.id, p.name]));

  const columns: Column<Appointment>[] = [
    { header: t("appointments.patient"), cell: (a) => patientName.get(a.patientId) ?? a.patientId },
    { header: t("appointments.doctor"), cell: (a) => doctorName.get(a.doctorId) ?? a.doctorId },
    { header: t("appointments.procedure"), cell: (a) => procedureName.get(a.procedureId) ?? a.procedureId },
    { header: t("appointments.date"), cell: (a) => formatDatetime(a.startsAt) },
    {
      header: t("appointments.status"),
      cell: (a) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            a.status === "SCHEDULED"
              ? "bg-[var(--color-success)]/15 text-[var(--color-success)]"
              : "bg-[var(--color-danger)]/15 text-[var(--color-danger)]"
          }`}
        >
          {a.status === "SCHEDULED" ? t("appointments.status_scheduled") : t("appointments.status_cancelled")}
        </span>
      ),
    },
    {
      header: t("common.actions"),
      cell: (a) => (a.status === "SCHEDULED" ? <CancelButton appointmentId={a.id} /> : null),
    },
  ];

  return (
    <main className="p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-base font-semibold text-[var(--text-primary)] mb-1">{t("appointments.title")}</h1>
          <p className="text-sm text-[var(--text-secondary)]">{t("appointments.subtitle")}</p>
        </div>
        <ScheduleDialog patients={patients} doctors={doctors} procedures={procedures} />
      </div>

      <DataTable columns={columns} rows={appointments} emptyLabel={t("common.empty")} />
    </main>
  );
}
