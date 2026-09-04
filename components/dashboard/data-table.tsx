export type Column<T> = {
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
};

/**
 * A server-renderable table wrapped in its own horizontal scroll container —
 * this is the one thing keeping a wide table (CPF, email, address, dates...)
 * from ever forcing the page itself to scroll sideways on a small viewport.
 */
export function DataTable<T extends { id: string }>({
  columns,
  rows,
  emptyLabel,
}: {
  columns: Column<T>[];
  rows: T[];
  emptyLabel: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-[10px] border border-dashed border-[var(--border)] p-10 text-center text-sm text-[var(--text-muted)]">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="rounded-[10px] border border-[var(--border)] bg-[var(--bg-surface)] overflow-x-auto">
      <table className="w-full text-sm min-w-[560px]">
        <thead>
          <tr className="border-b border-[var(--border)]">
            {columns.map((col) => (
              <th
                key={col.header}
                className="text-left font-semibold text-[10px] uppercase tracking-widest text-[var(--text-muted)] px-4 py-3 whitespace-nowrap"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors">
              {columns.map((col) => (
                <td key={col.header} className={col.className ?? "px-4 py-3 text-[var(--text-secondary)] whitespace-nowrap"}>
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
