"use server";

import { revalidatePath } from "next/cache";
import { api, ApiError } from "@/lib/api";
import type { FormState } from "@/app/actions/patients";

export async function requestExam(_prev: FormState, formData: FormData): Promise<FormState> {
  const patientId = String(formData.get("patientId") ?? "");
  const requestedByDoctorId = String(formData.get("requestedByDoctorId") ?? "");
  const type = String(formData.get("type") ?? "").trim();

  if (!patientId || !requestedByDoctorId || !type) {
    return { error: "missing_fields" };
  }

  try {
    await api.exams.request({ patientId, requestedByDoctorId, type });
  } catch (error) {
    if (error instanceof ApiError && error.body) {
      return { error: error.body.category };
    }
    return { error: "unknown" };
  }

  revalidatePath("/dashboard/exams");
  return { error: null };
}

export async function recordExamResult(_prev: FormState, formData: FormData): Promise<FormState> {
  const id = String(formData.get("id") ?? "");
  const result = String(formData.get("result") ?? "").trim();

  if (!id || !result) {
    return { error: "missing_fields" };
  }

  try {
    await api.exams.recordResult(id, result);
  } catch (error) {
    if (error instanceof ApiError && error.body) {
      return { error: error.body.category };
    }
    return { error: "unknown" };
  }

  revalidatePath("/dashboard/exams");
  return { error: null };
}
