"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createPatient, type FormState } from "@/app/actions/patients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useTranslation } from "@/lib/i18n";

const INITIAL_STATE: FormState = { error: null };

function errorMessage(t: (k: string) => string, error: string | null): string | null {
  if (!error) return null;
  if (error === "missing_fields") return t("common.error");
  if (error === "CONFLICT") return t("patients.duplicate_cpf");
  return t("common.error");
}

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useTranslation();
  return (
    <Button type="submit" loading={pending} className="w-full mt-1">
      {t("common.create")}
    </Button>
  );
}

export function NewPatientDialog() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button size="sm">
          <Plus size={14} /> {t("patients.new")}
        </Button>
      }
      title={t("patients.new")}
    >
      <form
        action={async (formData) => {
          const result = await createPatient(INITIAL_STATE, formData);
          if (result.error === null) {
            toast.success(t("patients.create_success"));
            setOpen(false);
          } else {
            toast.error(errorMessage(t, result.error) ?? t("common.error"));
          }
        }}
        className="flex flex-col gap-3"
      >
        <Input label={t("patients.full_name")} name="fullName" required />
        <Input label={t("patients.cpf")} name="cpf" placeholder="000.000.000-00" required />
        <Input label={t("patients.email")} name="email" type="email" required />
        <Input label={`${t("patients.phone")} (${t("patients.phone_optional")})`} name="phone" />
        <Input
          label={`${t("patients.birth_date")} (${t("patients.birth_date_optional")})`}
          name="birthDate"
          type="date"
        />
        <Input label={t("patients.postcode")} name="postcode" placeholder="00000-000" required />
        <SubmitButton />
      </form>
    </Dialog>
  );
}
