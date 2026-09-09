"use server";

import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { clearSession, getRefreshToken, setSession } from "@/lib/session";

export type LoginState = { error: string | null };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "missing_fields" };
  }

  let destination = "/dashboard";

  try {
    const response = await api.login(email, password);
    await setSession({
      token: response.token,
      expiresInSeconds: response.expiresInSeconds,
      role: response.role,
      email: response.email,
      refreshToken: response.refreshToken,
      refreshExpiresInSeconds: response.refreshExpiresInSeconds,
    });
    if (response.role === "PACIENTE") destination = "/portal";
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return { error: "invalid_credentials" };
    }
    return { error: "unknown" };
  }

  redirect(destination);
}

export async function logout(): Promise<void> {
  const refreshToken = await getRefreshToken();
  if (refreshToken) {
    // Best-effort: revoking server-side is what actually ends the session
    // (a stolen refresh token stops working), but a signed-out browser
    // should never get stuck on a slow/unreachable backend — the cookies
    // are cleared either way.
    await api.logout(refreshToken).catch(() => {});
  }
  await clearSession();
  redirect("/login");
}

export type ChangePasswordState = { error: string | null; success?: boolean };

export async function changePassword(
  _prev: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");

  if (!currentPassword || !newPassword) {
    return { error: "missing_fields" };
  }

  try {
    await api.changePassword(currentPassword, newPassword);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return { error: "wrong_current_password" };
    }
    if (error instanceof ApiError && error.body) {
      return { error: error.body.message };
    }
    return { error: "unknown" };
  }

  return { error: null, success: true };
}
