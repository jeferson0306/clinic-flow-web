"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";

/**
 * Fades + slides in every direct `[data-reveal]` descendant on mount, once,
 * staggered — the dashboard home's entrance. Unlike the landing page's
 * scroll-triggered reveal, this content is already on screen at mount, so
 * it fires immediately rather than waiting on an IntersectionObserver.
 */
export function DashboardReveal({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const targets = Array.from(container.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (targets.length === 0) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(targets, { opacity: 1, y: 0 });
      return;
    }

    const tween = gsap.from(targets, {
      opacity: 0,
      y: 16,
      duration: 0.5,
      ease: "power2.out",
      stagger: 0.07,
    });
    return () => {
      tween.kill();
    };
  }, []);

  return <div ref={containerRef}>{children}</div>;
}
