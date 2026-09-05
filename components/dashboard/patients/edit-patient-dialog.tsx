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
import {
  earliestBirthDateIso,
  isCompletePostcode,
  isValidEmailShape,
  isValidName,
  isValidOptionalBirthDate,
  isValidOptionalPhone,
  maskPhone,
  maskPostcode,
  sanitizeName,
  todayIsoDate,
} from "@/lib/validation";

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

function formFromPatient(patient: Patient) {
  return {
    fullName: patient.fullName,
    email: patient.email,
    phone: patient.phone ?? "",
    birthDate: patient.birthDate ?? "",
    postcode: patient.address.postcode,
  };
}

export function EditPatientDialog({ patient }: { patient: Patient }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => formFromPatient(patient));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { t } = useTranslation();

  function set<K extends keyof ReturnType<typeof formFromPatient>>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setForm(formFromPatient(patient));
          setFieldErrors({});
        }
      }}
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
          const errors: Record<string, string> = {};
          if (!isValidName(form.fullName)) errors.fullName = t("validation.invalid_name");
          if (!isValidEmailShape(form.email)) errors.email = t("validation.invalid_email");
          if (!isValidOptionalPhone(form.phone)) errors.phone = t("validation.invalid_phone");
          if (!isValidOptionalBirthDate(form.birthDate)) errors.birthDate = t("validation.invalid_birth_date");
          if (!isCompletePostcode(form.postcode)) errors.postcode = t("validation.invalid_postcode");
          if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
          }
          setFieldErrors({});

          const result = await updatePatient({ error: null }, formData);
          if (result.error === null) {
            toast.success(t("common.update_success"));
            setOpen(false);
          } else {
            setFieldErrors(result.fieldErrors ?? {});
            toast.error(errorMessage(t, result.error) ?? t("common.error"));
          }
        }}
        className="flex flex-col gap-3"
      >
        <input type="hidden" name="id" value={patient.id} />
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
