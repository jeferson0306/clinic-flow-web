"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login, type LoginState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n";

const INITIAL_STATE: LoginState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useTranslation();
  return (
    <Button type="submit" loading={pending} className="w-full mt-1">
      {t("auth.login")}
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(login, INITIAL_STATE);
  const { t } = useTranslation();

  const errorMessage =
    state.error === "invalid_credentials"
      ? t("auth.invalid_credentials")
      : state.error === "missing_fields"
        ? t("auth.missing_fields")
        : state.error === "unknown"
          ? t("auth.unknown_error")
          : null;

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--bg-body)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">{t("auth.welcome_back")}</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{t("auth.sign_in_subtitle")}</p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow)]">
          <form action={formAction} className="flex flex-col gap-4">
            <Input
              label={t("auth.username")}
              name="username"
              autoComplete="username"
              placeholder="admin"
              required
            />
            <Input
              label={t("auth.password")}
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />

            {errorMessage && (
              <p className="text-xs text-[var(--color-danger)]" role="alert">
                {errorMessage}
              </p>
            )}

            <SubmitButton />
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-[var(--text-muted)]">{t("auth.demo_hint")}</p>
      </div>
    </div>
  );
}
