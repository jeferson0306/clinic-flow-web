/**
 * Next.js renders this while a dashboard route's Server Component is
 * fetching (the api.*.list() calls in each page.tsx) — one shared skeleton
 * for every /dashboard/* route rather than duplicating it per page, since
 * they all share the same header-then-table shape. A route whose content
 * genuinely differs (the calendar's picker layout) still gets this same
 * placeholder for the brief moment before its own content streams in;
 * that's a fair tradeoff against maintaining seven near-identical skeletons.
 */
export default function DashboardLoading() {
  return (
    <main className="p-6 animate-pulse">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <div className="h-4 w-40 rounded bg-[var(--bg-hover)] mb-2" />
          <div className="h-3 w-64 rounded bg-[var(--bg-hover)]" />
        </div>
        <div className="h-9 w-32 rounded-lg bg-[var(--bg-hover)]" />
      </div>

      <div className="h-9 w-72 rounded-lg bg-[var(--bg-hover)] mb-3" />

      <div className="rounded-[10px] border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
        <div className="h-10 border-b border-[var(--border)] bg-[var(--bg-hover)]/60" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 border-b border-[var(--border)] last:border-0 px-4 flex items-center">
            <div className="h-3 w-full max-w-sm rounded bg-[var(--bg-hover)]" />
          </div>
        ))}
      </div>
    </main>
  );
}
