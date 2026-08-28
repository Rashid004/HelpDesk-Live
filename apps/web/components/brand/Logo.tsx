import { cn } from "../../lib/cn";

/** HelpDesk Live wordmark — bordered chunky mark + name. */
export function Logo({
  className,
  invert = false,
}: {
  className?: string;
  invert?: boolean;
}): React.JSX.Element {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "grid size-9 place-items-center border-2 border-ink rounded-brut font-display font-extrabold shadow-brut-sm",
          invert ? "bg-paper text-ink" : "bg-brand-yellow text-ink",
        )}
        aria-hidden
      >
        HD
      </span>
      <span
        className={cn(
          "font-display text-lg font-extrabold tracking-tight",
          invert && "text-paper",
        )}
      >
        HelpDesk&nbsp;Live
      </span>
    </span>
  );
}
