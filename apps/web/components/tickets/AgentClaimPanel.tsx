"use client";

import { useState } from "react";
import { ApiError, claimTicket } from "../../lib/api";
import { Button } from "../ui/Button";
import { FieldError } from "../ui/Field";

/** "Assign to me" for an unclaimed ticket — handles losing the claim race. */
export function AgentClaimPanel({
  ticketId,
  onClaimed,
}: {
  ticketId: string;
  onClaimed: () => void;
}): React.JSX.Element {
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClaim(): Promise<void> {
    setClaiming(true);
    setError(null);
    try {
      await claimTicket(ticketId);
      onClaimed();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("This ticket was just claimed by another agent.");
        // Refresh anyway — the ticket's real state (now assigned to someone
        // else) replaces this stale "unclaimed" panel instead of leaving it
        // sitting there offering a button that will always 409 again.
        onClaimed();
      } else {
        setError(
          err instanceof Error ? err.message : "Couldn't claim this ticket. Please try again.",
        );
      }
    } finally {
      setClaiming(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <FieldError>{error}</FieldError>}
      <Button onClick={handleClaim} loading={claiming} fullWidth>
        Assign to me
      </Button>
    </div>
  );
}
