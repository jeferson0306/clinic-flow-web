"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createDoctor } from "@/app/actions/doctors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useTranslation } from "@/lib/i18n";
import { isCompleteCpf, isValidEmailShape, isValidName, maskCpf, sanitizeName } from "@/lib/validation";

function errorMessage(t: (k: string) => string, error: string | null): string | null {
  if (!error) return null;
  if (error === "CONFLICT") return t("doctors.duplicate");
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

export function NewDoctorDialog() {
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
        <Button size="sm">
          <Plus size={14} /> {t("doctors.new")}
        </Button>
      }
      title={t("doctors.new")}
    >
      <form
        action={async (formData) => {
          const errors: Record<string, string> = {};
          if (!isValidName(String(formData.get("fullName") ?? ""))) {
            errors.fullName = t("validation.invalid_name");
          }
          if (!isCompleteCpf(String(formData.get("cpf") ?? ""))) {
            errors.cpf = t("validation.invalid_cpf");
          }
          if (!isValidEmailShape(String(formData.get("email") ?? ""))) {
            errors.email = t("validation.invalid_email");
          }
          if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
          }
          setFieldErrors({});

          const result = await createDoctor({ error: null }, formData);
          if (result.error === null) {
            toast.success(t("doctors.create_success"));
            setOpen(false);
          } else {
            toast.error(errorMessage(t, result.error) ?? t("common.error"));
          }
        }}
        className="flex flex-col gap-3"
      >
        <Input
          label={t("doctors.full_name")}
          name="fullName"
          maxLength={120}
          error={fieldErrors.fullName}
          onChange={(e) => {
            e.target.value = sanitizeName(e.target.value);
          }}
          required
        />
        <Input
          label={t("doctors.cpf")}
          name="cpf"
          placeholder="000.000.000-00"
          inputMode="numeric"
          maxLength={14}
          error={fieldErrors.cpf}
          onChange={(e) => {
            e.target.value = maskCpf(e.target.value);
          }}
          required
        />
        <Input
          label={t("doctors.email")}
          name="email"
          type="email"
          maxLength={254}
          error={fieldErrors.email}
          required
        />
        <Input label={t("doctors.specialty")} name="specialty" maxLength={120} required />
        <Input label={t("doctors.license_number")} name="licenseNumber" maxLength={40} required />
        <SubmitButton />
      </form>
    </Dialog>
  );
}
