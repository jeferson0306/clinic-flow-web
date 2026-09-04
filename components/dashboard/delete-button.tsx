"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";

/**
 * Shared by patients/doctors/procedures — each resource's delete Server
 * Action has the same shape (`(id) => Promise<{ error: string | null }>`),
 * so the confirm/loading/toast wiring only needs writing once.
 */
export function DeleteButton({
  id,
  deleteAction,
}: {
  id: string;
  deleteAction: (id: string) => Promise<{ error: string | null }>;
}) {
  const [pending, startTransition] = useTransition();
  const { t } = useTranslation();

  return (
    <button
      type="button"
      title={t("common.delete")}
      disabled={pending}
      className="inline-flex items-center justify-center h-7 w-7 rounded-md text-[var(--text-muted)] hover:bg-[var(--color-danger)]/10 hover:text-[var(--color-danger)] transition-colors disabled:opacity-50"
      onClick={() => {
        if (!window.confirm(t("common.delete_confirm"))) return;
        startTransition(async () => {
          const result = await deleteAction(id);
          if (result.error === null) {
            toast.success(t("common.delete_success"));
          } else if (result.error === "CONFLICT") {
            toast.error(t("common.in_use_error"));
          } else {
            toast.error(t("common.error"));
          }
        });
      }}
    >
      <Trash2 size={14} />
    </button>
  );
}
