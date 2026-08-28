"use client";

import { forwardRef } from "react";
import { cn } from "../../lib/cn";

type Variant = "primary" | "secondary" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand-yellow text-ink",
  secondary: "bg-brand-blue text-paper",
  outline: "bg-paper text-ink",
  danger: "bg-danger text-paper",
};

const SIZES: Record<Size, string> = {
  sm: "px-4 py-2 text-xs gap-1.5",
  md: "px-6 py-3 text-sm gap-2",
  lg: "px-8 py-4 text-base gap-2.5",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          "inline-flex items-center justify-center border-2 border-ink rounded-brut",
          "font-display font-bold uppercase tracking-[0.08em] leading-none",
          "shadow-brut press-brut select-none",
          "disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-brut",
          "disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:active:translate-x-0 disabled:active:translate-y-0",
          VARIANTS[variant],
          SIZES[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {loading && <Spinner />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

function Spinner(): React.JSX.Element {
  return (
    <span
      aria-hidden
      className="size-4 shrink-0 animate-spin border-2 border-current border-t-transparent rounded-full"
    />
  );
}
