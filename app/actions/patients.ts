"use server";

import { revalidatePath } from "next/cache";
import { api, ApiError } from "@/lib/api";
import type { BloodType, GuardianRelationship, Sex } from "@/lib/types";

export type FormState = { error: string | null; fieldErrors?: Record<string, string> };

/** Every clinical/legal-guardian field is optional — a blank input becomes `undefined`, never `""`. */
function clinicalFieldsFrom(formData: FormData) {
  const field = (name: string): string | undefined => {
    const value = String(formData.get(name) ?? "").trim();
    return value || undefined;
  };
  return {
    socialName: field("socialName"),
    motherName: field("motherName"),
    sex: field("sex") as Sex | undefined,
    bloodType: field("bloodType") as BloodType | undefined,
    allergies: field("allergies"),
    continuousMedications: field("continuousMedications"),
    preExistingConditions: field("preExistingConditions"),
    clinicalAlert: field("clinicalAlert"),
    guardianName: field("guardianName"),
    guardianCpf: field("guardianCpf"),
    guardianRelationship: field("guardianRelationship") as GuardianRelationship | undefined,
    guardianPhone: field("guardianPhone"),
  };
}

export async function createPatient(_prev: FormState, formData: FormData): Promise<FormState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const cpf = String(formData.get("cpf") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const birthDate = String(formData.get("birthDate") ?? "").trim();
  const postcode = String(formData.get("postcode") ?? "").trim();

  if (!fullName || !cpf || !email || !postcode) {
    return { error: "missing_fields" };
  }

  try {
    await api.patients.create({
      fullName,
      cpf,
      email,
      phone: phone || undefined,
      birthDate: birthDate || undefined,
      postcode,
      ...clinicalFieldsFrom(formData),
    });
  } catch (error) {
    if (error instanceof ApiError && error.body) {
      return {
        error: error.body.category,
        fieldErrors: error.body.field ? { [error.body.field]: error.body.message } : undefined,
      };
    }
    return { error: "unknown" };
  }

  revalidatePath("/dashboard/patients");
  return { error: null };
}

export async function updatePatient(_prev: FormState, formData: FormData): Promise<FormState> {
  const id = String(formData.get("id") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const birthDate = String(formData.get("birthDate") ?? "").trim();
  const postcode = String(formData.get("postcode") ?? "").trim();

  if (!id || !fullName || !email || !postcode) {
    return { error: "missing_fields" };
  }

  try {
    await api.patients.update(id, {
      fullName,
      email,
      phone: phone || undefined,
      birthDate: birthDate || undefined,
      postcode,
      ...clinicalFieldsFrom(formData),
    });
  } catch (error) {
    if (error instanceof ApiError && error.body) {
      return {
        error: error.body.category,
        fieldErrors: error.body.field ? { [error.body.field]: error.body.message } : undefined,
      };
    }
    return { error: "unknown" };
  }

  revalidatePath("/dashboard/patients");
  return { error: null };
}

export async function deletePatient(id: string): Promise<{ error: string | null }> {
  try {
    await api.patients.delete(id);
  } catch (error) {
    if (error instanceof ApiError && error.body) {
      return { error: error.body.category };
    }
    return { error: "unknown" };
  }
  revalidatePath("/dashboard/patients");
  return { error: null };
}
