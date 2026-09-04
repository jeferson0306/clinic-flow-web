import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            "h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-hover)] px-3 text-sm text-[var(--text-primary)]",
            "focus:outline-none focus:border-[var(--accent)] transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-[var(--color-danger)] focus:border-[var(--color-danger)]",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
      </div>
    );
  },
);
Select.displayName = "Select";
