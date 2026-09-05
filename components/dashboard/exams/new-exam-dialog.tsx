"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { requestExam } from "@/app/actions/exams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
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
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setPatientId("");
          setDoctorId("");
        }
      }}
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
        className="flex flex-col gap-3" noValidate
      >
        <Combobox
          label={t("exams.patient")}
          name="patientId"
          required
          value={patientId}
          onChange={setPatientId}
          placeholder={`${t("common.search")}...`}
          emptyLabel={t("common.empty")}
          options={patients.map((p) => ({ value: p.id, label: p.fullName, hint: p.email }))}
        />
        <Combobox
          label={t("exams.requested_by")}
          name="requestedByDoctorId"
          required
          value={doctorId}
          onChange={setDoctorId}
          placeholder={`${t("common.search")}...`}
          emptyLabel={t("common.empty")}
          options={doctors.map((d) => ({ value: d.id, label: d.fullName, hint: d.specialty }))}
        />
        <Input label={t("exams.type")} name="type" placeholder="Complete blood count" required />
        <SubmitButton />
      </form>
    </Dialog>
  );
}
