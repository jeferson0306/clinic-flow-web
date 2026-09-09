"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animate } from "animejs";
import {
  Activity,
  ArrowRight,
  CalendarClock,
  ClipboardList,
  FlaskConical,
  Github,
  HeartPulse,
  Moon,
  Pill,
  Plus,
  Stethoscope,
  Sun,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";
import { LOCALE_LABELS, useTranslation, type Locale } from "@/lib/i18n";
import { RequestDemoDialog } from "@/components/marketing/request-demo-dialog";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const FRONTEND_REPO = "https://github.com/jeferson0306/clinic-flow-web";
const BACKEND_REPO = "https://github.com/jeferson0306/clinic-flow";
const REQUEST_HASH = "#request-demo";

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

/** A cardiac-monitor-style trace, quietly sweeping — the one health motif that earns its place without shouting for attention. */
function HeartbeatLine({ className }: { className?: string }) {
  const trackRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !trackRef.current) return;
    const tween = gsap.to(trackRef.current, { xPercent: -50, duration: 9, ease: "none", repeat: -1 });
    return () => {
      tween.kill();
    };
  }, []);

  const wave = "M0,20 L60,20 L72,20 L80,4 L90,36 L98,20 L400,20";
  return (
    <svg viewBox="0 0 400 40" preserveAspectRatio="none" className={className} aria-hidden="true">
      <g ref={trackRef}>
        <path d={wave} fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d={wave} fill="none" stroke="currentColor" strokeWidth="1.5" transform="translate(400,0)" />
      </g>
    </svg>
  );
}

function FloatingHealthIcons() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !containerRef.current) return;
    const icons = containerRef.current.querySelectorAll<HTMLElement>("[data-float-icon]");
    icons.forEach((el, i) => {
      animate(el, {
        translateY: [0, i % 2 === 0 ? -14 : -9, 0],
        rotate: [0, i % 2 === 0 ? 6 : -6, 0],
        duration: 4200 + i * 500,
        delay: i * 280,
        loop: true,
        ease: "inOutSine",
      });
    });
  }, []);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <Stethoscope
        data-float-icon
        size={64}
        className="absolute -top-4 -left-6 text-[var(--accent)] opacity-[0.08] rotate-[-12deg]"
      />
      <HeartPulse
        data-float-icon
        size={48}
        className="absolute top-1/3 -right-3 text-[var(--color-danger)] opacity-[0.09]"
      />
      <Pill
        data-float-icon
        size={40}
        className="absolute bottom-6 left-1/4 text-[var(--color-success)] opacity-[0.08] rotate-[20deg]"
      />
    </div>
  );
}

/**
 * A native `<a href="#id">` jump was the one thing that reliably broke the
 * sticky header on "Como funciona" (reported live, twice) — CSS hardening
 * (translateZ, scroll-mt) alone never fixed it, which points at the jump
 * itself, not the header's own styling: a native anchor jump moves the
 * viewport in a single frame with no intermediate scroll events, and this
 * page's several GSAP ScrollTrigger instances (the reveal animations, the
 * heartbeat line) never get a chance to recompute against the new
 * position — one of them ends up pinned at a stale offset that can overlap
 * the header. `scrollIntoView({ behavior: "smooth" })` produces real
 * intermediate scroll events the whole way, and `ScrollTrigger.refresh()`
 * after it settles forces every instance to recompute regardless.
 */
function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => ScrollTrigger.refresh(), 600);
}

