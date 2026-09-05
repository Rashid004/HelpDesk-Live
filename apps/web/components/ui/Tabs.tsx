import { cn } from "../../lib/cn";

export interface TabItem {
  key: string;
  label: string;
  /** Optional trailing count badge, e.g. queue size. */
  count?: number;
}

export interface TabsProps {
  items: TabItem[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
}

/** Bordered segmented control — same visual language as the signup role picker. */
export function Tabs({ items, active, onChange, className }: TabsProps): React.JSX.Element {
  return (
    <div role="tablist" className={cn("inline-flex flex-wrap gap-2", className)}>
      {items.map((item) => {
        const isActive = item.key === active;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.key)}
            className={cn(
              "inline-flex items-center gap-2 border-2 border-ink rounded-brut px-4 py-2.5 press-brut",
              "font-display font-bold uppercase tracking-[0.06em] text-xs sm:text-sm",
              isActive ? "bg-brand-yellow shadow-brut" : "bg-paper shadow-brut-sm",
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-brut border-2 border-ink text-[10px]",
                  isActive ? "bg-paper" : "bg-cream",
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
