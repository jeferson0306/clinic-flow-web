"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { requestExam } from "@/app/actions/exams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { useTranslation } from "@/lib/i18n";
import type { Doctor, Patient } from "@/lib/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useTranslation();
  return (
    <Button type="submit" loading={pending} className="w-full mt-1">
      {t("common.create")}
    </Button>
  );
}

export function NewExamDialog({ patients, doctors }: { patients: Patient[]; doctors: Doctor[] }) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button size="sm">
          <Plus size={14} /> {t("exams.new")}
        </Button>
      }
      title={t("exams.new")}
    >
      <form
        action={async (formData) => {
          const result = await requestExam({ error: null }, formData);
          if (result.error === null) {
            toast.success(t("exams.create_success"));
            setOpen(false);
          } else {
            toast.error(t("common.error"));
          }
        }}
        className="flex flex-col gap-3"
      >
        <Select label={t("exams.patient")} name="patientId" required defaultValue="">
          <option value="" disabled>
            {t("common.search")}...
          </option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.fullName}
            </option>
          ))}
        </Select>
        <Select label={t("exams.requested_by")} name="requestedByDoctorId" required defaultValue="">
          <option value="" disabled>
            {t("common.search")}...
          </option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.fullName}
            </option>
          ))}
        </Select>
        <Input label={t("exams.type")} name="type" placeholder="Complete blood count" required />
        <SubmitButton />
      </form>
    </Dialog>
  );
}