function Navbar({ onRequestDemo }: { onRequestDemo: () => void }) {
  const { t, locale, setLocale } = useTranslation();
  const { theme, toggle } = useTheme();

  return (
    <header
      id="main-nav"
      // [transform:translateZ(0)] forces this onto its own compositor layer —
      // a sticky element combined with backdrop-blur and scroll-triggered
      // animations elsewhere on the page is a known cross-browser combo for
      // the sticky element intermittently losing its pinned position on an
      // anchor jump. This is the standard, harmless hardening for it.
      className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg-body)]/80 backdrop-blur-md [transform:translateZ(0)] will-change-transform"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-sm font-bold">{t("app.name")}</span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--text-secondary)]">
          <a
            href="#features"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("features");
            }}
            className="hover:text-[var(--text-primary)] transition-colors"
          >
            {t("landing.nav_features")}
          </a>
          <a
            href="#how"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("how");
            }}
            className="hover:text-[var(--text-primary)] transition-colors"
          >
            {t("landing.nav_how")}
          </a>
          <a
            href="#stack"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("stack");
            }}
            className="hover:text-[var(--text-primary)] transition-colors"
          >
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
          <Button asChild size="sm" variant="ghost">
            <Link href="/login">{t("landing.nav_login")}</Link>
          </Button>
          <Button size="sm" onClick={onRequestDemo}>
            {t("landing.nav_demo")}
          </Button>
        </div>
      </div>
    </header>
  );
}

