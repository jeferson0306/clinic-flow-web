import Link from "next/link";
import { CalendarClock, ClipboardList, Stethoscope, Users } from "lucide-react";
import { api } from "@/lib/api";
import { getSession } from "@/lib/session";
import { AnimatedStats } from "@/components/dashboard/animated-stats";
import { getDictionary } from "@/lib/i18n-server";

export default async function DashboardPage() {
  const [session, t] = await Promise.all([getSession(), getDictionary()]);

  const [patients, doctors, procedures] = await Promise.all([
    api.patients.list().catch(() => []),
    api.doctors.list().catch(() => []),
    api.procedures.list().catch(() => []),
  ]);

  const stats = [
    { label: t("dashboard.patients_total"), value: patients.length },
    { label: t("dashboard.doctors_total"), value: doctors.length },
    { label: t("dashboard.procedures_total"), value: procedures.length },
  ];

  const quickActions = [
    { href: "/dashboard/patients", label: t("patients.new"), icon: Users },
    { href: "/dashboard/doctors", label: t("doctors.new"), icon: Stethoscope },
    { href: "/dashboard/procedures", label: t("procedures.new"), icon: ClipboardList },
    { href: "/dashboard/appointments", label: t("appointments.new"), icon: CalendarClock },
  ];

  return (
    <main className="p-6">
      <h1 className="text-base font-semibold text-[var(--text-primary)] mb-1">{t("dashboard.title")}</h1>
      <p className="text-sm text-[var(--text-secondary)]">
        {t("dashboard.welcome")}, {session?.username}
      </p>

      <div className="mt-6">
        <AnimatedStats stats={stats} />
      </div>

      <div className="mt-8">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">
          {t("dashboard.quick_actions")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-[10px] border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <Icon size={16} className="shrink-0 text-[var(--accent)]" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
