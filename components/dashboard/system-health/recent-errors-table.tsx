"use client";

import { DataTable, type ColumnDef } from "@/components/dashboard/data-table";
import { useTranslation } from "@/lib/i18n";
import type { RecentError } from "@/lib/types";

function statusCodeClass(status: number): string {
  if (status >= 500) return "text-[var(--color-danger)]";
  if (status >= 400) return "text-[var(--color-warning)]";
  return "text-[var(--text-secondary)]";
}

type Row = RecentError & { id: string };

/**
 * A client component for the same reason every other `*-table.tsx` here is:
 * `ColumnDef.cell`/`accessorFn` are functions, and a Server Component page
 * cannot pass those to DataTable (a Client Component) as props.
 */
export function RecentErrorsTable({ errors }: { errors: RecentError[] }) {
  const { t } = useTranslation();

  const columns: ColumnDef<Row>[] = [
    {
      id: "timestamp",
      header: t("system_health.time"),
      // Sort by the raw ISO string (correct lexicographically) while
      // displaying it formatted for the viewer's locale. suppressHydrationWarning:
      // that locale/timezone differs from the server's during SSR — an
      // expected, one-time mismatch corrected on hydration, not a real bug.
      accessorFn: (e) => e.timestamp,
      cell: ({ row }) => (
        <span suppressHydrationWarning>{new Date(row.original.timestamp).toLocaleString()}</span>
      ),
    },
    {
      id: "status",
      header: t("system_health.status_code"),
      accessorFn: (e) => e.status,
      cell: ({ row }) => (
        <span className={`font-mono font-medium ${statusCodeClass(row.original.status)}`}>
          {row.original.status}
        </span>
      ),
    },
    { id: "exceptionType", header: t("system_health.exception_type"), accessorFn: (e) => e.exceptionType },
    {
      id: "path",
      header: t("system_health.path"),
      accessorFn: (e) => e.path ?? "",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.path ?? "—"}</span>,
    },
    {
      id: "traceId",
      header: t("system_health.trace_id"),
      accessorFn: (e) => e.traceId,
      enableSorting: false,
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.traceId}</span>,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={errors.map((e) => ({ ...e, id: e.traceId }))}
      emptyLabel={t("system_health.no_errors")}
      searchPlaceholder={t("common.search")}
    />
  );
}
