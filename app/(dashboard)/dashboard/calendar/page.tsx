import { api } from "@/lib/api";
import { getDictionary } from "@/lib/i18n-server";
import { AvailabilityBrowser } from "@/components/dashboard/calendar/availability-browser";
import type { Doctor, Procedure } from "@/lib/types";

export default async function CalendarPage() {
  const [t, doctors, procedures] = await Promise.all([
    getDictionary(),
    api.doctors.list().catch(() => [] as Doctor[]),
    api.procedures.list().catch(() => [] as Procedure[]),
  ]);

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-base font-semibold text-[var(--text-primary)] mb-1">{t("calendar.title")}</h1>
        <p className="text-sm text-[var(--text-secondary)]">{t("calendar.subtitle")}</p>
      </div>

      <AvailabilityBrowser doctors={doctors} procedures={procedures} />
    </main>
  );
}
