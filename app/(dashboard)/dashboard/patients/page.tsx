import { api } from "@/lib/api";
import { getDictionary } from "@/lib/i18n-server";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { NewPatientDialog } from "@/components/dashboard/patients/new-patient-dialog";
import type { Patient } from "@/lib/types";

export default async function PatientsPage() {
  const [t, patients] = await Promise.all([getDictionary(), api.patients.list().catch(() => [] as Patient[])]);

  const columns: Column<Patient>[] = [
    { header: t("patients.full_name"), cell: (p) => p.fullName },
    { header: t("patients.masked_cpf"), cell: (p) => p.maskedCpf },
    { header: t("patients.email"), cell: (p) => p.email },
    { header: t("patients.phone"), cell: (p) => p.phone ?? "—" },
    {
      header: t("patients.address"),
      cell: (p) => (p.address.city ? `${p.address.city} — ${p.address.state}` : p.address.postcode),
    },
  ];

  return (
    <main className="p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-base font-semibold text-[var(--text-primary)] mb-1">{t("patients.title")}</h1>
          <p className="text-sm text-[var(--text-secondary)]">{t("patients.subtitle")}</p>
        </div>
        <NewPatientDialog />
      </div>

      <DataTable columns={columns} rows={patients} emptyLabel={t("common.empty")} />
    </main>
  );
}
