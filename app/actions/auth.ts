"use server";

import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { clearSession, setSession } from "@/lib/session";

export type LoginState = { error: string | null };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "missing_fields" };
  }

  try {
    const response = await api.login(username, password);
    await setSession({ token: response.token, role: response.role, username: response.username });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return { error: "invalid_credentials" };
    }
    return { error: "unknown" };
  }

  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  await clearSession();
  redirect("/login");
}
