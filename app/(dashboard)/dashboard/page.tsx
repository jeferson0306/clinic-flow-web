import Link from "next/link";
import { CalendarClock, ClipboardList, Stethoscope, Users } from "lucide-react";
import { api } from "@/lib/api";
import { getSession } from "@/lib/session";
import { AnimatedStats, type StatColor, type StatIcon } from "@/components/dashboard/animated-stats";
import { AppointmentsChart, type DayCount } from "@/components/dashboard/appointments-chart";
import { DashboardReveal } from "@/components/dashboard/dashboard-reveal";
import { Greeting } from "@/components/dashboard/greeting";
import { NextAppointmentCard, type NextAppointmentInfo } from "@/components/dashboard/next-appointment-card";
import { SpecialtyBreakdown, type SpecialtyCount } from "@/components/dashboard/specialty-breakdown";
import { getDictionary } from "@/lib/i18n-server";
import type { Appointment, Doctor, Patient } from "@/lib/types";

function appointmentsByDay(appointments: Appointment[]): DayCount[] {
  const counts = new Map<string, number>();
  for (const a of appointments) {
    if (a.status !== "SCHEDULED") continue;
    const date = a.startsAt.slice(0, 10);
    counts.set(date, (counts.get(date) ?? 0) + 1);
  }

  const days: DayCount[] = [];
  const start = new Date();
  start.setDate(start.getDate() - 6);
  for (let i = 0; i < 14; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    days.push({ date: iso, count: counts.get(iso) ?? 0 });
  }
  return days;
}

function nextAppointment(appointments: Appointment[], patients: Patient[], doctors: Doctor[]): NextAppointmentInfo | null {
  const now = Date.now();
  const upcoming = appointments
    .filter((a) => a.status === "SCHEDULED" && new Date(a.startsAt).getTime() >= now)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0];
  if (!upcoming) return null;

  const patient = patients.find((p) => p.id === upcoming.patientId);
  const doctor = doctors.find((d) => d.id === upcoming.doctorId);
  if (!patient || !doctor) return null;

  const startsAt = new Date(upcoming.startsAt);
  const today = new Date();
  const isToday =
    startsAt.getFullYear() === today.getFullYear() &&
    startsAt.getMonth() === today.getMonth() &&
    startsAt.getDate() === today.getDate();

  return {
    patientName: patient.fullName,
    doctorName: doctor.fullName,
    specialty: doctor.specialty,
    startsAt: upcoming.startsAt,
    isToday,
  };
}

const SPECIALTY_TOP_N = 5;

function specialtyBreakdown(doctors: Doctor[], otherLabel: string): SpecialtyCount[] {
  const counts = new Map<string, number>();
  for (const d of doctors) counts.set(d.specialty, (counts.get(d.specialty) ?? 0) + 1);

  const sorted = Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  if (sorted.length <= SPECIALTY_TOP_N) return sorted;

  const top = sorted.slice(0, SPECIALTY_TOP_N);
  const otherCount = sorted.slice(SPECIALTY_TOP_N).reduce((sum, s) => sum + s.count, 0);
  return [...top, { label: otherLabel, count: otherCount }];
}

export default async function DashboardPage() {
  const [session, t] = await Promise.all([getSession(), getDictionary()]);

  const [patients, doctors, procedures, appointments] = await Promise.all([
    api.patients.list().catch(() => []),
    api.doctors.list().catch(() => []),
    api.procedures.list().catch(() => []),
    api.appointments.list().catch(() => [] as Appointment[]),
  ]);

  const stats: { label: string; value: number; icon: StatIcon; color: StatColor }[] = [
    { label: t("dashboard.patients_total"), value: patients.length, icon: "patients", color: "info" },
    { label: t("dashboard.doctors_total"), value: doctors.length, icon: "doctors", color: "success" },
    { label: t("dashboard.procedures_total"), value: procedures.length, icon: "procedures", color: "warning" },
  ];

  const quickActions: { href: string; label: string; icon: typeof Users; color: StatColor }[] = [
    { href: "/dashboard/patients", label: t("patients.new"), icon: Users, color: "info" },
    { href: "/dashboard/doctors", label: t("doctors.new"), icon: Stethoscope, color: "success" },
    { href: "/dashboard/procedures", label: t("procedures.new"), icon: ClipboardList, color: "warning" },
    { href: "/dashboard/appointments", label: t("appointments.new"), icon: CalendarClock, color: "accent" },
  ];

  const ACTION_COLOR: Record<StatColor, string> = {
    accent: "var(--accent)",
    info: "var(--color-info)",
    success: "var(--color-success)",
    warning: "var(--color-warning)",
  };

  return (
    <main className="p-6">
      <h1 className="text-base font-semibold text-[var(--text-primary)] mb-1">{t("dashboard.title")}</h1>
      <Greeting
        email={session?.email ?? ""}
        fallback={t("dashboard.welcome")}
        morning={t("dashboard.greeting_morning")}
        afternoon={t("dashboard.greeting_afternoon")}
        evening={t("dashboard.greeting_evening")}
      />

      <DashboardReveal>
        <div data-reveal className="mt-6">
          <AnimatedStats stats={stats} />
        </div>

        <div data-reveal className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <NextAppointmentCard
            info={nextAppointment(appointments, patients, doctors)}
            title={t("dashboard.next_appointment_title")}
            emptyLabel={t("dashboard.next_appointment_empty")}
            todayLabel={t("dashboard.next_appointment_today")}
            upcomingLabel={t("dashboard.next_appointment_upcoming")}
          />
          <SpecialtyBreakdown
            data={specialtyBreakdown(doctors, t("dashboard.specialty_other"))}
            title={t("dashboard.specialty_breakdown_title")}
            emptyLabel={t("dashboard.specialty_breakdown_empty")}
            otherLabel={t("dashboard.specialty_other")}
          />
        </div>

        <div data-reveal className="mt-4">
          <AppointmentsChart
            data={appointmentsByDay(appointments)}
            title={t("dashboard.appointments_chart_title")}
            emptyLabel={t("dashboard.appointments_chart_empty")}
          />
        </div>

        <div data-reveal className="mt-8">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">
            {t("dashboard.quick_actions")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map(({ href, label, icon: Icon, color }) => {
              const c = ACTION_COLOR[color];
              return (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-3 rounded-[10px] border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-transform duration-200 group-hover:scale-110"
                    style={{ background: `color-mix(in srgb, ${c} 15%, transparent)`, color: c }}
                  >
                    <Icon size={16} />
                  </span>
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </DashboardReveal>
    </main>
  );
}
