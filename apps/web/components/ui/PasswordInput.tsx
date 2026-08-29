"use client";

import { forwardRef, useId, useState } from "react";
import { cn } from "../../lib/cn";
import { controlBase } from "./Input";

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  invalid?: boolean;
}

/** Text input for passwords with a chunky show/hide toggle. */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ invalid, className, ...props }, ref) => {
    const [show, setShow] = useState(false);
    const fallbackId = useId();
    const inputId = props.id ?? fallbackId;

    return (
      <div className="relative">
        <input
          {...props}
          id={inputId}
          ref={ref}
          type={show ? "text" : "password"}
          aria-invalid={invalid || undefined}
          className={cn(
            controlBase,
            "pr-14",
            invalid && "border-danger",
            className,
          )}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-pressed={show}
          aria-label={show ? "Hide password" : "Show password"}
          aria-controls={inputId}
          className="absolute right-0 top-0 h-full px-3 border-l-2 border-ink grid place-items-center press-brut"
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

function EyeIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  );
}

function EyeOffIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c7 0 11 7 11 7a19.4 19.4 0 0 1-3.1 4.1M6.1 6.1A19.4 19.4 0 0 0 1 12s4 7 11 7a10.9 10.9 0 0 0 5.9-1.7" />
      <path d="M9.9 9.9a3.5 3.5 0 0 0 4.9 4.9" />
      <path d="M3 3l18 18" />
    </svg>
  );
}
