"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useTranslation } from "@/lib/i18n";

/**
 * Shared by patients/doctors/procedures — each resource's delete Server
 * Action has the same shape (`(id) => Promise<{ error: string | null }>`),
 * so the confirm/loading/toast wiring only needs writing once.
 *
 * A design-system dialog, not `window.confirm` — the native browser prompt
 * looks and behaves nothing like the rest of the app (no dark mode, no
 * focus styling, blocks the whole tab) and is the one confirmation in the
 * product that didn't match everything else.
 */
export function DeleteButton({
  id,
  deleteAction,
}: {
  id: string;
  deleteAction: (id: string) => Promise<{ error: string | null }>;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <button
          type="button"
          title={t("common.delete")}
          aria-label={t("common.delete")}
          className="inline-flex items-center justify-center h-7 w-7 rounded-md text-[var(--text-muted)] hover:bg-[var(--color-danger)]/10 hover:text-[var(--color-danger)] transition-colors"
        >
          <Trash2 size={14} />
        </button>
      }
      title={t("common.delete_confirm")}
    >
      <div className="flex justify-end gap-2 mt-2">
        <Button variant="secondary" size="sm" onClick={() => setOpen(false)} disabled={pending}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="danger"
          size="sm"
          loading={pending}
          onClick={() => {
            startTransition(async () => {
              const result = await deleteAction(id);
              if (result.error === null) {
                toast.success(t("common.delete_success"));
                setOpen(false);
              } else if (result.error === "CONFLICT") {
                toast.error(t("common.in_use_error"));
              } else {
                toast.error(t("common.error"));
              }
            });
          }}
        >
          {t("common.delete")}
        </Button>
      </div>
    </Dialog>
  );
}
