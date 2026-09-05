/**
 * The single client-side data-access layer. Every function here calls the
 * real backend (through lib/apiClient.ts, or — for login/signup/logout —
 * through this app's own /api/auth/* proxy; see lib/session.ts for why).
 *
 * Function signatures are kept close to what the components already expect
 * so wiring stays isolated to this file and the hooks that call it.
 */

import type {
  CreateTicketDTO,
  LoginDTO,
  Message,
  RateTicketDTO,
  RequestAttachmentUploadDTO,
  SendMessageDTO,
  SignupDTO,
  Ticket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  UpdateTicketStatusDTO,
  User,
} from "@repo/shared";
import { apiClient, ApiError, postAuthProxy, type Paginated } from "./apiClient";
import { clearSession, getAccessToken } from "./session";
import type { AuthResult, TicketView, UserView } from "./types";

export { ApiError };

/* ------------------------------------------------------------------ */
/*  Auth — signup/login/refresh go through app/api/auth/* (server-side,      */
/*  so the refresh token can be set as an httpOnly cookie and never reach    */
/*  this module). Everything else below talks to the backend directly.      */
/* ------------------------------------------------------------------ */

interface SessionResponse {
  user: User;
  accessToken: string;
}

function toAuthResult(res: SessionResponse): AuthResult {
  const u = res.user;
  const user: UserView = { id: u.id, fullName: u.fullName, email: u.email, role: u.role };
  return { user, accessToken: res.accessToken };
}

export async function signup(dto: SignupDTO): Promise<AuthResult> {
  const data = await postAuthProxy<SessionResponse>("/api/auth/signup", dto);
  return toAuthResult(data);
}

export async function login(dto: LoginDTO): Promise<AuthResult> {
  const data = await postAuthProxy<SessionResponse>("/api/auth/login", dto);
  return toAuthResult(data);
}

/** Best-effort server-side revoke, then always clears the local session. */
export async function logout(): Promise<void> {
  const token = getAccessToken();
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } finally {
    clearSession();
  }
}

/* ------------------------------------------------------------------ */
/*  Tickets                                                            */
/* ------------------------------------------------------------------ */

/**
 * ticket.repository.ts populates `customer`/`agent` with `fullName`, so
 * these are normally real names. The fallback only bites in the edge case
 * where the referenced user was deleted (populate comes back empty).
 */
function toTicketView(t: Ticket): TicketView {
  return {
    ...t,
    customerName: t.customerName ?? "",
    agentName: t.agent ? (t.agentName ?? "") : null,
  };
}

export interface TicketListQuery {
  status?: TicketStatus;
  category?: TicketCategory;
  priority?: TicketPriority;
  /** Agent-only scope: their own claimed tickets. See ticket.controller.ts's `list`. */
  mine?: boolean;
  /** Agent-only scope: the open queue nobody's claimed yet (agent: null). */
  unassigned?: boolean;
  page?: number;
  limit?: number;
}

export interface TicketPage {
  items: TicketView[];
  pagination: Paginated<Ticket>["pagination"];
}

/**
 * A customer always gets just their own tickets, no matter what's passed —
 * that filter is forced server-side. An agent gets `mine`/`unassigned` as
 * explicit opt-in scopes; passing neither returns the full queue.
 */
export async function listTickets(query: TicketListQuery = {}): Promise<TicketPage> {
  const { mine, unassigned, ...rest } = query;
  const params: Record<string, unknown> = { ...rest };
  if (mine) params.mine = "true";
  if (unassigned) params.unassigned = "true";

  const { items, pagination } = await apiClient.getPaginated<Ticket>("/tickets", params);
  return { items: items.map(toTicketView), pagination };
}

export async function getTicket(id: string): Promise<TicketView | undefined> {
  try {
    const ticket = await apiClient.get<Ticket>(`/tickets/${id}`);
    return toTicketView(ticket);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return undefined;
    throw err;
  }
}

export async function createTicket(dto: CreateTicketDTO): Promise<TicketView> {
  const ticket = await apiClient.post<Ticket>("/tickets", dto);
  return toTicketView(ticket);
}

export async function rateTicket(ticketId: string, dto: RateTicketDTO): Promise<TicketView> {
  const ticket = await apiClient.post<Ticket>(`/tickets/${ticketId}/rate`, dto);
  return toTicketView(ticket);
}

/** "Assign to me" — PATCH /tickets/:id/claim. A 409 means another agent won the race. */
export async function claimTicket(ticketId: string): Promise<TicketView> {
  const ticket = await apiClient.patch<Ticket>(`/tickets/${ticketId}/claim`);
  return toTicketView(ticket);
}

/**
 * `resolutionNote` is required by the backend the moment `status` is
 * "resolved" (updateTicketStatusSchema's `.refine` in @repo/shared) — forms
 * calling this should enforce that client-side too (see app/tickets/[id])
 * so the 422 only ever shows up if that's somehow bypassed.
 */
export async function updateTicketStatus(
  ticketId: string,
  dto: UpdateTicketStatusDTO,
): Promise<TicketView> {
  const ticket = await apiClient.patch<Ticket>(`/tickets/${ticketId}/status`, dto);
  return toTicketView(ticket);
}

/* ------------------------------------------------------------------ */
/*  Attachments — presigned-URL + direct-to-S3 upload                  */
/* ------------------------------------------------------------------ */

export interface PresignedUpload {
  uploadUrl: string;
  fileUrl: string;
}

export async function requestAttachmentUpload(
  dto: RequestAttachmentUploadDTO,
): Promise<PresignedUpload> {
  return apiClient.post<PresignedUpload>("/tickets/attachments/upload-url", dto);
}

/** Real PUT straight to S3 via XHR, so `upload.onprogress` gives real percentages. */
export function uploadToPresignedUrl(
  uploadUrl: string,
  file: File,
  onProgress: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}.`));
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed — check your connection and try again."));
    xhr.onabort = () => reject(new Error("Upload cancelled."));

    xhr.send(file);
  });
}

/* ------------------------------------------------------------------ */
/*  Messages                                                           */
/* ------------------------------------------------------------------ */

export async function listMessages(ticketId: string): Promise<Message[]> {
  return apiClient.get<Message[]>("/messages", { ticketId });
}

/**
 * REST send. The live chat panel (Part 4) sends over the `message:send`
 * socket event instead — the socket handler persists the message itself, so
 * using both here would double-write. This stays for any non-realtime path.
 */
export async function sendMessage(ticketId: string, dto: SendMessageDTO): Promise<Message> {
  return apiClient.post<Message>("/messages", { ticketId, ...dto });
}

export async function markMessageRead(messageId: string): Promise<Message> {
  return apiClient.patch<Message>(`/messages/${messageId}/read`);
}

export async function markAllMessagesRead(ticketId: string): Promise<void> {
  await apiClient.patch<null>("/messages/read-all", { ticketId });
}
