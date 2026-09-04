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
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button size="sm">
          <Plus size={14} /> {t("doctors.new")}
        </Button>
      }
      title={t("doctors.new")}
    >
      <form
        action={async (formData) => {
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
        <Input label={t("doctors.full_name")} name="fullName" required />
        <Input label={t("doctors.cpf")} name="cpf" placeholder="000.000.000-00" required />
        <Input label={t("doctors.email")} name="email" type="email" required />
        <Input label={t("doctors.specialty")} name="specialty" required />
        <Input label={t("doctors.license_number")} name="licenseNumber" required />
        <SubmitButton />
      </form>
    </Dialog>
  );
}
