/**
 * The single client-side data-access layer.
 *
 * RIGHT NOW: every function resolves mock data after a simulated delay.
 * LATER: swap each body for a real `fetch` to the backend REST API. The
 * signatures and return shapes are already what the components expect, so
 * wiring the backend is an edit inside this file only.
 *
 *   const API_BASE = process.env.NEXT_PUBLIC_API_URL;
 *   const res = await fetch(`${API_BASE}/api/...`, { ... });
 */

import type {
  CreateTicketDTO,
  LoginDTO,
  RateTicketDTO,
  RequestAttachmentUploadDTO,
  SendMessageDTO,
  SignupDTO,
} from "@repo/shared";
import type { User } from "@repo/shared";
import { jitter } from "./delay";
import { http } from "./http";
import type { AuthResult, MessageView, TicketView, UserView } from "./types";
import { mockMessages } from "../mocks/messages";
import { mockTickets } from "../mocks/tickets";
import { currentUser } from "../mocks/users";

/** Deep clone so callers can't mutate the shared mock arrays. */
const clone = <T>(v: T): T => structuredClone(v);

/* ------------------------------------------------------------------ */
/*  Auth — WIRED TO THE REAL BACKEND                                   */
/* ------------------------------------------------------------------ */

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

function toAuthResult(res: AuthResponse): AuthResult {
  const u = res.user;
  const user: UserView = {
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    role: u.role,
  };
  return { user, accessToken: res.accessToken, refreshToken: res.refreshToken };
}

export async function signup(dto: SignupDTO): Promise<AuthResult> {
  // Real call — POST /api/v1/auth/signup (envelope unwrapped by lib/http.ts).
  const data = await http.post<unknown, AuthResponse>("/auth/signup", dto);
  return toAuthResult(data);
}

export async function login(dto: LoginDTO): Promise<AuthResult> {
  // Real call — POST /api/v1/auth/login.
  const data = await http.post<unknown, AuthResponse>("/auth/login", dto);
  return toAuthResult(data);
}

/* ------------------------------------------------------------------ */
/*  Tickets                                                            */
/* ------------------------------------------------------------------ */

export async function listMyTickets(): Promise<TicketView[]> {
  // TODO: replace with real GET /api/tickets?mine=true call
  await jitter(600, 1000);
  return clone(mockTickets);
}

export async function getTicket(id: string): Promise<TicketView | undefined> {
  // TODO: replace with real GET /api/tickets/:id call
  await jitter(500, 900);
  return clone(mockTickets.find((t) => t.id === id));
}

export async function createTicket(dto: CreateTicketDTO): Promise<TicketView> {
  // TODO: replace with real POST /api/tickets call
  console.log("[api.createTicket] payload", dto);
  await jitter();
  const now = new Date();
  return {
    ...dto,
    priority: dto.priority ?? "normal",
    id: `tkt_new_${Math.random().toString(36).slice(2, 8)}`,
    referenceNumber: `HD-${Math.floor(4900 + Math.random() * 99)}`,
    customer: currentUser.id,
    customerName: currentUser.fullName,
    agent: null,
    agentName: null,
    status: "open",
    statusUpdates: [],
    attachments: dto.attachments?.map((a) => ({ ...a, uploadedAt: now })),
    createdAt: now,
    updatedAt: now,
  };
}

export async function rateTicket(
  ticketId: string,
  dto: RateTicketDTO,
): Promise<{ ok: true }> {
  // TODO: replace with real POST /api/tickets/:id/rating call
  console.log("[api.rateTicket]", ticketId, dto);
  await jitter();
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/*  Attachments — presigned-URL + S3 upload flow                       */
/* ------------------------------------------------------------------ */

export interface PresignedUpload {
  uploadUrl: string;
  fileUrl: string;
}

export async function requestAttachmentUpload(
  dto: RequestAttachmentUploadDTO,
): Promise<PresignedUpload> {
  // TODO: replace with real POST /api/uploads/presign call
  console.log("[api.requestAttachmentUpload] payload", dto);
  await jitter(300, 600);
  const key = `mock/${Date.now()}-${dto.fileName}`;
  return {
    uploadUrl: `https://s3.mock.local/${key}?signature=fake`,
    fileUrl: `https://cdn.helpdesk.live/${key}`,
  };
}

/**
 * Simulated PUT to the presigned S3 URL with progress callbacks.
 * TODO: replace with a real `fetch(uploadUrl, { method: 'PUT', body: file })`
 * wrapped in an XHR so `upload.onprogress` gives real percentages.
 */
export function uploadToPresignedUrl(
  uploadUrl: string,
  file: File,
  onProgress: (pct: number) => void,
): Promise<void> {
  console.log("[api.uploadToPresignedUrl]", uploadUrl, file.name, file.size);
  return new Promise((resolve, reject) => {
    let pct = 0;
    const tick = setInterval(() => {
      pct += Math.random() * 22;
      if (pct >= 100) {
        clearInterval(tick);
        onProgress(100);
        // Flip to reject() here to exercise the error UI.
        setTimeout(resolve, 200);
      } else {
        onProgress(Math.round(pct));
      }
    }, 220);
    // Keep a reference to reject on a real abort signal later.
    void reject;
  });
}

/* ------------------------------------------------------------------ */
/*  Messages                                                           */
/* ------------------------------------------------------------------ */

export async function listMessages(ticketId: string): Promise<MessageView[]> {
  // TODO: replace with real GET /api/tickets/:id/messages call
  await jitter(400, 800);
  return clone(mockMessages[ticketId] ?? []);
}

export async function sendMessage(
  ticketId: string,
  dto: SendMessageDTO,
): Promise<MessageView> {
  // TODO: replace with real POST /api/tickets/:id/messages call
  //       (or emit over Socket.IO — see lib/socket.ts)
  console.log("[api.sendMessage]", ticketId, dto);
  await jitter(400, 800);
  return {
    id: `msg_new_${Math.random().toString(36).slice(2, 8)}`,
    ticket: ticketId,
    sender: currentUser.id,
    senderName: currentUser.fullName,
    senderRole: "customer",
    mine: true,
    content: dto.content,
    attachment: dto.attachment,
    readAt: null,
    createdAt: new Date(),
  };
}
