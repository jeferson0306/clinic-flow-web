import { api } from "@/lib/api";
import { getDictionary } from "@/lib/i18n-server";
import { formatCurrency } from "@/lib/utils";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { NewProcedureDialog } from "@/components/dashboard/procedures/new-procedure-dialog";
import type { Procedure } from "@/lib/types";

export default async function ProceduresPage() {
  const [t, procedures] = await Promise.all([
    getDictionary(),
    api.procedures.list().catch(() => [] as Procedure[]),
  ]);

  const columns: Column<Procedure>[] = [
    { header: t("procedures.name"), cell: (p) => p.name },
    { header: t("procedures.duration"), cell: (p) => `${p.durationMinutes} min` },
    { header: t("procedures.price"), cell: (p) => formatCurrency(p.priceCents / 100) },
  ];

  return (
    <main className="p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-base font-semibold text-[var(--text-primary)] mb-1">{t("procedures.title")}</h1>
          <p className="text-sm text-[var(--text-secondary)]">{t("procedures.subtitle")}</p>
        </div>
        <NewProcedureDialog />
      </div>

      <DataTable columns={columns} rows={procedures} emptyLabel={t("common.empty")} />
    </main>
  );
}
