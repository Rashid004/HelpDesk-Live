import { cn } from "../../lib/cn";
import type { PaginationMeta } from "../../lib/types";

export interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
}

/** Prev/next + page count, styled to match Button. Hides itself on a single page. */
export function Pagination({
  pagination,
  onPageChange,
  className,
}: PaginationProps): React.JSX.Element | null {
  const { page, totalPages, total, hasNext, hasPrev } = pagination;
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex flex-wrap items-center justify-between gap-3", className)}
    >
      <p className="text-xs text-muted">
        Page {page} of {totalPages} · {total} total
      </p>
      <div className="flex items-center gap-2">
        <PageButton disabled={!hasPrev} onClick={() => onPageChange(page - 1)}>
          ← Prev
        </PageButton>
        <PageButton disabled={!hasNext} onClick={() => onPageChange(page + 1)}>
          Next →
        </PageButton>
      </div>
    </nav>
  );
}

function PageButton({
  disabled,
  onClick,
  children,
}: {
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center border-2 border-ink rounded-brut bg-paper text-ink",
        "font-display font-bold uppercase tracking-[0.06em] text-xs px-3 py-2",
        "shadow-brut-sm press-brut",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0",
      )}
    >
      {children}
    </button>
  );
}
