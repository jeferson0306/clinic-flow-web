"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { updatePatient } from "@/app/actions/patients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { TextAreaField } from "@/components/ui/textarea-field";
import { Dialog } from "@/components/ui/dialog";
import { CepPreview } from "@/components/dashboard/patients/cep-preview";
import { useTranslation } from "@/lib/i18n";
import type { Patient } from "@/lib/types";
import {
  earliestBirthDateIso,
  firstFieldErrorMessage,
  isCompletePostcode,
  isValidEmailShape,
  isValidName,
  isValidOptionalBirthDate,
  isValidOptionalPhone,
  isMinor,
  maskCpf,
  maskPhone,
  maskPostcode,
  sanitizeName,
  todayIsoDate,
} from "@/lib/validation";

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
    houseNumber: patient.address.houseNumber,
    complement: patient.address.complement ?? "",
    socialName: patient.socialName ?? "",
    motherName: patient.motherName ?? "",
    sex: patient.sex ?? "",
    bloodType: patient.bloodType ?? "",
    allergies: patient.allergies ?? "",
    continuousMedications: patient.continuousMedications ?? "",
    preExistingConditions: patient.preExistingConditions ?? "",
    clinicalAlert: patient.clinicalAlert ?? "",
    guardianName: patient.guardianName ?? "",
    // Never prefilled — the backend only ever returns it masked, so there is
    // no valid CPF value to round-trip here. Left blank means "keep the one
    // on file" (see PatientService.update).
    guardianCpf: "",
    guardianRelationship: patient.guardianRelationship ?? "",
    guardianPhone: patient.guardianPhone ?? "",
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
          aria-label={t("common.edit")}
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
          if (!form.houseNumber.trim()) errors.houseNumber = t("validation.invalid_house_number");
          // guardianCpf is exempt when a masked one is already on file — an
          // untouched (blank) field there means "keep it," not "missing."
          if (
            isMinor(form.birthDate) &&
            (!form.guardianName.trim() ||
              !form.guardianRelationship ||
              (!form.guardianCpf.trim() && !patient.maskedGuardianCpf))
          ) {
            errors.guardianName = t("patients.guardian_section_hint");
          }
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
            toast.error(firstFieldErrorMessage(result.fieldErrors) ?? t("common.error"));
          }
        }}
        className="flex flex-col gap-3" noValidate
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
        <CepPreview postcode={form.postcode} />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t("patients.house_number")}
            name="houseNumber"
            value={form.houseNumber}
            maxLength={20}
            error={fieldErrors.houseNumber}
            onChange={(e) => set("houseNumber", e.target.value)}
            required
          />
          <Input
            label={`${t("patients.complement")} (${t("common.optional")})`}
            name="complement"
            value={form.complement}
            maxLength={60}
            onChange={(e) => set("complement", e.target.value)}
          />
        </div>

        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mt-1">
          {t("patients.clinical_section_title")}
        </p>
        <Input
          label={`${t("patients.social_name")} (${t("common.optional")})`}
          name="socialName"
          value={form.socialName}
          maxLength={120}
          onChange={(e) => set("socialName", e.target.value)}
        />
        <Input
          label={`${t("patients.mother_name")} (${t("common.optional")})`}
          name="motherName"
          value={form.motherName}
          maxLength={120}
          onChange={(e) => set("motherName", e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label={t("patients.sex")}
            name="sex"
            value={form.sex}
            onChange={(v) => set("sex", v)}
            options={[
              { value: "MASCULINO", label: t("patients.sex_masculino") },
              { value: "FEMININO", label: t("patients.sex_feminino") },
              { value: "OUTRO", label: t("patients.sex_outro") },
              { value: "NAO_INFORMADO", label: t("patients.sex_nao_informado") },
            ]}
          />
          <SelectField
            label={t("patients.blood_type")}
            name="bloodType"
            value={form.bloodType}
            onChange={(v) => set("bloodType", v)}
            options={["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"].map((v) => ({
              value: v,
              label: v.replace("_POS", "+").replace("_NEG", "-"),
            }))}
          />
        </div>
        <TextAreaField
          label={t("patients.allergies")}
          name="allergies"
          value={form.allergies}
          onChange={(v) => set("allergies", v)}
        />
        <TextAreaField
          label={t("patients.continuous_medications")}
          name="continuousMedications"
          value={form.continuousMedications}
          onChange={(v) => set("continuousMedications", v)}
        />
        <TextAreaField
          label={t("patients.pre_existing_conditions")}
          name="preExistingConditions"
          value={form.preExistingConditions}
          onChange={(v) => set("preExistingConditions", v)}
        />
        <Input
          label={`${t("patients.clinical_alert")} (${t("common.optional")})`}
          name="clinicalAlert"
          placeholder={t("patients.clinical_alert_hint")}
          value={form.clinicalAlert}
          maxLength={200}
          onChange={(e) => set("clinicalAlert", e.target.value)}
        />

        {isMinor(form.birthDate) && (
          <>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mt-1">
              {t("patients.guardian_section_title")}
            </p>
            <p className="text-xs text-[var(--text-muted)] -mt-2">{t("patients.guardian_section_hint")}</p>
            <Input
              label={t("patients.guardian_name")}
              name="guardianName"
              value={form.guardianName}
              maxLength={120}
              error={fieldErrors.guardianName}
              onChange={(e) => set("guardianName", sanitizeName(e.target.value))}
              required
            />
            <Input
              label={
                patient.maskedGuardianCpf
                  ? `${t("patients.guardian_cpf")} (${patient.maskedGuardianCpf})`
                  : t("patients.guardian_cpf")
              }
              name="guardianCpf"
              placeholder="000.000.000-00"
              inputMode="numeric"
              value={form.guardianCpf}
              maxLength={14}
              onChange={(e) => set("guardianCpf", maskCpf(e.target.value))}
              required={!patient.maskedGuardianCpf}
            />
            <SelectField
              label={t("patients.guardian_relationship")}
              name="guardianRelationship"
              value={form.guardianRelationship}
              onChange={(v) => set("guardianRelationship", v)}
              options={[
                { value: "MAE", label: t("patients.guardian_relationship_mae") },
                { value: "PAI", label: t("patients.guardian_relationship_pai") },
                { value: "TUTOR", label: t("patients.guardian_relationship_tutor") },
                { value: "OUTRO", label: t("patients.guardian_relationship_outro") },
              ]}
            />
            <Input
              label={`${t("patients.guardian_phone")} (${t("common.optional")})`}
              name="guardianPhone"
              inputMode="numeric"
              value={form.guardianPhone}
              maxLength={15}
              onChange={(e) => set("guardianPhone", maskPhone(e.target.value))}
            />
          </>
        )}

        <SubmitButton />
      </form>
    </Dialog>
  );
}
