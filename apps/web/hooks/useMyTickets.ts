"use client";

import { useCallback, useEffect, useState } from "react";
import { listMyTickets } from "../lib/api";
import type { TicketView } from "../lib/types";

interface State {
  tickets: TicketView[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Loads the signed-in customer's tickets.
 * TODO: when the real API is wired, also subscribe to the "ticket:updated"
 * socket event here so the list stays live — the component won't change.
 */
export function useMyTickets(): State {
  const [tickets, setTickets] = useState<TicketView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    listMyTickets()
      .then(setTickets)
      .catch(() => setError("We couldn't load your tickets. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { tickets, loading, error, reload: load };
}
