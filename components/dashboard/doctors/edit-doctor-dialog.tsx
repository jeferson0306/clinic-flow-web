"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { updateDoctor } from "@/app/actions/doctors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useTranslation } from "@/lib/i18n";
import type { Doctor } from "@/lib/types";
import { isValidEmailShape, isValidName, sanitizeName } from "@/lib/validation";

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
      {t("common.save")}
    </Button>
  );
}

export function EditDoctorDialog({ doctor }: { doctor: Doctor }) {
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
          className="inline-flex items-center justify-center h-7 w-7 rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
        >
          <Pencil size={14} />
        </button>
      }
      title={t("doctors.edit")}
    >
      <form
        action={async (formData) => {
          const errors: Record<string, string> = {};
          if (!isValidName(String(formData.get("fullName") ?? ""))) {
            errors.fullName = t("validation.invalid_name");
          }
          if (!isValidEmailShape(String(formData.get("email") ?? ""))) {
            errors.email = t("validation.invalid_email");
          }
          if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
          }
          setFieldErrors({});

          const result = await updateDoctor({ error: null }, formData);
          if (result.error === null) {
            toast.success(t("common.update_success"));
            setOpen(false);
          } else {
            toast.error(errorMessage(t, result.error) ?? t("common.error"));
          }
        }}
        className="flex flex-col gap-3"
      >
        <input type="hidden" name="id" value={doctor.id} />
        <Input
          label={t("doctors.full_name")}
          name="fullName"
          defaultValue={doctor.fullName}
          maxLength={120}
          error={fieldErrors.fullName}
          onChange={(e) => {
            e.target.value = sanitizeName(e.target.value);
          }}
          required
        />
        <Input
          label={t("doctors.email")}
          name="email"
          type="email"
          defaultValue={doctor.email}
          maxLength={254}
          error={fieldErrors.email}
          required
        />
        <Input
          label={t("doctors.specialty")}
          name="specialty"
          defaultValue={doctor.specialty}
          maxLength={120}
          required
        />
        <Input
          label={t("doctors.license_number")}
          name="licenseNumber"
          defaultValue={doctor.licenseNumber}
          maxLength={40}
          required
        />
        <SubmitButton />
      </form>
    </Dialog>
  );
}
