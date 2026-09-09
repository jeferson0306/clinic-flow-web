import * as Sentry from "@sentry/nextjs";

// Browser runtime — errors and traces from the client. The DSN is a
// NEXT_PUBLIC_ var deliberately: it ends up in the client bundle either way
// (this file runs in the browser), and a Sentry DSN is designed to be
// public — it can only submit events, not read or manage the project.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  // Session replay is a separate, heavier signal (adds a recording library
  // to every page load) — not wired up here on purpose, this is the
  // "first error" baseline the rest of this app's phases have followed:
  // ship the smallest thing that actually works, add more when it's asked for.
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
