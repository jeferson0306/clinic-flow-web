"use server";

import { revalidatePath } from "next/cache";
import { api, ApiError } from "@/lib/api";
import type { FormState } from "@/app/actions/patients";

export async function createDoctor(_prev: FormState, formData: FormData): Promise<FormState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const cpf = String(formData.get("cpf") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const specialty = String(formData.get("specialty") ?? "").trim();
  const licenseNumber = String(formData.get("licenseNumber") ?? "").trim();

  if (!fullName || !cpf || !email || !specialty || !licenseNumber) {
    return { error: "missing_fields" };
  }

  try {
    await api.doctors.create({ fullName, cpf, email, specialty, licenseNumber });
  } catch (error) {
    if (error instanceof ApiError && error.body) {
      return {
        error: error.body.category,
        fieldErrors: error.body.field ? { [error.body.field]: error.body.message } : undefined,
      };
    }
    return { error: "unknown" };
  }

  revalidatePath("/dashboard/doctors");
  return { error: null };
}
