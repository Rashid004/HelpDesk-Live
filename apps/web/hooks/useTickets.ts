"use client";

import { useCallback, useEffect, useState } from "react";
import { listTickets, type TicketListQuery } from "../lib/api";
import type { PaginationMeta, TicketView } from "../lib/types";

interface State {
  tickets: TicketView[];
  pagination: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  page: number;
  setPage: (page: number) => void;
  reload: () => void;
}

const DEFAULT_LIMIT = 12;

/**
 * Loads one page of tickets for whatever scope `query` describes — the
 * customer dashboard, the agent's unassigned queue, and the agent's "my
 * tickets" tab all use this with a different `query`.
 *
 * `enabled` gates the fetch (pass the auth guard's `ready`) so it doesn't
 * race the silent-refresh bootstrap on a hard reload — an ungated fetch
 * fires before the access token exists yet, hits a 401, and only succeeds
 * on apiClient's automatic retry (see lib/session.ts's `ensureSession`).
 */
export function useTickets(query: TicketListQuery, enabled = true): State {
  const [page, setPage] = useState(1);
  const [tickets, setTickets] = useState<TicketView[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  // Query identity, so switching tabs (different status/mine/unassigned)
  // resets to page 1 instead of e.g. staying on page 3 of an empty result.
  const queryKey = JSON.stringify(query);

  useEffect(() => {
    setPage(1);
  }, [queryKey]);

  const load = useCallback(() => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    listTickets({ ...query, page, limit: DEFAULT_LIMIT })
      .then((res) => {
        setTickets(res.items);
        setPagination(res.pagination);
      })
      .catch(() => setError("We couldn't load tickets. Please try again."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, queryKey, page]);

  useEffect(() => {
    load();
  }, [load]);

  return { tickets, pagination, loading, error, page, setPage, reload: load };
}
