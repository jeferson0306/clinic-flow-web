"use client";

import { useEffect, useRef, useState } from "react";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { gsap } from "gsap";

export type { ColumnDef } from "@tanstack/react-table";

export function DataTable<T extends { id: string }>({
  columns,
  data,
  emptyLabel,
  searchPlaceholder,
}: {
  columns: ColumnDef<T>[];
  data: T[];
  emptyLabel: string;
  searchPlaceholder: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const bodyRef = useRef<HTMLTableSectionElement>(null);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // Callers rarely need custom cell rendering — most columns are just an
    // accessorFn returning a display string — so render that string by
    // default and let a column override `cell` only when it needs JSX.
    defaultColumn: { cell: (info) => info.getValue<React.ReactNode>() },
  });

  const rows = table.getRowModel().rows;

  useEffect(() => {
    const rowEls = bodyRef.current?.querySelectorAll("tr");
    if (!rowEls || rowEls.length === 0) return;
    const tween = gsap.from(rowEls, {
      opacity: 0,
      y: 6,
      duration: 0.3,
      stagger: 0.03,
      ease: "power1.out",
    });
    return () => {
      tween.kill();
    };
    // Re-run whenever the visible row count/order changes (sort, filter, or
    // fresh data from the server) — not on every render.
  }, [rows.length, globalFilter, sorting]);

  if (data.length === 0) {
    return (
      <div className="rounded-[10px] border border-dashed border-[var(--border)] p-10 text-center text-sm text-[var(--text-muted)]">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full sm:w-72">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-hover)] pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
        />
      </div>

      <div className="rounded-[10px] border border-[var(--border)] bg-[var(--bg-surface)] overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-[var(--border)]">
                {headerGroup.headers.map((header) => {
                  const sortable = header.column.getCanSort();
                  const sortDirection = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      onClick={sortable ? header.column.getToggleSortingHandler() : undefined}
                      className={`text-left font-semibold text-[10px] uppercase tracking-widest text-[var(--text-muted)] px-4 py-3 whitespace-nowrap ${
                        sortable ? "cursor-pointer select-none hover:text-[var(--text-secondary)]" : ""
                      }`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sortable &&
                          (sortDirection === "asc" ? (
                            <ArrowUp size={11} />
                          ) : sortDirection === "desc" ? (
                            <ArrowDown size={11} />
                          ) : (
                            <ArrowUpDown size={11} className="opacity-40" />
                          ))}
                      </span>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody ref={bodyRef}>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-[var(--text-secondary)] whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
