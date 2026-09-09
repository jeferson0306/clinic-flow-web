import * as Sentry from "@sentry/nextjs";

// Edge runtime — proxy.ts (Next's middleware) runs here, not in Node.js.
// Loaded via instrumentation.ts's register() when NEXT_RUNTIME is "edge".
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
});
