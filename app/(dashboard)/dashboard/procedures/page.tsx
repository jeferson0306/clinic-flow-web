import { api } from "@/lib/api";
import { getSession } from "@/lib/session";
import { getDictionary } from "@/lib/i18n-server";
import { ProceduresTable } from "@/components/dashboard/procedures/procedures-table";
import { NewProcedureDialog } from "@/components/dashboard/procedures/new-procedure-dialog";
import type { Procedure } from "@/lib/types";

export default async function ProceduresPage() {
  const [t, session, procedures] = await Promise.all([
    getDictionary(),
    getSession(),
    api.procedures.list().catch(() => [] as Procedure[]),
  ]);
  // Create/edit/delete are @RolesAllowed("ADMIN") on the backend.
  const canManage = session?.role === "ADMIN";

  return (
    <main className="p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-base font-semibold text-[var(--text-primary)] mb-1">{t("procedures.title")}</h1>
          <p className="text-sm text-[var(--text-secondary)]">{t("procedures.subtitle")}</p>
        </div>
        {canManage && <NewProcedureDialog />}
      </div>

      <ProceduresTable procedures={procedures} canManage={canManage} />
    </main>
  );
}
