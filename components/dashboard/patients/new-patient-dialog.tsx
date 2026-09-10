"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createPatient, type FormState } from "@/app/actions/patients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { TextAreaField } from "@/components/ui/textarea-field";
import { Dialog } from "@/components/ui/dialog";
import { useCepLookup } from "@/lib/hooks/use-cep-lookup";
import { useTranslation } from "@/lib/i18n";
import {
  earliestBirthDateIso,
  firstFieldErrorMessage,
  isValidCpf,
  isCompletePostcode,
  isValidEmailShape,
  isValidName,
  isValidBirthDate,
  isValidRequiredPhone,
  isMinor,
  maskCpf,
  maskPhone,
  maskPostcode,
  sanitizeName,
  todayIsoDate,
} from "@/lib/validation";

const INITIAL_STATE: FormState = { error: null };

const EMPTY_FORM = {
  fullName: "",
  cpf: "",
  email: "",
  phone: "",
  birthDate: "",
  postcode: "",
  houseNumber: "",
  complement: "",
  street: "",
  district: "",
  city: "",
  state: "",
  socialName: "",
  motherName: "",
  sex: "",
  bloodType: "",
  allergies: "",
  continuousMedications: "",
  preExistingConditions: "",
  clinicalAlert: "",
  guardianName: "",
  guardianCpf: "",
  guardianRelationship: "",
  guardianPhone: "",
};

/** Only the categories with a nicer localized message than the backend's own raw text — everything else falls through to that raw message instead. */
function errorMessage(t: (k: string) => string, error: string | null): string | null {
  if (error === "CONFLICT") return t("patients.duplicate_cpf");
  return null;
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

  // ViaCEP pre-fills street/district/city/state as a courtesy — every field
  // stays a real, editable input either way, so a wrong or missing lookup
  // never blocks the form (correction 2: no more address fields that only
  // ever came from a third-party API). Autofilling during render off a
  // "last postcode we already filled for" ref — not a useEffect — is the
  // React-endorsed way to derive state from a prop/query change without an
  // extra render pass; see react-hooks/set-state-in-effect.
  const cepLookup = useCepLookup(form.postcode);
  const [autofilledFor, setAutofilledFor] = useState<string | null>(null);
  if (cepLookup.data?.found && form.postcode !== autofilledFor) {
    const resolved = cepLookup.data;
    setAutofilledFor(form.postcode);
    setForm((prev) => ({
      ...prev,
      street: resolved.street ?? prev.street,
      district: resolved.district ?? prev.district,
      city: resolved.city ?? prev.city,
      state: resolved.state ?? prev.state,
    }));
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
          if (!isValidCpf(form.cpf)) errors.cpf = t("validation.invalid_cpf");
          if (!isValidEmailShape(form.email)) errors.email = t("validation.invalid_email");
          if (!isValidRequiredPhone(form.phone)) errors.phone = t("validation.invalid_phone");
          if (!isValidBirthDate(form.birthDate)) errors.birthDate = t("validation.invalid_birth_date");
          if (!isCompletePostcode(form.postcode)) errors.postcode = t("validation.invalid_postcode");
          if (!form.houseNumber.trim()) errors.houseNumber = t("validation.invalid_house_number");
          if (!form.street.trim()) errors.street = t("validation.invalid_street");
          if (!form.city.trim()) errors.city = t("validation.invalid_city");
          if (!form.state.trim()) errors.state = t("validation.invalid_state");
          if (
            isMinor(form.birthDate) &&
            (!form.guardianName.trim() ||
              !form.guardianCpf.trim() ||
              !form.guardianRelationship ||
              !isValidRequiredPhone(form.guardianPhone))
          ) {
            errors.guardianName = t("patients.guardian_section_hint");
          }
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
            toast.error(errorMessage(t, result.error) ?? firstFieldErrorMessage(result.fieldErrors) ?? t("common.error"));
          }
        }}
        className="flex flex-col gap-3" noValidate
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
          label={t("patients.phone")}
          name="phone"
          inputMode="numeric"
          value={form.phone}
          maxLength={15}
          error={fieldErrors.phone}
          onChange={(e) => set("phone", maskPhone(e.target.value))}
          required
        />
        <Input
          label={t("patients.birth_date")}
          name="birthDate"
          type="date"
          value={form.birthDate}
          min={earliestBirthDateIso()}
          max={todayIsoDate()}
          error={fieldErrors.birthDate}
          onChange={(e) => set("birthDate", e.target.value)}
          required
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
        <Input
          label={t("patients.street")}
          name="street"
          value={form.street}
          maxLength={120}
          error={fieldErrors.street}
          onChange={(e) => set("street", e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={`${t("patients.district")} (${t("common.optional")})`}
            name="district"
            value={form.district}
            maxLength={80}
            onChange={(e) => set("district", e.target.value)}
          />
          <Input
            label={t("patients.city")}
            name="city"
            value={form.city}
            maxLength={80}
            error={fieldErrors.city}
            onChange={(e) => set("city", e.target.value)}
            required
          />
        </div>
        <Input
          label={t("patients.state")}
          name="state"
          placeholder="SP"
          value={form.state}
          maxLength={2}
          error={fieldErrors.state}
          onChange={(e) => set("state", e.target.value.toUpperCase())}
          required
        />

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
              label={t("patients.guardian_cpf")}
              name="guardianCpf"
              placeholder="000.000.000-00"
              inputMode="numeric"
              value={form.guardianCpf}
              maxLength={14}
              onChange={(e) => set("guardianCpf", maskCpf(e.target.value))}
              required
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
              label={t("patients.guardian_phone")}
              name="guardianPhone"
              inputMode="numeric"
              value={form.guardianPhone}
              maxLength={15}
              onChange={(e) => set("guardianPhone", maskPhone(e.target.value))}
              required
            />
          </>
        )}

        <SubmitButton />
      </form>
    </Dialog>
  );
}
