import type { Message, Ticket, UserRole } from "@repo/shared";

/**
 * UI view-models. The backend returns ids for `customer` / `agent` / `sender`;
 * the UI needs display names, so these thin wrappers add them.
 * When the real API lands, map its responses into these same shapes and the
 * components stay untouched.
 */

export interface UserView {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

export type TicketView = Ticket & {
  customerName: string;
  agentName: string | null;
};

export type MessageView = Message & {
  senderName: string;
  senderRole: UserRole;
  /** True when the current customer sent it (right-aligned bubble). */
  mine: boolean;
};

export interface AuthResult {
  user: UserView;
  accessToken: string;
}

/** Mirrors the backend's ApiResponse["meta"]["pagination"] shape exactly. */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
