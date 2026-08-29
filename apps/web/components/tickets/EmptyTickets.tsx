import Link from "next/link";

/** Shown on the dashboard when the customer has no tickets yet. */
export function EmptyTickets(): React.JSX.Element {
  return (
    <div className="border-[3px] border-dashed border-ink rounded-brut bg-paper p-10 sm:p-14 text-center flex flex-col items-center gap-5">
      {/* Illustration-style bordered mark */}
      <div className="relative">
        <div className="size-20 border-[3px] border-ink rounded-brut bg-brand-yellow shadow-brut grid place-items-center text-3xl font-black">
          ?
        </div>
        <div
          aria-hidden
          className="absolute -right-3 -bottom-3 size-8 border-2 border-ink rounded-brut bg-brand-pink shadow-brut-sm"
        />
      </div>

      <div className="flex flex-col gap-2 max-w-sm">
        <h2 className="font-display text-2xl font-black">No tickets yet</h2>
        <p className="text-sm text-muted">
          When you hit a problem, open a ticket and an agent will pick it up and
          chat with you in real time.
        </p>
      </div>

      <Link
        href="/tickets/new"
        className="inline-flex items-center border-2 border-ink rounded-brut bg-brand-yellow text-ink font-display font-bold uppercase tracking-[0.08em] text-sm px-6 py-3 shadow-brut press-brut"
      >
        + Create your first ticket
      </Link>
    </div>
  );
}
