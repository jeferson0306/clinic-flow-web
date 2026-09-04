"use server";

import { revalidatePath } from "next/cache";
import { api, ApiError } from "@/lib/api";
import type { FormState } from "@/app/actions/patients";

export async function scheduleAppointment(_prev: FormState, formData: FormData): Promise<FormState> {
  const patientId = String(formData.get("patientId") ?? "");
  const doctorId = String(formData.get("doctorId") ?? "");
  const procedureId = String(formData.get("procedureId") ?? "");
  const startsAt = String(formData.get("startsAt") ?? "");

  if (!patientId || !doctorId || !procedureId || !startsAt) {
    return { error: "missing_fields" };
  }

  try {
    await api.appointments.schedule({ patientId, doctorId, procedureId, startsAt });
  } catch (error) {
    if (error instanceof ApiError && error.body) {
      return { error: error.body.category };
    }
    return { error: "unknown" };
  }

  revalidatePath("/dashboard/appointments");
  return { error: null };
}

export async function cancelAppointment(id: string): Promise<void> {
  await api.appointments.cancel(id);
  revalidatePath("/dashboard/appointments");
}
