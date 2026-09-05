"use client";

import Link from "next/link";
import { Compass } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-3 text-center px-4 bg-[var(--bg-body)]">
      <Compass size={28} className="text-[var(--text-muted)]" />
      <h1 className="text-base font-semibold text-[var(--text-primary)]">{t("common.not_found_title")}</h1>
      <p className="text-sm text-[var(--text-secondary)] max-w-sm">{t("common.not_found_body")}</p>
      <Link href="/dashboard" className="text-sm text-[var(--accent)] hover:underline font-medium">
        {t("common.back_to_dashboard")}
      </Link>
    </div>
  );
}
