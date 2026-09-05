"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

export function RefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { t } = useTranslation();

  return (
    <Button
      size="sm"
      variant="secondary"
      loading={pending}
      onClick={() => startTransition(() => router.refresh())}
    >
      <RefreshCw size={14} /> {t("system_health.refresh")}
    </Button>
  );
}
