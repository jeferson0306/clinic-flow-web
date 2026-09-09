import { getDictionary } from "@/lib/i18n-server";
import { ChangePasswordForm } from "@/components/dashboard/settings/change-password-form";

export default async function PortalSettingsPage() {
  const t = await getDictionary();

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-base font-semibold text-[var(--text-primary)] mb-1">{t("auth.change_password")}</h1>
        <p className="text-sm text-[var(--text-secondary)]">{t("auth.change_password_subtitle")}</p>
      </div>

      <div className="max-w-sm rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
        <ChangePasswordForm />
      </div>
    </main>
  );
}
