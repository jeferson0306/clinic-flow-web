"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CalendarClock,
  ClipboardList,
  FlaskConical,
  Github,
  Moon,
  Plus,
  Stethoscope,
  Sun,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";
import { LOCALE_LABELS, useTranslation, type Locale } from "@/lib/i18n";

const BACKEND_REPO = "https://github.com/jeferson0306/clinic-flow";
const FRONTEND_REPO = "https://github.com/jeferson0306/clinic-flow-web";

const FEATURES = [
  { icon: Users, titleKey: "landing.feature_patients_title", bodyKey: "landing.feature_patients_body" },
  { icon: Stethoscope, titleKey: "landing.feature_doctors_title", bodyKey: "landing.feature_doctors_body" },
  { icon: ClipboardList, titleKey: "landing.feature_procedures_title", bodyKey: "landing.feature_procedures_body" },
  { icon: CalendarClock, titleKey: "landing.feature_appointments_title", bodyKey: "landing.feature_appointments_body" },
  { icon: FlaskConical, titleKey: "landing.feature_exams_title", bodyKey: "landing.feature_exams_body" },
  { icon: Activity, titleKey: "landing.feature_health_title", bodyKey: "landing.feature_health_body" },
] as const;

const STACK_BADGES = ["Java 25 · Quarkus", "Next.js 16 · React 19", "PostgreSQL (Neon)", "JWT · RBAC", "AWS S3 · SNS · SQS"];

function Logo() {
  return (
    <div className="w-6 h-6 rounded-md bg-[var(--accent)] flex items-center justify-center shrink-0">
      <Plus size={13} className="text-white" strokeWidth={3} />
    </div>
  );
}

function Navbar() {
  const { t, locale, setLocale } = useTranslation();
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg-body)]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-sm font-bold">{t("app.name")}</span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--text-secondary)]">
          <a href="#features" className="hover:text-[var(--text-primary)] transition-colors">
            {t("landing.nav_features")}
          </a>
          <a href="#how" className="hover:text-[var(--text-primary)] transition-colors">
            {t("landing.nav_how")}
          </a>
          <a href="#stack" className="hover:text-[var(--text-primary)] transition-colors">
            {t("landing.nav_stack")}
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <select
            aria-label="Locale"
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            className="hidden sm:block h-8 rounded-lg border border-[var(--border)] bg-transparent px-2 text-xs text-[var(--text-secondary)]"
          >
            {(Object.keys(LOCALE_LABELS) as Locale[]).map((l) => (
              <option key={l} value={l}>
                {LOCALE_LABELS[l].flag} {LOCALE_LABELS[l].label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle theme"
            className="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <Button asChild size="sm">
            <Link href="/login">{t("landing.nav_demo")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function HeroMock() {
  const { t } = useTranslation();
  return (
    <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow)] p-4 sm:p-5">
      <div className="flex items-center gap-1.5 mb-4">
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-danger)]/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-warning)]/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-success)]/60" />
      </div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[var(--text-secondary)]">{t("landing.mock_patients")}</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-dim)] text-[var(--accent)]">
          {t("landing.mock_today")}
        </span>
      </div>
      {[72, 88, 60].map((w, i) => (
        <div key={i} className="flex items-center gap-2 py-2 border-b border-[var(--border)] last:border-0">
          <div className="w-7 h-7 rounded-full bg-[var(--bg-hover)] shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2 rounded bg-[var(--bg-hover)]" style={{ width: `${w}%` }} />
            <div className="h-1.5 rounded bg-[var(--bg-hover)] opacity-60" style={{ width: `${w - 20}%` }} />
          </div>
        </div>
      ))}
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-[var(--color-success)]/10 px-3 py-2">
        <CalendarClock size={14} className="text-[var(--color-success)] shrink-0" />
        <span className="text-[11px] text-[var(--color-success)]">{t("landing.mock_no_conflict")}</span>
      </div>
    </div>
  );
}

function Hero() {
  const { t } = useTranslation();
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 pt-16 pb-20 md:pt-24 md:pb-28 grid md:grid-cols-2 gap-10 md:gap-8 items-center">
      <div>
        <span className="inline-block text-xs font-medium text-[var(--accent)] bg-[var(--accent-dim)] rounded-full px-3 py-1 mb-5">
          {t("landing.hero_badge")}
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-5">
          {t("landing.hero_headline")}
        </h1>
        <p className="text-base sm:text-lg text-[var(--text-secondary)] mb-8 max-w-md">
          {t("landing.hero_subhead")}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link href="/login">
              {t("landing.hero_cta_primary")} <ArrowRight size={16} />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <a href={FRONTEND_REPO} target="_blank" rel="noopener noreferrer">
              <Github size={16} /> {t("landing.hero_cta_secondary")}
            </a>
          </Button>
        </div>
        <p className="mt-4 text-xs text-[var(--text-muted)]">{t("landing.hero_note")}</p>
      </div>
      <HeroMock />
    </section>
  );
}

