import { AlertTriangle, HeartPulse, MapPin, User, Users } from "lucide-react";
import { api } from "@/lib/api";
import { getDictionary } from "@/lib/i18n-server";
import { ProfileField } from "@/components/portal/profile-field";
import { formatDate } from "@/lib/utils";
import type { BloodType, Patient, Sex } from "@/lib/types";

type Translate = (key: string) => string;

function sexLabel(t: Translate, sex: Sex | null | undefined): string | null {
  if (!sex) return null;
  return t(`patients.sex_${sex.toLowerCase()}`);
}

function bloodTypeLabel(bloodType: BloodType | null | undefined): string | null {
  if (!bloodType) return null;
  return bloodType.replace("_POS", "+").replace("_NEG", "-");
}

function guardianRelationshipLabel(t: Translate, relationship: Patient["guardianRelationship"]): string | null {
  if (!relationship) return null;
  return t(`patients.guardian_relationship_${relationship.toLowerCase()}`);
}

function ProfileSection({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof User;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[10px] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={14} className="text-[var(--text-muted)]" />
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">{title}</h2>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">{children}</div>
    </section>
  );
}

export default async function PortalProfilePage() {
  const [t, patient] = await Promise.all([getDictionary(), api.me.patient().catch(() => null)]);

  if (!patient) {
    return (
      <main className="p-6">
        <p className="text-sm text-[var(--text-muted)]">{t("common.error")}</p>
      </main>
    );
  }

  const hasClinicalData =
    patient.sex ||
    patient.bloodType ||
    patient.allergies ||
    patient.continuousMedications ||
    patient.preExistingConditions ||
    patient.clinicalAlert;

  const addressLine = [patient.address.street, patient.address.houseNumber].filter(Boolean).join(", ");

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-base font-semibold text-[var(--text-primary)] mb-1">{t("portal.profile_title")}</h1>
        <p className="text-sm text-[var(--text-secondary)]">{t("portal.profile_subtitle")}</p>
      </div>

      <div className="flex flex-col gap-4 max-w-2xl">
        <ProfileSection icon={User} title={t("portal.profile_registration_title")}>
          <ProfileField label={t("patients.full_name")} value={patient.fullName} />
          <ProfileField label={t("patients.masked_cpf")} value={patient.maskedCpf} />
          <ProfileField label={t("patients.email")} value={patient.email} />
          <ProfileField label={t("patients.phone")} value={patient.phone} />
          <ProfileField
            label={t("patients.birth_date")}
            value={patient.birthDate ? formatDate(patient.birthDate) : null}
          />
        </ProfileSection>

        <ProfileSection icon={MapPin} title={t("portal.profile_address_title")}>
          <ProfileField label={t("patients.street")} value={addressLine} />
          <ProfileField label={`${t("patients.complement")}`} value={patient.address.complement} />
          <ProfileField label={t("patients.district")} value={patient.address.district} />
          <ProfileField
            label={t("patients.city")}
            value={patient.address.city ? `${patient.address.city}/${patient.address.state}` : null}
          />
          <ProfileField label={t("patients.postcode")} value={patient.address.postcode} />
        </ProfileSection>

        {hasClinicalData && (
          <ProfileSection icon={HeartPulse} title={t("portal.profile_clinical_title")}>
            <ProfileField label={t("patients.sex")} value={sexLabel(t, patient.sex)} />
            <ProfileField label={t("patients.blood_type")} value={bloodTypeLabel(patient.bloodType)} />
            <ProfileField label={t("patients.allergies")} value={patient.allergies} />
            <ProfileField label={t("patients.continuous_medications")} value={patient.continuousMedications} />
            <ProfileField label={t("patients.pre_existing_conditions")} value={patient.preExistingConditions} />
            {patient.clinicalAlert && (
              <div className="sm:col-span-2 flex items-start gap-2 rounded-lg bg-[var(--color-warning)]/10 px-3 py-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5 text-[var(--color-warning)]" />
                <div>
                  <p className="text-[11px] text-[var(--color-warning)] mb-0.5">{t("patients.clinical_alert")}</p>
                  <p className="text-sm text-[var(--text-primary)]">{patient.clinicalAlert}</p>
                </div>
              </div>
            )}
          </ProfileSection>
        )}

        {patient.guardianName && (
          <ProfileSection icon={Users} title={t("portal.profile_guardian_title")}>
            <ProfileField label={t("patients.guardian_name")} value={patient.guardianName} />
            <ProfileField label={t("patients.masked_cpf")} value={patient.maskedGuardianCpf} />
            <ProfileField
              label={t("patients.guardian_relationship")}
              value={guardianRelationshipLabel(t, patient.guardianRelationship)}
            />
            <ProfileField label={t("patients.guardian_phone")} value={patient.guardianPhone} />
          </ProfileSection>
        )}
      </div>
    </main>
  );
}
