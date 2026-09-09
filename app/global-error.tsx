"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/**
 * The App Router's own catch-all for an error that escapes every other
 * error boundary — reporting it here is the only way Sentry ever sees one
 * of these, since it replaces the root layout entirely rather than
 * rendering inside it.
 */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div style={{ display: "flex", minHeight: "100dvh", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "1rem", fontWeight: 600 }}>Something went wrong</h1>
            <p style={{ fontSize: "0.875rem", color: "#888", marginTop: "0.25rem" }}>
              The error has been reported. Please try again.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
