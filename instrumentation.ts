import * as Sentry from "@sentry/nextjs";

// Next's own server-side registration hook — runs once per runtime at
// startup, before anything else in that runtime. This is what loads the
// right Sentry config for the runtime actually running: sentry.server.config
// in the Node.js server, sentry.edge.config in the Edge runtime (proxy.ts).
// The browser runtime never reaches this file — instrumentation-client.ts
// covers that one, and Next loads it directly.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
