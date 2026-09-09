import { api } from "@/lib/api";
import { getSession } from "@/lib/session";
import { getDictionary } from "@/lib/i18n-server";
import { PatientsTable } from "@/components/dashboard/patients/patients-table";
import { NewPatientDialog } from "@/components/dashboard/patients/new-patient-dialog";
import type { Patient } from "@/lib/types";

export default async function PatientsPage() {
  const [t, session, patients] = await Promise.all([
    getDictionary(),
    getSession(),
    api.patients.list().catch(() => [] as Patient[]),
  ]);
  // Create/update are @RolesAllowed("ADMIN","RECEPCAO") on the backend,
  // delete stays ADMIN-only — a session hitting a control it lacks the
  // backend role for would just get a 403, so the controls don't render for
  // it at all rather than offering an action that fails.
  const canEdit = session?.role === "ADMIN" || session?.role === "RECEPCAO";
  const canDelete = session?.role === "ADMIN";

  return (
    <main className="p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-base font-semibold text-[var(--text-primary)] mb-1">{t("patients.title")}</h1>
          <p className="text-sm text-[var(--text-secondary)]">{t("patients.subtitle")}</p>
        </div>
        {canEdit && <NewPatientDialog />}
      </div>

      <PatientsTable patients={patients} canEdit={canEdit} canDelete={canDelete} />
    </main>
  );
}
