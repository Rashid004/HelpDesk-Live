"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/cn";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Tailwind max-width class for the panel. */
  size?: string;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "max-w-lg",
}: ModalProps): React.JSX.Element | null {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent): void {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    // Move focus into the dialog.
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Flat scrim — no blur */}
      <div className="absolute inset-0 bg-ink/40" aria-hidden />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          "relative w-full bg-paper border-[3px] border-ink rounded-brut shadow-brut-xl",
          "max-h-[90vh] overflow-y-auto",
          size,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b-2 border-ink p-6">
          <div className="flex flex-col gap-1">
            <h2 id={titleId} className="text-xl font-display font-extrabold">
              {title}
            </h2>
            {description && (
              <p id={descId} className="text-sm text-muted">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="shrink-0 size-9 inline-flex items-center justify-center border-2 border-ink rounded-brut bg-paper shadow-brut-sm press-brut font-bold"
          >
            ✕
          </button>
        </div>

        <div className="p-6">{children}</div>

        {footer && (
          <div className="flex justify-end gap-3 border-t-2 border-ink p-6">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
