"use client";

import Link from "next/link";
import { useState } from "react";
import { ApiError, claimTicket } from "../../lib/api";
import { formatDate } from "../../lib/format";
import type { TicketView } from "../../lib/types";
import { Button } from "../ui/Button";
import { CategoryBadge, PriorityBadge, StatusBadge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { FieldError } from "../ui/Field";

/**
 * Ticket card for the agent queue — shows who filed it (customerName, only
 * available here because ticket.repository.ts populates it) and offers an
 * inline "Assign to me" for unclaimed tickets, so claiming doesn't require
 * opening the detail page first.
 */
export function AgentTicketCard({
  ticket,
  onClaimed,
}: {
  ticket: TicketView;
  onClaimed: () => void;
}): React.JSX.Element {
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isUnclaimed = ticket.agent === null;

  async function handleClaim(): Promise<void> {
    setClaiming(true);
    setError(null);
    try {
      await claimTicket(ticket.id);
      onClaimed();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("Just claimed by another agent.");
        onClaimed();
      } else {
        setError(err instanceof Error ? err.message : "Couldn't claim this ticket.");
      }
    } finally {
      setClaiming(false);
    }
  }

  return (
    <Card as="article" className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between gap-3">
        <span className="label-brut">{ticket.referenceNumber}</span>
        <StatusBadge status={ticket.status} />
      </div>

      <h3 className="font-display text-lg font-extrabold leading-snug line-clamp-2">
        {ticket.title}
      </h3>

      {ticket.customerName && (
        <p className="text-xs text-muted">From {ticket.customerName}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <CategoryBadge category={ticket.category} />
        <PriorityBadge priority={ticket.priority} />
      </div>

      {error && <FieldError>{error}</FieldError>}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
        <span className="text-xs text-muted">Opened {formatDate(ticket.createdAt)}</span>
        <div className="flex items-center gap-2">
          {isUnclaimed && (
            <Button size="sm" variant="secondary" loading={claiming} onClick={handleClaim}>
              Assign to me
            </Button>
          )}
          <Link
            href={`/tickets/${ticket.id}`}
            className="inline-flex items-center border-2 border-ink rounded-brut bg-paper text-ink font-display font-bold uppercase tracking-[0.08em] text-xs px-4 py-2 shadow-brut-sm press-brut"
          >
            Open
          </Link>
        </div>
      </div>
    </Card>
  );
}
