import { api } from "@/lib/api";
import { getDictionary } from "@/lib/i18n-server";
import { formatDatetime } from "@/lib/utils";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { NewExamDialog } from "@/components/dashboard/exams/new-exam-dialog";
import { RecordResultDialog } from "@/components/dashboard/exams/record-result-dialog";
import type { Doctor, Exam, Patient } from "@/lib/types";

export default async function ExamsPage() {
  const [t, exams, patients, doctors] = await Promise.all([
    getDictionary(),
    api.exams.list().catch(() => [] as Exam[]),
    api.patients.list().catch(() => [] as Patient[]),
    api.doctors.list().catch(() => [] as Doctor[]),
  ]);

  const patientName = new Map(patients.map((p) => [p.id, p.fullName]));
  const doctorName = new Map(doctors.map((d) => [d.id, d.fullName]));

  const columns: Column<Exam>[] = [
    { header: t("exams.patient"), cell: (e) => patientName.get(e.patientId) ?? e.patientId },
    { header: t("exams.type"), cell: (e) => e.type },
    { header: t("exams.requested_by"), cell: (e) => doctorName.get(e.requestedByDoctorId) ?? e.requestedByDoctorId },
    { header: t("exams.requested_at"), cell: (e) => formatDatetime(e.requestedAt) },
    { header: t("exams.result"), cell: (e) => e.result ?? t("exams.no_result") },
    {
      header: t("common.actions"),
      cell: (e) => (e.result ? null : <RecordResultDialog examId={e.id} />),
    },
  ];

  return (
    <main className="p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-base font-semibold text-[var(--text-primary)] mb-1">{t("exams.title")}</h1>
          <p className="text-sm text-[var(--text-secondary)]">{t("exams.subtitle")}</p>
        </div>
        <NewExamDialog patients={patients} doctors={doctors} />
      </div>

      <DataTable columns={columns} rows={exams} emptyLabel={t("common.empty")} />
    </main>
  );
}
