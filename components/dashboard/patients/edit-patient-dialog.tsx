"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { updatePatient } from "@/app/actions/patients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useTranslation } from "@/lib/i18n";
import type { Patient } from "@/lib/types";

function errorMessage(t: (k: string) => string, error: string | null): string | null {
  if (!error) return null;
  if (error === "missing_fields") return t("common.error");
  return t("common.error");
}

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useTranslation();
  return (
    <Button type="submit" loading={pending} className="w-full mt-1">
      {t("common.save")}
    </Button>
  );
}

export function EditPatientDialog({ patient }: { patient: Patient }) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <button
          type="button"
          title={t("common.edit")}
          className="inline-flex items-center justify-center h-7 w-7 rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
        >
          <Pencil size={14} />
        </button>
      }
      title={t("patients.edit")}
    >
      <form
        action={async (formData) => {
          const result = await updatePatient({ error: null }, formData);
          if (result.error === null) {
            toast.success(t("common.update_success"));
            setOpen(false);
          } else {
            toast.error(errorMessage(t, result.error) ?? t("common.error"));
          }
        }}
        className="flex flex-col gap-3"
      >
        <input type="hidden" name="id" value={patient.id} />
        <Input label={t("patients.full_name")} name="fullName" defaultValue={patient.fullName} required />
        <Input label={t("patients.email")} name="email" type="email" defaultValue={patient.email} required />
        <Input
          label={`${t("patients.phone")} (${t("patients.phone_optional")})`}
          name="phone"
          defaultValue={patient.phone ?? ""}
        />
        <Input
          label={`${t("patients.birth_date")} (${t("patients.birth_date_optional")})`}
          name="birthDate"
          type="date"
          defaultValue={patient.birthDate ?? ""}
        />
        <Input
          label={t("patients.postcode")}
          name="postcode"
          placeholder="00000-000"
          defaultValue={patient.address.postcode}
          required
        />
        <SubmitButton />
      </form>
    </Dialog>
  );
}
