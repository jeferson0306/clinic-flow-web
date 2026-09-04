"use client";

import { useMemo } from "react";
import { DataTable, type ColumnDef } from "@/components/dashboard/data-table";
import { CancelButton } from "@/components/dashboard/appointments/cancel-button";
import { useTranslation } from "@/lib/i18n";
import { formatDatetime } from "@/lib/utils";
import type { Appointment, Doctor, Patient, Procedure } from "@/lib/types";

export function AppointmentsTable({
  appointments,
  patients,
  doctors,
  procedures,
}: {
  appointments: Appointment[];
  patients: Patient[];
  doctors: Doctor[];
  procedures: Procedure[];
}) {
  const { t } = useTranslation();

  const patientName = useMemo(() => new Map(patients.map((p) => [p.id, p.fullName])), [patients]);
  const doctorName = useMemo(() => new Map(doctors.map((d) => [d.id, d.fullName])), [doctors]);
  const procedureName = useMemo(() => new Map(procedures.map((p) => [p.id, p.name])), [procedures]);

  const columns: ColumnDef<Appointment>[] = [
    { id: "patient", header: t("appointments.patient"), accessorFn: (a) => patientName.get(a.patientId) ?? a.patientId },
    { id: "doctor", header: t("appointments.doctor"), accessorFn: (a) => doctorName.get(a.doctorId) ?? a.doctorId },
    {
      id: "procedure",
      header: t("appointments.procedure"),
      accessorFn: (a) => procedureName.get(a.procedureId) ?? a.procedureId,
    },
    {
      id: "startsAt",
      header: t("appointments.date"),
      accessorFn: (a) => a.startsAt,
      cell: (info) => formatDatetime(info.getValue<string>()),
    },
    {
      id: "status",
      header: t("appointments.status"),
      accessorFn: (a) => a.status,
      cell: (info) => {
        const status = info.getValue<Appointment["status"]>();
        return (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              status === "SCHEDULED"
                ? "bg-[var(--color-success)]/15 text-[var(--color-success)]"
                : "bg-[var(--color-danger)]/15 text-[var(--color-danger)]"
            }`}
          >
            {status === "SCHEDULED" ? t("appointments.status_scheduled") : t("appointments.status_cancelled")}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: t("common.actions"),
      enableSorting: false,
      cell: ({ row }) =>
        row.original.status === "SCHEDULED" ? <CancelButton appointmentId={row.original.id} /> : null,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={appointments}
      emptyLabel={t("common.empty")}
      searchPlaceholder={t("common.search")}
    />
  );
}
