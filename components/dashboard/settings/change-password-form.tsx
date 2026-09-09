"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { changePassword } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n";
import { isStrongPassword } from "@/lib/validation";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useTranslation();
  return (
    <Button type="submit" loading={pending} className="w-full mt-1">
      {t("auth.change_password")}
    </Button>
  );
}

export function ChangePasswordForm() {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  return (
    <form
      action={async (formData) => {
        const errors: Record<string, string> = {};
        if (!isStrongPassword(newPassword)) errors.newPassword = t("validation.invalid_password");
        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors);
          return;
        }
        setFieldErrors({});

        const result = await changePassword({ error: null }, formData);
        if (result.error === null) {
          toast.success(t("auth.change_password_success"));
          setCurrentPassword("");
          setNewPassword("");
        } else if (result.error === "missing_fields") {
          toast.error(t("auth.missing_fields"));
        } else if (result.error === "wrong_current_password") {
          setFieldErrors({ currentPassword: t("auth.wrong_current_password") });
        } else if (result.error === "unknown") {
          toast.error(t("common.error"));
        } else {
          // A raw PasswordPolicy message from the backend — already a
          // specific, readable reason, shown as-is rather than a generic
          // fallback (same pattern every other form in this app follows).
          setFieldErrors({ newPassword: result.error });
        }
      }}
      noValidate
      className="flex flex-col gap-3"
    >
      <Input
        label={t("auth.current_password")}
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        value={currentPassword}
        error={fieldErrors.currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        required
      />
      <Input
        label={t("auth.new_password")}
        name="newPassword"
        type="password"
        autoComplete="new-password"
        value={newPassword}
        error={fieldErrors.newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />
      <p className="text-xs text-[var(--text-muted)]">{t("auth.password_requirements")}</p>
      <SubmitButton />
    </form>
  );
}
