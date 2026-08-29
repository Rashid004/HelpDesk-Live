import type {
  CreateTicketDTO,
  Ticket,
  TicketStatus,
} from "@repo/shared";
import { MOCK_TICKETS } from "../mocks/tickets";
import { AGENTS, CUSTOMERS } from "../mocks/users";

/* ------------------------------------------------------------------ */
/*  Mock API layer                                                     */
/*  ---------------------------------------------------------------    */
/*  Every function here fakes a network round-trip against in-memory   */
/*  data. Wiring the real backend is meant to be an isolated change:   */
/*  keep the signatures, swap the bodies for fetch()/axios calls to    */
/*  apps/backend, and delete the mock store below.                     */
/*  Each function marks its real endpoint with a TODO.                 */
/* ------------------------------------------------------------------ */

const LATENCY = 450; // ms — simulated async delay

function delay<T>(value: T, ms = LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// Session-scoped mutable copy so create/update/delete persist across
// route changes while the tab is open.
let store: Ticket[] = MOCK_TICKETS.map((t) => ({ ...t }));

let refCounter =
  Math.max(...store.map((t) => Number(t.referenceNumber.replace("HD-", "")) || 0)) + 1;

export type UpdateTicketPatch = Partial<
  Pick<Ticket, "title" | "description" | "category" | "priority" | "status" | "agent">
> & {
  /** Required by the backend when status is set to "resolved". */
  resolutionNote?: string;
};

export const api = {
  async listTickets(): Promise<Ticket[]> {
    // TODO: replace with real API call — GET /api/tickets
    return delay(store.map((t) => ({ ...t })));
  },

  async getTicket(id: string): Promise<Ticket | undefined> {
    // TODO: replace with real API call — GET /api/tickets/:id
    const found = store.find((t) => t.id === id);
    return delay(found ? { ...found } : undefined);
  },

  async createTicket(dto: CreateTicketDTO & { customer: string }): Promise<Ticket> {
    // TODO: replace with real API call — POST /api/tickets
    const nowDate = new Date();
    const ticket: Ticket = {
      id: `tkt_new_${refCounter}`,
      referenceNumber: `HD-${refCounter++}`,
      title: dto.title,
      description: dto.description,
      category: dto.category,
      priority: dto.priority ?? "normal",
      status: "open",
      customer: dto.customer,
      agent: null,
      attachments: undefined,
      statusUpdates: [],
      createdAt: nowDate,
      updatedAt: nowDate,
    };
    store = [ticket, ...store];
    return delay({ ...ticket });
  },

  async updateTicket(id: string, patch: UpdateTicketPatch): Promise<Ticket> {
    // TODO: replace with real API calls — PATCH /api/tickets/:id
    // and PATCH /api/tickets/:id/status (status + resolutionNote).
    const idx = store.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error(`Ticket ${id} not found`);
    const next: Ticket = { ...store[idx], ...patch, updatedAt: new Date() };
    if (patch.resolutionNote !== undefined) next.resolutionNote = patch.resolutionNote;
    store[idx] = next;
    return delay({ ...next });
  },

  async deleteTicket(id: string): Promise<void> {
    // TODO: replace with real API call — DELETE /api/tickets/:id
    store = store.filter((t) => t.id !== id);
    return delay(undefined);
  },

  async assignTicket(id: string, agentId: string): Promise<Ticket> {
    // TODO: replace with real API call — POST /api/tickets/:id/assign
    // (backend takes a Redis SETNX lock; a race loses with "already assigned").
    return api.updateTicket(id, { agent: agentId });
  },

  async setStatus(id: string, status: TicketStatus, resolutionNote?: string): Promise<Ticket> {
    // TODO: replace with real API call — PATCH /api/tickets/:id/status
    return api.updateTicket(id, { status, resolutionNote });
  },

  async listCustomers() {
    // TODO: replace with real API call — GET /api/users?role=customer
    return delay(CUSTOMERS.map((c) => ({ ...c })));
  },

  async listAgents() {
    // TODO: replace with real API call — GET /api/users?role=agent
    return delay(AGENTS.map((a) => ({ ...a })));
  },
};
