import { api } from "@/lib/api";
import { getSession } from "@/lib/session";
import { getDictionary } from "@/lib/i18n-server";
import { DoctorsTable } from "@/components/dashboard/doctors/doctors-table";
import { NewDoctorDialog } from "@/components/dashboard/doctors/new-doctor-dialog";
import type { Doctor } from "@/lib/types";

export default async function DoctorsPage() {
  const [t, session, doctors] = await Promise.all([
    getDictionary(),
    getSession(),
    api.doctors.list().catch(() => [] as Doctor[]),
  ]);
  // Create/edit/delete are @RolesAllowed("ADMIN") on the backend.
  const canManage = session?.role === "ADMIN";

  return (
    <main className="p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-base font-semibold text-[var(--text-primary)] mb-1">{t("doctors.title")}</h1>
          <p className="text-sm text-[var(--text-secondary)]">{t("doctors.subtitle")}</p>
        </div>
        {canManage && <NewDoctorDialog />}
      </div>

      <DoctorsTable doctors={doctors} canManage={canManage} />
    </main>
  );
}
