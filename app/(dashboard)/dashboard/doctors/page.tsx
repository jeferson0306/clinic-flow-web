import { api } from "@/lib/api";
import { getDictionary } from "@/lib/i18n-server";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { NewDoctorDialog } from "@/components/dashboard/doctors/new-doctor-dialog";
import type { Doctor } from "@/lib/types";

export default async function DoctorsPage() {
  const [t, doctors] = await Promise.all([getDictionary(), api.doctors.list().catch(() => [] as Doctor[])]);

  const columns: Column<Doctor>[] = [
    { header: t("doctors.full_name"), cell: (d) => d.fullName },
    { header: t("doctors.specialty"), cell: (d) => d.specialty },
    { header: t("doctors.license_number"), cell: (d) => d.licenseNumber },
    { header: t("doctors.email"), cell: (d) => d.email },
    { header: t("doctors.cpf"), cell: (d) => d.maskedCpf },
  ];

  return (
    <main className="p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-base font-semibold text-[var(--text-primary)] mb-1">{t("doctors.title")}</h1>
          <p className="text-sm text-[var(--text-secondary)]">{t("doctors.subtitle")}</p>
        </div>
        <NewDoctorDialog />
      </div>

      <DataTable columns={columns} rows={doctors} emptyLabel={t("common.empty")} />
    </main>
  );
}
