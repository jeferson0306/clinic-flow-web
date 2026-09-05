"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createProcedure } from "@/app/actions/procedures";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useTranslation } from "@/lib/i18n";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useTranslation();
  return (
    <Button type="submit" loading={pending} className="w-full mt-1">
      {t("common.create")}
    </Button>
  );
}

export function NewProcedureDialog() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button size="sm">
          <Plus size={14} /> {t("procedures.new")}
        </Button>
      }
      title={t("procedures.new")}
    >
      <form
        action={async (formData) => {
          const result = await createProcedure({ error: null }, formData);
          if (result.error === null) {
            toast.success(t("procedures.create_success"));
            setOpen(false);
          } else {
            toast.error(t("common.error"));
          }
        }}
        className="flex flex-col gap-3"
      >
        <Input label={t("procedures.name")} name="name" maxLength={120} required />
        <Input
          label={t("procedures.duration")}
          name="durationMinutes"
          type="number"
          min={1}
          max={480}
          required
        />
        <Input
          label={`${t("procedures.price")} (R$)`}
          name="price"
          type="number"
          min={0.01}
          max={100000}
          step="0.01"
          required
        />
        <SubmitButton />
      </form>
    </Dialog>
  );
}
