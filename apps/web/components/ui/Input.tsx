"use client";

import { forwardRef } from "react";
import { cn } from "../../lib/cn";

/** Shared control styling for input / textarea / select. */
export const controlBase = cn(
  "w-full border-2 border-ink rounded-brut bg-paper text-ink",
  "px-4 py-3 text-sm font-medium placeholder:text-muted",
  "shadow-brut-sm transition-shadow",
  "focus:outline-none focus-visible:outline-none focus:shadow-brut",
  "disabled:cursor-not-allowed disabled:opacity-60",
);

const invalidCls = "border-danger focus:shadow-[4px_4px_0_0_var(--color-danger)]";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ invalid, className, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(controlBase, invalid && invalidCls, className)}
      {...props}
    />
  ),
);
Input.displayName = "Input";
