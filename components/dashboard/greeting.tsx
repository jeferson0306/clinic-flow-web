"use client";

import { useEffect, useState } from "react";

/**
 * Time-of-day greeting computed from the *viewer's* local clock, not the
 * server's — a server component has no reliable notion of the visitor's
 * timezone. Renders the same neutral text SSR produces on first paint (no
 * hydration mismatch), then swaps to "Bom dia/Boa tarde/Boa noite" once
 * mounted, with a short fade so the swap doesn't feel like a layout jump.
 */
export function Greeting({
  email,
  fallback,
  morning,
  afternoon,
  evening,
}: {
  email: string;
  fallback: string;
  morning: string;
  afternoon: string;
  evening: string;
}) {
  const [text, setText] = useState(fallback);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    // Only the client knows its own local hour — this can't be derived from
    // props during render, so setting it here (once, on mount) is correct.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setText(hour < 12 ? morning : hour < 18 ? afternoon : evening);
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, [morning, afternoon, evening]);

  return (
    <p
      className="text-sm text-[var(--text-secondary)] transition-opacity duration-300"
      style={{ opacity: ready ? 1 : 0.7 }}
    >
      {text}, <span className="text-[var(--text-primary)] font-medium">{email}</span>
    </p>
  );
}
