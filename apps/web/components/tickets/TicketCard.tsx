import Link from "next/link";
import {
  CategoryBadge,
  PriorityBadge,
  StatusBadge,
} from "../ui/Badge";
import { Card } from "../ui/Card";
import { formatDate } from "../../lib/format";
import type { TicketView } from "../../lib/types";

export function TicketCard({ ticket }: { ticket: TicketView }): React.JSX.Element {
  return (
    <Card as="article" className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between gap-3">
        <span className="label-brut">{ticket.referenceNumber}</span>
        <StatusBadge status={ticket.status} />
      </div>

      <h3 className="font-display text-lg font-extrabold leading-snug line-clamp-2">
        {ticket.title}
      </h3>

      <div className="flex flex-wrap gap-2">
        <CategoryBadge category={ticket.category} />
        <PriorityBadge priority={ticket.priority} />
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-2">
        <span className="text-xs text-muted">
          Opened {formatDate(ticket.createdAt)}
        </span>
        <Link
          href={`/tickets/${ticket.id}`}
          className="inline-flex items-center border-2 border-ink rounded-brut bg-paper text-ink font-display font-bold uppercase tracking-[0.08em] text-xs px-4 py-2 shadow-brut-sm press-brut"
        >
          Open
        </Link>
      </div>
    </Card>
  );
}
