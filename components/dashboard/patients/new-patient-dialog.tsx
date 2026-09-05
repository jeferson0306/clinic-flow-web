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
import {
  isCompleteCpf,
  isCompletePostcode,
  isValidEmailShape,
  isValidName,
  isValidOptionalPhone,
  maskCpf,
  maskPhone,
  maskPostcode,
  sanitizeName,
  todayIsoDate,
} from "@/lib/validation";

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
          <Plus size={14} /> {t("patients.new")}
        </Button>
      }
      title={t("patients.new")}
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
          if (!isValidOptionalPhone(String(formData.get("phone") ?? ""))) {
            errors.phone = t("validation.invalid_phone");
          }
          if (!isCompletePostcode(String(formData.get("postcode") ?? ""))) {
            errors.postcode = t("validation.invalid_postcode");
          }
          if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
          }
          setFieldErrors({});

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
        <Input
          label={t("patients.full_name")}
          name="fullName"
          maxLength={120}
          error={fieldErrors.fullName}
          onChange={(e) => {
            e.target.value = sanitizeName(e.target.value);
          }}
          required
        />
        <Input
          label={t("patients.cpf")}
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
          label={t("patients.email")}
          name="email"
          type="email"
          maxLength={254}
          error={fieldErrors.email}
          required
        />
        <Input
          label={`${t("patients.phone")} (${t("patients.phone_optional")})`}
          name="phone"
          inputMode="numeric"
          maxLength={15}
          error={fieldErrors.phone}
          onChange={(e) => {
            e.target.value = maskPhone(e.target.value);
          }}
        />
        <Input
          label={`${t("patients.birth_date")} (${t("patients.birth_date_optional")})`}
          name="birthDate"
          type="date"
          max={todayIsoDate()}
        />
        <Input
          label={t("patients.postcode")}
          name="postcode"
          placeholder="00000-000"
          inputMode="numeric"
          maxLength={9}
          error={fieldErrors.postcode}
          onChange={(e) => {
            e.target.value = maskPostcode(e.target.value);
          }}
          required
        />
        <SubmitButton />
      </form>
    </Dialog>
  );
}
