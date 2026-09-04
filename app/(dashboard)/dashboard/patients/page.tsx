import { api } from "@/lib/api";
import { getDictionary } from "@/lib/i18n-server";
import { PatientsTable } from "@/components/dashboard/patients/patients-table";
import { NewPatientDialog } from "@/components/dashboard/patients/new-patient-dialog";
import type { Patient } from "@/lib/types";

export default async function PatientsPage() {
  const [t, patients] = await Promise.all([getDictionary(), api.patients.list().catch(() => [] as Patient[])]);

  return (
    <main className="p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-base font-semibold text-[var(--text-primary)] mb-1">{t("patients.title")}</h1>
          <p className="text-sm text-[var(--text-secondary)]">{t("patients.subtitle")}</p>
        </div>
        <NewPatientDialog />
      </div>

      <PatientsTable patients={patients} />
    </main>
  );
}
