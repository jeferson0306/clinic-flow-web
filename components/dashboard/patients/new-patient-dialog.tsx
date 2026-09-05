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
  earliestBirthDateIso,
  isCompleteCpf,
  isCompletePostcode,
  isValidEmailShape,
  isValidName,
  isValidOptionalBirthDate,
  isValidOptionalPhone,
  maskCpf,
  maskPhone,
  maskPostcode,
  sanitizeName,
  todayIsoDate,
} from "@/lib/validation";

const INITIAL_STATE: FormState = { error: null };

const EMPTY_FORM = { fullName: "", cpf: "", email: "", phone: "", birthDate: "", postcode: "" };

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
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { t } = useTranslation();

  function set<K extends keyof typeof EMPTY_FORM>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setForm(EMPTY_FORM);
          setFieldErrors({});
        }
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
          if (!isValidName(form.fullName)) errors.fullName = t("validation.invalid_name");
          if (!isCompleteCpf(form.cpf)) errors.cpf = t("validation.invalid_cpf");
          if (!isValidEmailShape(form.email)) errors.email = t("validation.invalid_email");
          if (!isValidOptionalPhone(form.phone)) errors.phone = t("validation.invalid_phone");
          if (!isValidOptionalBirthDate(form.birthDate)) errors.birthDate = t("validation.invalid_birth_date");
          if (!isCompletePostcode(form.postcode)) errors.postcode = t("validation.invalid_postcode");
          if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
          }
          setFieldErrors({});

          const result = await createPatient(INITIAL_STATE, formData);
          if (result.error === null) {
            toast.success(t("patients.create_success"));
            setForm(EMPTY_FORM);
            setOpen(false);
          } else {
            setFieldErrors(result.fieldErrors ?? {});
            toast.error(errorMessage(t, result.error) ?? t("common.error"));
          }
        }}
        className="flex flex-col gap-3"
      >
        <Input
          label={t("patients.full_name")}
          name="fullName"
          value={form.fullName}
          maxLength={120}
          error={fieldErrors.fullName}
          onChange={(e) => set("fullName", sanitizeName(e.target.value))}
          required
        />
        <Input
          label={t("patients.cpf")}
          name="cpf"
          placeholder="000.000.000-00"
          inputMode="numeric"
          value={form.cpf}
          maxLength={14}
          error={fieldErrors.cpf}
          onChange={(e) => set("cpf", maskCpf(e.target.value))}
          required
        />
        <Input
          label={t("patients.email")}
          name="email"
          type="email"
          value={form.email}
          maxLength={254}
          error={fieldErrors.email}
          onChange={(e) => set("email", e.target.value)}
          required
        />
        <Input
          label={`${t("patients.phone")} (${t("patients.phone_optional")})`}
          name="phone"
          inputMode="numeric"
          value={form.phone}
          maxLength={15}
          error={fieldErrors.phone}
          onChange={(e) => set("phone", maskPhone(e.target.value))}
        />
        <Input
          label={`${t("patients.birth_date")} (${t("patients.birth_date_optional")})`}
          name="birthDate"
          type="date"
          value={form.birthDate}
          min={earliestBirthDateIso()}
          max={todayIsoDate()}
          error={fieldErrors.birthDate}
          onChange={(e) => set("birthDate", e.target.value)}
        />
        <Input
          label={t("patients.postcode")}
          name="postcode"
          placeholder="00000-000"
          inputMode="numeric"
          value={form.postcode}
          maxLength={9}
          error={fieldErrors.postcode}
          onChange={(e) => set("postcode", maskPostcode(e.target.value))}
          required
        />
        <SubmitButton />
      </form>
    </Dialog>
  );
}