function HeroMock() {
  const { t } = useTranslation();
  return (
    <div
      data-hero-mock
      className="relative rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow)] p-4 sm:p-5"
    >
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
      <div className="mt-4 pt-3 border-t border-[var(--border)]">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          {t("landing.mock_appointments")}
        </span>
        <div className="mt-2 flex items-end gap-1 h-10">
          {[40, 65, 30, 90, 55, 75, 45].map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-[var(--accent)]" style={{ height: `${h}%`, opacity: 0.5 + h / 200 }} />
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-[var(--color-success)]/10 px-3 py-2">
        <CalendarClock size={14} className="text-[var(--color-success)] shrink-0" />
        <span className="text-[11px] text-[var(--color-success)]">{t("landing.mock_no_conflict")}</span>
      </div>
    </div>
  );
}

function Hero({ onRequestDemo }: { onRequestDemo: () => void }) {
  const { t } = useTranslation();
  return (
    <section className="relative overflow-hidden max-w-6xl mx-auto px-4 md:px-6 pt-16 pb-20 md:pt-24 md:pb-28 grid md:grid-cols-2 gap-10 md:gap-8 items-center">
      <FloatingHealthIcons />
      <div className="relative">
        <span
          data-hero-badge
          className="inline-block text-xs font-medium text-[var(--accent)] bg-[var(--accent-dim)] rounded-full px-3 py-1 mb-5"
        >
          {t("landing.hero_badge")}
        </span>
        <h1 data-hero-headline className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-5">
          {t("landing.hero_headline")}
        </h1>
        <p data-hero-sub className="text-base sm:text-lg text-[var(--text-secondary)] mb-8 max-w-md">
          {t("landing.hero_subhead")}
        </p>
        <div data-hero-cta className="flex flex-wrap items-center gap-3">
          <Button size="lg" onClick={onRequestDemo}>
            {t("landing.hero_cta_primary")} <ArrowRight size={16} />
          </Button>
          <Button asChild size="lg" variant="secondary">
            <a href={FRONTEND_REPO} target="_blank" rel="noopener noreferrer">
              <Github size={16} /> {t("landing.hero_cta_secondary")}
            </a>
          </Button>
        </div>
        <p data-hero-note className="mt-4 text-xs text-[var(--text-muted)]">
          {t("landing.hero_note")}
        </p>
      </div>
      <HeroMock />
    </section>
  );
}

function HeartbeatDivider() {
  return (
    <div className="relative h-8 overflow-hidden text-[var(--accent)]/30">
      <HeartbeatLine className="absolute inset-0 w-[200%] h-full" />
    </div>
  );
}

function About() {
  const { t } = useTranslation();
  return (
    <section id="stack" className="scroll-mt-16 border-y border-[var(--border)] bg-[var(--bg-surface)]">
      <div data-reveal className="max-w-6xl mx-auto px-4 md:px-6 py-14 md:py-20">
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
    <section id="features" className="scroll-mt-16 max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
      <div data-reveal className="max-w-xl mb-10 md:mb-14">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">{t("landing.features_title")}</h2>
        <p className="text-[var(--text-secondary)]">{t("landing.features_subtitle")}</p>
      </div>
      <div data-reveal-group className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map(({ icon: Icon, titleKey, bodyKey }) => (
          <div
            key={titleKey}
            data-reveal-item
            className="feature-card rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5"
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
    <section id="how" className="scroll-mt-16 border-y border-[var(--border)] bg-[var(--bg-surface)]">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <h2 data-reveal className="text-2xl sm:text-3xl font-bold mb-10 md:mb-14 max-w-xl">
          {t("landing.how_title")}
        </h2>
        <div data-reveal-group className="grid sm:grid-cols-3 gap-8">
          {steps.map(({ titleKey, bodyKey }, i) => (
            <div key={titleKey} data-reveal-item>
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

function CtaFinal({ onRequestDemo }: { onRequestDemo: () => void }) {
  const { t } = useTranslation();
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
      <div data-reveal className="rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] p-8 md:p-12 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">{t("landing.cta_title")}</h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">{t("landing.cta_body")}</p>

        <Button size="lg" onClick={onRequestDemo}>
          {t("landing.cta_button")} <ArrowRight size={16} />
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
        <h2 data-reveal className="text-2xl sm:text-3xl font-bold mb-8 text-center">
          {t("landing.faq_title")}
        </h2>
        <div data-reveal-group className="space-y-4">
          {items.map(({ q, a }) => (
            <div key={q} data-reveal-item className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
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
  const [requestOpen, setRequestOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Same as LocaleProvider's mount effect: window.location has no SSR-time
    // value to derive from, so this can only run after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (window.location.hash === REQUEST_HASH) setRequestOpen(true);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !root) return;

    const animated: Element[] = [];
    const track = <T extends Element>(el: T | null) => {
      if (el) animated.push(el);
      return el;
    };

    const heroTl = gsap.timeline({ defaults: { ease: "power2.out", duration: 0.5 } });
    const badge = track(root.querySelector("[data-hero-badge]"));
    const headline = track(root.querySelector("[data-hero-headline]"));
    const sub = track(root.querySelector("[data-hero-sub]"));
    const cta = track(root.querySelector("[data-hero-cta]"));
    const note = track(root.querySelector("[data-hero-note]"));
    const mock = track(root.querySelector("[data-hero-mock]"));
    if (badge) heroTl.from(badge, { opacity: 0, y: 16 });
    if (headline) heroTl.from(headline, { opacity: 0, y: 16 }, "-=0.35");
    if (sub) heroTl.from(sub, { opacity: 0, y: 16 }, "-=0.35");
    if (cta) heroTl.from(cta, { opacity: 0, y: 16 }, "-=0.35");
    if (note) heroTl.from(note, { opacity: 0 }, "-=0.3");
    if (mock) heroTl.from(mock, { opacity: 0, x: 24 }, "-=0.6");

    const revealTweens = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]")).map((el) => {
      track(el);
      return gsap.from(el, {
        opacity: 0,
        y: 24,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%" },
      });
    });

    const groupTweens = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal-group]")).map((group) => {
      const items = Array.from(group.querySelectorAll<HTMLElement>("[data-reveal-item]"));
      items.forEach((item) => track(item));
      return gsap.from(items, {
        opacity: 0,
        y: 20,
        duration: 0.45,
        ease: "power2.out",
        stagger: 0.08,
        scrollTrigger: { trigger: group, start: "top 85%" },
      });
    });

    return () => {
      heroTl.kill();
      [...revealTweens, ...groupTweens].forEach((tw) => {
        tw.scrollTrigger?.kill();
        tw.kill();
      });
      // Strict Mode double-invokes effects in dev — without this, the first
      // run's cleanup can leave elements stuck at the tween's "from" opacity
      // (0) if it fires between the from-state being applied and the second
      // mount's timeline restarting it.
      gsap.set(animated, { clearProps: "all" });
    };
  }, []);

  return (
    <div ref={rootRef} className="flex flex-col min-h-full">
      <Navbar onRequestDemo={() => setRequestOpen(true)} />
      <main className="flex-1">
        <Hero onRequestDemo={() => setRequestOpen(true)} />
        <HeartbeatDivider />
        <About />
        <Features />
        <HowItWorks />
        <CtaFinal onRequestDemo={() => setRequestOpen(true)} />
        <Faq />
      </main>
      <Footer />
      <RequestDemoDialog open={requestOpen} onOpenChange={setRequestOpen} />
    </div>
  );
}
