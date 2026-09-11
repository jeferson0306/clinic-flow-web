/** Label/value pair used across every profile card — same edges, same baseline, one place to change either. */
export function ProfileField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[11px] text-[var(--text-muted)] mb-0.5">{label}</p>
      <p className="text-sm text-[var(--text-primary)]">{value && value.trim() ? value : "—"}</p>
    </div>
  );
}
