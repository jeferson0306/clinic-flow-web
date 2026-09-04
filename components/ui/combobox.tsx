"use client";

import { useEffect, useRef, useState } from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type ComboboxOption = { value: string; label: string; hint?: string };

/**
 * A type-to-search select — cmdk filters `options` client-side as you type.
 * Deliberately not wrapped in Radix Popover: every use of this component
 * lives inside a Radix Dialog, and Dialog's own focus trap fights Popover's
 * for control of the input's autofocus (each has its own FocusScope, and
 * the Dialog's wins) — typing right after opening silently went nowhere
 * until the user manually clicked the search field first. A plain
 * absolutely-positioned panel with a manual focus effect and an
 * outside-click listener sidesteps that entirely.
 *
 * Built for lists in the low hundreds (patients, doctors); a list large
 * enough to need server-side search would need a different data flow (see
 * README's list-endpoint note).
 */
export function Combobox({
  label,
  name,
  options,
  value,
  onChange,
  placeholder,
  emptyLabel,
  required,
}: {
  label?: string;
  name?: string;
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  emptyLabel: string;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      {label && <span className="text-xs font-semibold text-[var(--text-secondary)]">{label}</span>}
      {name && <input type="hidden" name={name} value={value} required={required} />}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-lg border border-[var(--border)]",
          "bg-[var(--bg-hover)] px-3 text-sm text-left transition-colors",
          "focus:outline-none focus:border-[var(--accent)]",
          !selected && "text-[var(--text-muted)]",
        )}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronsUpDown size={14} className="shrink-0 text-[var(--text-muted)]" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-full z-50 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow)] overflow-hidden">
          <CommandPrimitive className="flex flex-col" shouldFilter>
            <div className="flex items-center gap-2 border-b border-[var(--border)] px-3">
              <Search size={14} className="shrink-0 text-[var(--text-muted)]" />
              <CommandPrimitive.Input
                ref={inputRef}
                placeholder={placeholder}
                className="h-9 w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
              />
            </div>
            <CommandPrimitive.List className="max-h-56 overflow-y-auto p-1">
              <CommandPrimitive.Empty className="px-3 py-6 text-center text-xs text-[var(--text-muted)]">
                {emptyLabel}
              </CommandPrimitive.Empty>
              {options.map((option) => (
                <CommandPrimitive.Item
                  key={option.value}
                  value={`${option.label} ${option.hint ?? ""}`}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-md px-2.5 py-2 text-sm cursor-pointer",
                    "text-[var(--text-secondary)] data-[selected=true]:bg-[var(--bg-hover)] data-[selected=true]:text-[var(--text-primary)]",
                  )}
                >
                  <span className="flex flex-col">
                    <span>{option.label}</span>
                    {option.hint && <span className="text-xs text-[var(--text-muted)]">{option.hint}</span>}
                  </span>
                  {option.value === value && <Check size={14} className="shrink-0 text-[var(--accent)]" />}
                </CommandPrimitive.Item>
              ))}
            </CommandPrimitive.List>
          </CommandPrimitive>
        </div>
      )}
    </div>
  );
}
