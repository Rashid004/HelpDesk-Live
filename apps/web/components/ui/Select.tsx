"use client";

import { forwardRef } from "react";
import { cn } from "../../lib/cn";
import { controlBase } from "./Input";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ invalid, options, placeholder, className, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          controlBase,
          "appearance-none pr-11 cursor-pointer",
          invalid && "border-danger",
          className,
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {/* Chunky custom caret */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 border-l-2 border-ink pl-2 text-ink"
      >
        ▾
      </span>
    </div>
  ),
);
Select.displayName = "Select";