function About() {
  const { t } = useTranslation();
  return (
    <section id="stack" className="border-y border-[var(--border)] bg-[var(--bg-surface)]">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-14 md:py-20">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 max-w-xl">{t("landing.about_title")}</h2>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] mb-6 max-w-2xl">{t("landing.about_body")}</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {STACK_BADGES.map((b) => (
            <span
              key={b}
              className="text-xs font-medium text-[var(--text-secondary)] border border-[var(--border)] rounded-full px-3 py-1.5"
            >
              {b}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-5 text-sm">
          <a
            href={BACKEND_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[var(--accent)] hover:underline"
          >
            <Github size={15} /> {t("landing.about_link_backend")}
          </a>
          <a
            href={FRONTEND_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[var(--accent)] hover:underline"
          >
            <Github size={15} /> {t("landing.about_link_frontend")}
          </a>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const { t } = useTranslation();
  return (
    <section id="features" className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
      <div className="max-w-xl mb-10 md:mb-14">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">{t("landing.features_title")}</h2>
        <p className="text-[var(--text-secondary)]">{t("landing.features_subtitle")}</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map(({ icon: Icon, titleKey, bodyKey }) => (
          <div
            key={titleKey}
            className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 hover:border-[var(--accent)]/40 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-[var(--accent-dim)] flex items-center justify-center mb-3.5">
              <Icon size={17} className="text-[var(--accent)]" />
            </div>
            <h3 className="font-semibold text-sm mb-1.5">{t(titleKey)}</h3>
            <p className="text-sm text-[var(--text-secondary)]">{t(bodyKey)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const { t } = useTranslation();
  const steps = [
    { titleKey: "landing.how_step1_title", bodyKey: "landing.how_step1_body" },
    { titleKey: "landing.how_step2_title", bodyKey: "landing.how_step2_body" },
    { titleKey: "landing.how_step3_title", bodyKey: "landing.how_step3_body" },
  ];
  return (
    <section id="how" className="border-y border-[var(--border)] bg-[var(--bg-surface)]">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <h2 className="text-2xl sm:text-3xl font-bold mb-10 md:mb-14 max-w-xl">{t("landing.how_title")}</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {steps.map(({ titleKey, bodyKey }, i) => (
            <div key={titleKey}>
              <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white text-sm font-bold flex items-center justify-center mb-4">
                {i + 1}
              </div>
              <h3 className="font-semibold mb-1.5">{t(titleKey)}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{t(bodyKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaFinal() {
  const { t } = useTranslation();
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] p-8 md:p-12 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">{t("landing.cta_title")}</h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">{t("landing.cta_body")}</p>

        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-hover)] px-4 py-2.5 text-left">
            <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)] mb-0.5">
              {t("landing.cta_admin_label")}
            </p>
            <p className="text-sm font-mono">admin / admin123</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-hover)] px-4 py-2.5 text-left">
            <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)] mb-0.5">
              {t("landing.cta_doctor_label")}
            </p>
            <p className="text-sm font-mono">doctor / doctor123</p>
          </div>
        </div>

        <Button asChild size="lg">
          <Link href="/login">
            {t("landing.cta_button")} <ArrowRight size={16} />
          </Link>
        </Button>

        <p className="mt-6 text-xs text-[var(--text-muted)] max-w-md mx-auto">{t("landing.cta_cold_start")}</p>
      </div>
    </section>
  );
}

function Faq() {
  const { t } = useTranslation();
  const items = [
    { q: "landing.faq_q1", a: "landing.faq_a1" },
    { q: "landing.faq_q2", a: "landing.faq_a2" },
    { q: "landing.faq_q3", a: "landing.faq_a3" },
  ];
  return (
    <section className="border-t border-[var(--border)]">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-16 md:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">{t("landing.faq_title")}</h2>
        <div className="space-y-4">
          {items.map(({ q, a }) => (
            <div key={q} className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
              <h3 className="font-semibold text-sm mb-1.5">{t(q)}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{t(a)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Logo />
            <span className="text-sm font-bold">{t("app.name")}</span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">{t("landing.footer_tagline")}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{t("landing.footer_stack")}</p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-2 text-xs text-[var(--text-secondary)]">
          <div className="flex gap-4">
            <a href={BACKEND_REPO} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)]">
              clinic-flow
            </a>
            <a href={FRONTEND_REPO} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)]">
              clinic-flow-web
            </a>
          </div>
          <p className="text-[var(--text-muted)]">
            {t("landing.footer_made_by")} · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-full">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <About />
        <Features />
        <HowItWorks />
        <CtaFinal />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
