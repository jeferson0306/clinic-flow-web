import { api } from "@/lib/api";
import { getDictionary } from "@/lib/i18n-server";
import { ExamsTable } from "@/components/dashboard/exams/exams-table";
import { NewExamDialog } from "@/components/dashboard/exams/new-exam-dialog";
import type { Doctor, Exam, Patient } from "@/lib/types";

export default async function ExamsPage() {
  const [t, exams, patients, doctors] = await Promise.all([
    getDictionary(),
    api.exams.list().catch(() => [] as Exam[]),
    api.patients.list().catch(() => [] as Patient[]),
    api.doctors.list().catch(() => [] as Doctor[]),
  ]);

  return (
    <main className="p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-base font-semibold text-[var(--text-primary)] mb-1">{t("exams.title")}</h1>
          <p className="text-sm text-[var(--text-secondary)]">{t("exams.subtitle")}</p>
        </div>
        <NewExamDialog patients={patients} doctors={doctors} />
      </div>

      <ExamsTable exams={exams} patients={patients} doctors={doctors} />
    </main>
  );
}
