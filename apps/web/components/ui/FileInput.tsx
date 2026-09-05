"use client";

import { useRef } from "react";
import { cn } from "../../lib/cn";

export interface FileInputProps {
  file: File | null;
  onSelect: (file: File | null) => void;
  accept?: string;
  disabled?: boolean;
  /** 0-100 while an upload is in flight; omit/undefined when idle. */
  progress?: number;
  label?: string;
  hint?: string;
}

/** Bordered file picker with a real upload-progress bar. */
export function FileInput({
  file,
  onSelect,
  accept,
  disabled,
  progress,
  label = "+ Attach a screenshot or file",
  hint = "Optional — image, PDF, or doc",
}: FileInputProps): React.JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled}
        onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
      />

      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className={cn(
            "text-left border-2 border-dashed border-ink rounded-brut bg-paper p-4 press-brut",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          <span className="font-display font-bold text-sm block">{label}</span>
          <span className="text-xs text-muted">{hint}</span>
        </button>
      ) : (
        <div className="border-2 border-ink rounded-brut bg-paper shadow-brut-sm p-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">{file.name}</p>
            <p className="text-xs text-muted">{Math.max(1, Math.round(file.size / 1024))} KB</p>
          </div>
          <button
            type="button"
            onClick={() => onSelect(null)}
            disabled={disabled}
            aria-label="Remove attachment"
            className="shrink-0 size-8 inline-flex items-center justify-center border-2 border-ink rounded-brut bg-paper press-brut font-bold disabled:cursor-not-allowed disabled:opacity-60"
          >
            ✕
          </button>
        </div>
      )}

      {progress !== undefined && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 border-2 border-ink rounded-brut bg-paper overflow-hidden">
            <div
              className="h-full bg-brand-blue transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="label-brut shrink-0">{progress}%</span>
        </div>
      )}
    </div>
  );
}
