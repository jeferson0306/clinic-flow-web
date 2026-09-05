import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { getSession } from "@/lib/session";
import { getDictionary } from "@/lib/i18n-server";
import { RefreshButton } from "@/components/dashboard/system-health/refresh-button";
import type { RecentError } from "@/lib/types";

function StatusBadge({ up, label }: { up: boolean; label: string }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        up
          ? "bg-[var(--color-success)]/15 text-[var(--color-success)]"
          : "bg-[var(--color-danger)]/15 text-[var(--color-danger)]"
      }`}
    >
      {label}
    </span>
  );
}

function statusCodeClass(status: number): string {
  if (status >= 500) return "text-[var(--color-danger)]";
  if (status >= 400) return "text-[var(--color-warning)]";
  return "text-[var(--text-secondary)]";
}

export default async function SystemHealthPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  const [t, health, recentErrors] = await Promise.all([
    getDictionary(),
    api.systemHealth.health(),
    api.systemHealth.recentErrors().catch(() => [] as RecentError[]),
  ]);

  const backendUp = health.status === "UP";
  const checksByName = new Map(health.checks.map((c) => [c.name, c]));
  const dbCheck = checksByName.get("Database connections health check");
  const brdocCheck = checksByName.get("brdoc");

  return (
    <main className="p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-base font-semibold text-[var(--text-primary)] mb-1">{t("system_health.title")}</h1>
          <p className="text-sm text-[var(--text-secondary)]">{t("system_health.subtitle")}</p>
        </div>
        <RefreshButton />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <HealthCard
          label={t("system_health.backend_status")}
          up={backendUp}
          upLabel={t("system_health.up")}
          downLabel={backendUp ? t("system_health.up") : t("system_health.unreachable")}
        />
        <HealthCard
          label={t("system_health.database")}
          up={dbCheck?.status === "UP"}
          upLabel={t("system_health.up")}
          downLabel={t("system_health.down")}
        />
        <HealthCard
          label={t("system_health.brdoc")}
          up={brdocCheck?.status === "UP"}
          upLabel={t("system_health.up")}
          downLabel={t("system_health.down")}
        />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{t("system_health.recent_errors")}</h2>
        <p className="text-xs text-[var(--text-muted)] mb-3">{t("system_health.recent_errors_hint")}</p>

        {recentErrors.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)] rounded-[10px] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
            {t("system_health.no_errors")}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-[10px] border border-[var(--border)] bg-[var(--bg-surface)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--text-muted)]">
                  <th className="px-4 py-2 font-medium">{t("system_health.time")}</th>
                  <th className="px-4 py-2 font-medium">{t("system_health.status_code")}</th>
                  <th className="px-4 py-2 font-medium">{t("system_health.exception_type")}</th>
                  <th className="px-4 py-2 font-medium">{t("system_health.path")}</th>
                  <th className="px-4 py-2 font-medium">{t("system_health.trace_id")}</th>
                </tr>
              </thead>
              <tbody>
                {recentErrors.map((e) => (
                  <tr key={e.traceId} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-2 whitespace-nowrap text-[var(--text-secondary)]">
                      {new Date(e.timestamp).toLocaleString()}
                    </td>
                    <td className={`px-4 py-2 font-mono font-medium ${statusCodeClass(e.status)}`}>{e.status}</td>
                    <td className="px-4 py-2 text-[var(--text-secondary)]">{e.exceptionType}</td>
                    <td className="px-4 py-2 font-mono text-xs text-[var(--text-secondary)]">{e.path ?? "—"}</td>
                    <td className="px-4 py-2 font-mono text-xs text-[var(--text-muted)]">{e.traceId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

function HealthCard({
  label,
  up,
  upLabel,
  downLabel,
}: {
  label: string;
  up: boolean;
  upLabel: string;
  downLabel: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-[10px] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
      <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      <StatusBadge up={up} label={up ? upLabel : downLabel} />
    </div>
  );
}
