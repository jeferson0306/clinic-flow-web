import * as Sentry from "@sentry/nextjs";

// Node.js server runtime — Server Components, Server Actions, Route
// Handlers. Loaded via instrumentation.ts's register() when NEXT_RUNTIME is
// "nodejs", never imported directly.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
});
