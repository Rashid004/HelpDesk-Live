import { cn } from "../../lib/cn";

/** Loading placeholder — keeps the bold border so it matches the aesthetic. */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      aria-hidden
      className={cn(
        "border-2 border-ink rounded-brut bg-ink/10 animate-pulse",
        className,
      )}
      {...props}
    />
  );
}

/** Ready-made card skeleton for the dashboard ticket grid. */
export function TicketCardSkeleton(): React.JSX.Element {
  return (
    <div className="border-[3px] border-ink rounded-brut shadow-brut bg-paper p-6 flex flex-col gap-4">
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-10 w-28 mt-2" />
    </div>
  );
}
