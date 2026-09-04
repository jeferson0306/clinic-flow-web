"use client";

import { DataTable, type ColumnDef } from "@/components/dashboard/data-table";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { EditDoctorDialog } from "@/components/dashboard/doctors/edit-doctor-dialog";
import { deleteDoctor } from "@/app/actions/doctors";
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
    {
      id: "actions",
      header: t("common.actions"),
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <EditDoctorDialog doctor={row.original} />
          <DeleteButton id={row.original.id} deleteAction={deleteDoctor} />
        </div>
      ),
    },
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
