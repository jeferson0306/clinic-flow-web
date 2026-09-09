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
  // Create/edit/delete are @RolesAllowed("ADMIN") on the backend — a DOCTOR
  // session hitting one of those would just get a 403, so the controls
  // don't render for them at all rather than offering an action that fails.
  const canManage = session?.role === "ADMIN";

  return (
    <main className="p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-base font-semibold text-[var(--text-primary)] mb-1">{t("patients.title")}</h1>
          <p className="text-sm text-[var(--text-secondary)]">{t("patients.subtitle")}</p>
        </div>
        {canManage && <NewPatientDialog />}
      </div>

      <PatientsTable patients={patients} canManage={canManage} />
    </main>
  );
}
