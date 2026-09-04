"use client";

import { DataTable, type ColumnDef } from "@/components/dashboard/data-table";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { EditPatientDialog } from "@/components/dashboard/patients/edit-patient-dialog";
import { deletePatient } from "@/app/actions/patients";
import { useTranslation } from "@/lib/i18n";
import type { Patient } from "@/lib/types";

/**
 * A client component, not the Server Component page itself, because
 * `ColumnDef.cell`/`accessorFn` are functions — React Server Components
 * cannot pass functions as props to a Client Component (DataTable), so the
 * column definitions have to be built on the client side that consumes them.
 * `patients` itself is plain, serializable data and crosses that boundary fine.
 */
export function PatientsTable({ patients }: { patients: Patient[] }) {
  const { t } = useTranslation();

  const columns: ColumnDef<Patient>[] = [
    { id: "fullName", header: t("patients.full_name"), accessorFn: (p) => p.fullName },
    { id: "maskedCpf", header: t("patients.masked_cpf"), accessorFn: (p) => p.maskedCpf, enableSorting: false },
    { id: "email", header: t("patients.email"), accessorFn: (p) => p.email },
    { id: "phone", header: t("patients.phone"), accessorFn: (p) => p.phone ?? "—" },
    {
      id: "address",
      header: t("patients.address"),
      accessorFn: (p) => (p.address.city ? `${p.address.city} — ${p.address.state}` : p.address.postcode),
    },
    {
      id: "actions",
      header: t("common.actions"),
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <EditPatientDialog patient={row.original} />
          <DeleteButton id={row.original.id} deleteAction={deletePatient} />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={patients}
      emptyLabel={t("common.empty")}
      searchPlaceholder={t("common.search")}
    />
  );
}
