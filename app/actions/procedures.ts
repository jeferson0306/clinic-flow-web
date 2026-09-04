"use server";

import { revalidatePath } from "next/cache";
import { api, ApiError } from "@/lib/api";
import type { FormState } from "@/app/actions/patients";

export async function createProcedure(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const durationMinutes = Number(formData.get("durationMinutes"));
  const priceReais = Number(formData.get("price"));

  if (!name || !Number.isFinite(durationMinutes) || durationMinutes <= 0 || !Number.isFinite(priceReais) || priceReais <= 0) {
    return { error: "missing_fields" };
  }

  try {
    await api.procedures.create({
      name,
      durationMinutes: Math.round(durationMinutes),
      priceCents: Math.round(priceReais * 100),
    });
  } catch (error) {
    if (error instanceof ApiError && error.body) {
      return { error: error.body.category };
    }
    return { error: "unknown" };
  }

  revalidatePath("/dashboard/procedures");
  return { error: null };
}
