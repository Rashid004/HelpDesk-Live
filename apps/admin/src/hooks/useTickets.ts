import { useCallback, useEffect, useState } from "react";
import type { CreateTicketDTO, Ticket, TicketStatus } from "@repo/shared";
import { api, type UpdateTicketPatch } from "../lib/api";

/**
 * Ticket list state + CRUD, backed by the mock api layer. The component
 * API here is intentionally the shape we'd keep once lib/api.ts talks to
 * the real backend — swapping the data source shouldn't touch callers.
 * TODO: once wired, also subscribe to Socket.IO "ticket:created" /
 * "ticket:updated" and merge into `tickets` instead of only refetching.
 */
export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTickets(await api.listTickets());
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const createTicket = useCallback(
    async (dto: CreateTicketDTO & { customer: string }) => {
      const created = await api.createTicket(dto);
      setTickets((prev) => [created, ...prev]);
      return created;
    },
    [],
  );

  const updateTicket = useCallback(async (id: string, patch: UpdateTicketPatch) => {
    const updated = await api.updateTicket(id, patch);
    setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  }, []);

  const setStatus = useCallback(
    async (id: string, status: TicketStatus, resolutionNote?: string) => {
      const updated = await api.setStatus(id, status, resolutionNote);
      setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    },
    [],
  );

  const assignTicket = useCallback(async (id: string, agentId: string) => {
    const updated = await api.assignTicket(id, agentId);
    setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  }, []);

  const deleteTicket = useCallback(async (id: string) => {
    await api.deleteTicket(id);
    setTickets((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    tickets,
    loading,
    error,
    refetch,
    createTicket,
    updateTicket,
    setStatus,
    assignTicket,
    deleteTicket,
  };
}
