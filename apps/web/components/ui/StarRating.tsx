import { cn } from "../../lib/cn";

export interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  max?: number;
}

/** Bordered star buttons — used both to collect and to display a rating. */
export function StarRating({
  value,
  onChange,
  readOnly = false,
  max = 5,
}: StarRatingProps): React.JSX.Element {
  return (
    <div
      role={readOnly ? undefined : "radiogroup"}
      aria-label="Rating"
      className="flex items-center gap-1.5"
    >
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
        const filled = n <= value;
        return (
          <button
            key={n}
            type="button"
            disabled={readOnly}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            aria-pressed={filled}
            onClick={() => onChange?.(n)}
            className={cn(
              "grid place-items-center size-9 border-2 border-ink rounded-brut text-lg font-black leading-none",
              filled ? "bg-brand-yellow shadow-brut-sm" : "bg-paper",
              readOnly ? "cursor-default" : "press-brut cursor-pointer",
            )}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
