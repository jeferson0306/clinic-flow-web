"use client";

import { DataTable, type ColumnDef } from "@/components/dashboard/data-table";
import { useTranslation } from "@/lib/i18n";
import type { Doctor } from "@/lib/types";

export function DoctorsTable({ doctors }: { doctors: Doctor[] }) {
  const { t } = useTranslation();

  const columns: ColumnDef<Doctor>[] = [
    { id: "fullName", header: t("doctors.full_name"), accessorFn: (d) => d.fullName },
    { id: "specialty", header: t("doctors.specialty"), accessorFn: (d) => d.specialty },
    { id: "licenseNumber", header: t("doctors.license_number"), accessorFn: (d) => d.licenseNumber },
    { id: "email", header: t("doctors.email"), accessorFn: (d) => d.email },
    { id: "maskedCpf", header: t("doctors.cpf"), accessorFn: (d) => d.maskedCpf, enableSorting: false },
  ];

  return (
    <DataTable
      columns={columns}
      data={doctors}
      emptyLabel={t("common.empty")}
      searchPlaceholder={t("common.search")}
    />
  );
}
