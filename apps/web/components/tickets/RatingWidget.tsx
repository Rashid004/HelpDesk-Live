"use client";

import { useState } from "react";
import { rateTicket } from "../../lib/api";
import { formatDate } from "../../lib/format";
import type { TicketView } from "../../lib/types";
import { Button } from "../ui/Button";
import { FieldError } from "../ui/Field";
import { StarRating } from "../ui/StarRating";
import { Textarea } from "../ui/Textarea";

/** Read-only once rated; otherwise a real POST /tickets/:id/rate form. */
export function RatingWidget({
  ticket,
  onRated,
}: {
  ticket: TicketView;
  onRated: () => void;
}): React.JSX.Element {
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (ticket.customerRating) {
    return (
      <div className="flex flex-col gap-2">
        <StarRating value={ticket.customerRating.score} readOnly />
        {ticket.customerRating.comment && (
          <p className="text-sm text-muted">&ldquo;{ticket.customerRating.comment}&rdquo;</p>
        )}
        <p className="text-xs text-muted">Rated {formatDate(ticket.customerRating.ratedAt)}</p>
      </div>
    );
  }

  async function handleSubmit(): Promise<void> {
    if (score < 1) {
      setError("Pick a star rating first.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await rateTicket(ticket.id, { score, comment: comment.trim() || undefined });
      onRated();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't submit your rating. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <StarRating value={score} onChange={setScore} readOnly={submitting} />
      <Textarea
        placeholder="Anything else? (optional)"
        rows={2}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={submitting}
      />
      {error && <FieldError>{error}</FieldError>}
      <Button onClick={handleSubmit} loading={submitting} fullWidth>
        Submit rating
      </Button>
    </div>
  );
}
