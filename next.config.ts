import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { withSentryConfig } from "@sentry/nextjs/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "origin-when-cross-origin" },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: rootDir,
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

// Source map upload (readable stack traces in Sentry instead of minified
// ones) is deliberately not configured here — that needs SENTRY_AUTH_TOKEN
// plus the org/project slugs, none of which are wired up yet. Runtime error
// capture (the actual point of this phase) works without it; add org,
// project and authToken here later if readable production stack traces
// in Sentry turn out to matter enough to want that extra build step.
export default withSentryConfig(nextConfig, { silent: true });
