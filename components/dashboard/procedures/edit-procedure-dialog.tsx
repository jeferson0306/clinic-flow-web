"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { updateProcedure } from "@/app/actions/procedures";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useTranslation } from "@/lib/i18n";
import { firstFieldErrorMessage } from "@/lib/validation";
import type { Procedure } from "@/lib/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useTranslation();
  return (
    <Button type="submit" loading={pending} className="w-full mt-1">
      {t("common.save")}
    </Button>
  );
}

export function EditProcedureDialog({ procedure }: { procedure: Procedure }) {
  const [open, setOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setFieldErrors({});
      }}
      trigger={
        <button
          type="button"
          title={t("common.edit")}
          aria-label={t("common.edit")}
          className="inline-flex items-center justify-center h-7 w-7 rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
        >
          <Pencil size={14} />
        </button>
      }
      title={t("procedures.edit")}
    >
      <form
        action={async (formData) => {
          const result = await updateProcedure({ error: null }, formData);
          if (result.error === null) {
            toast.success(t("common.update_success"));
            setFieldErrors({});
            setOpen(false);
          } else {
            setFieldErrors(result.fieldErrors ?? {});
            toast.error(firstFieldErrorMessage(result.fieldErrors) ?? t("common.error"));
          }
        }}
        className="flex flex-col gap-3" noValidate
      >
        <input type="hidden" name="id" value={procedure.id} />
        <Input
          label={t("procedures.name")}
          name="name"
          defaultValue={procedure.name}
          maxLength={120}
          error={fieldErrors.name}
          required
        />
        <Input
          label={t("procedures.duration")}
          name="durationMinutes"
          type="number"
          min={1}
          max={480}
          defaultValue={procedure.durationMinutes}
          error={fieldErrors.durationMinutes}
          required
        />
        <Input
          label={`${t("procedures.price")} (R$)`}
          name="price"
          type="number"
          min={0.01}
          max={100000}
          step="0.01"
          defaultValue={(procedure.priceCents / 100).toFixed(2)}
          error={fieldErrors.priceCents}
          required
        />
        <SubmitButton />
      </form>
    </Dialog>
  );
}
