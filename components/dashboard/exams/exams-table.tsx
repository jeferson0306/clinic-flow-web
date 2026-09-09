"use client";

import { useMemo } from "react";
import { DataTable, type ColumnDef } from "@/components/dashboard/data-table";
import { RecordResultDialog } from "@/components/dashboard/exams/record-result-dialog";
import { useTranslation } from "@/lib/i18n";
import { formatDatetime } from "@/lib/utils";
import type { Doctor, Exam, Patient } from "@/lib/types";

export function ExamsTable({
  exams,
  patients,
  doctors,
  canManage,
}: {
  exams: Exam[];
  patients: Patient[];
  doctors: Doctor[];
  canManage: boolean;
}) {
  const { t } = useTranslation();

  const patientName = useMemo(() => new Map(patients.map((p) => [p.id, p.fullName])), [patients]);
  const doctorName = useMemo(() => new Map(doctors.map((d) => [d.id, d.fullName])), [doctors]);

  const columns: ColumnDef<Exam>[] = [
    { id: "patient", header: t("exams.patient"), accessorFn: (e) => patientName.get(e.patientId) ?? e.patientId },
    { id: "type", header: t("exams.type"), accessorFn: (e) => e.type },
    {
      id: "requestedBy",
      header: t("exams.requested_by"),
      accessorFn: (e) => doctorName.get(e.requestedByDoctorId) ?? e.requestedByDoctorId,
    },
    {
      id: "requestedAt",
      header: t("exams.requested_at"),
      accessorFn: (e) => e.requestedAt,
      // suppressHydrationWarning: formatDatetime resolves to the browser's
      // locale/timezone, which differs from the server's during SSR — an
      // expected, one-time mismatch corrected on hydration, not a real bug.
      cell: (info) => <span suppressHydrationWarning>{formatDatetime(info.getValue<string>())}</span>,
    },
    { id: "result", header: t("exams.result"), accessorFn: (e) => e.result ?? t("exams.no_result") },
  ];

  if (canManage) {
    columns.push({
      id: "actions",
      header: t("common.actions"),
      enableSorting: false,
      cell: ({ row }) => (row.original.result ? null : <RecordResultDialog examId={row.original.id} />),
    });
  }

  return (
    <DataTable
      columns={columns}
      data={exams}
      emptyLabel={t("common.empty")}
      searchPlaceholder={t("common.search")}
    />
  );
}
