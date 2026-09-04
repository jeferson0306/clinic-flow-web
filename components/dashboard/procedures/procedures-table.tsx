"use client";

import { DataTable, type ColumnDef } from "@/components/dashboard/data-table";
import { useTranslation } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import type { Procedure } from "@/lib/types";

export function ProceduresTable({ procedures }: { procedures: Procedure[] }) {
  const { t } = useTranslation();

  const columns: ColumnDef<Procedure>[] = [
    { id: "name", header: t("procedures.name"), accessorFn: (p) => p.name },
    {
      id: "duration",
      header: t("procedures.duration"),
      accessorFn: (p) => p.durationMinutes,
      cell: (info) => `${info.getValue<number>()} min`,
    },
    {
      id: "price",
      header: t("procedures.price"),
      accessorFn: (p) => p.priceCents,
      cell: (info) => formatCurrency(info.getValue<number>() / 100),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={procedures}
      emptyLabel={t("common.empty")}
      searchPlaceholder={t("common.search")}
    />
  );
}
