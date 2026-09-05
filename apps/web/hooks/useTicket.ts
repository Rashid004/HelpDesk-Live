"use client";

import { useCallback, useEffect, useState } from "react";
import { getTicket } from "../lib/api";
import type { TicketView } from "../lib/types";

interface State {
  ticket: TicketView | undefined;
  loading: boolean;
  /** true only on a real fetch failure — a 404 resolves `ticket: undefined` with no error. */
  error: string | null;
  notFound: boolean;
  reload: () => void;
}

/** Loads a single ticket by id — used by the shared /tickets/[id] detail page. */
export function useTicket(id: string, enabled = true): State {
  const [ticket, setTicket] = useState<TicketView | undefined>(undefined);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(() => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    setNotFound(false);
    getTicket(id)
      .then((t) => {
        setTicket(t);
        setNotFound(!t);
      })
      .catch(() => setError("We couldn't load this ticket. Please try again."))
      .finally(() => setLoading(false));
  }, [enabled, id]);

  useEffect(() => {
    load();
  }, [load]);

  return { ticket, loading, error, notFound, reload: load };
}
