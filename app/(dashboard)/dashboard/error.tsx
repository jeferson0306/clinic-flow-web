"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

/**
 * Next.js requires an error boundary to be a Client Component — it renders
 * in place of whichever dashboard route threw, keeping the sidebar/topbar
 * (the parent layout) intact instead of losing navigation entirely, the way
 * an unhandled throw reaching Next's own default error page would.
 */
export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useTranslation();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="p-6 flex flex-col items-center justify-center text-center min-h-[60vh] gap-3">
      <AlertTriangle size={28} className="text-[var(--color-danger)]" />
      <h1 className="text-base font-semibold text-[var(--text-primary)]">{t("common.error_title")}</h1>
      <p className="text-sm text-[var(--text-secondary)] max-w-sm">{error.message || t("common.error_generic")}</p>
      <Button size="sm" onClick={reset}>
        {t("common.try_again")}
      </Button>
    </main>
  );
}
