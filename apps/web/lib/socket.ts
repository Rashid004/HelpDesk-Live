"use client";

import { io, type Socket } from "socket.io-client";
import type { Message, SendMessageDTO, Ticket } from "@repo/shared";
import { getAccessToken } from "./session";

/**
 * Socket.IO client wrapper — matches the real events the backend emits/
 * accepts (apps/backend/src/realtime/handlers/*.ts), not a guessed set:
 *
 *   client -> server   ticket:join(ticketId, ack)     chat.handler.ts
 *             ticket:leave(ticketId)                  chat.handler.ts
 *             message:send({ticketId,data}, ack)      message.handler.ts
 *             message:read({ticketId,messageId}, ack) message.handler.ts
 *             typing:start(ticketId)                  typing.handler.ts
 *             typing:stop(ticketId)                   typing.handler.ts
 *
 *   server -> client   message:new(message)
 *             message:read(message)
 *             typing:start({ticketId,userId})
 *             typing:stop({ticketId,userId})
 *             ticket:assigned({ticketId,agentId,ticket})   ticket.service.ts
 *
 * One underlying connection is shared by every `createTicketSocket()` call
 * (module-level singleton) — hooks/useTicketMessages.ts owns its lifecycle
 * (connect+join on mount, leave+disconnect on unmount); other hooks like
 * hooks/useTypingIndicator.ts just attach listeners to the same connection.
 */

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:8000";

export interface ServerToClientEvents {
  "message:new": (message: Message) => void;
  "message:read": (message: Message) => void;
  "typing:start": (payload: { ticketId: string; userId: string }) => void;
  "typing:stop": (payload: { ticketId: string; userId: string }) => void;
  "ticket:assigned": (payload: { ticketId: string; agentId: string; ticket: Ticket }) => void;
}

interface ClientToServerEvents {
  "ticket:join": (ticketId: string, ack: (ok: boolean) => void) => void;
  "ticket:leave": (ticketId: string) => void;
  "message:send": (
    payload: { ticketId: string; data: SendMessageDTO },
    ack: (ok: boolean) => void,
  ) => void;
  "message:read": (payload: { ticketId: string; messageId: string }, ack: (ok: boolean) => void) => void;
  "typing:start": (ticketId: string) => void;
  "typing:stop": (ticketId: string) => void;
}

type EventName = keyof ServerToClientEvents;
type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: AppSocket | null = null;

function ensureSocket(): AppSocket {
  // `auth` as a function (not a plain object) is what makes this lazy — it's
  // called fresh on every connect/reconnect attempt, so a token minted by a
  // silent refresh after this module first loaded is still picked up.
  socket ??= io(SOCKET_URL, {
    autoConnect: false,
    auth: (cb) => cb({ token: getAccessToken() }),
  });
  return socket;
}

export interface TicketSocket {
  isConnected(): boolean;
  /** For a "reconnecting…" indicator — fires on every transport connect/disconnect. */
  onConnectionChange(handler: (connected: boolean) => void): () => void;
  /** Resolves false if the server rejected the join (not a real participant). */
  joinTicket(ticketId: string): Promise<boolean>;
  leaveTicket(ticketId: string): void;
  /** Resolves false if the send failed — caller decides how to surface that. */
  sendMessage(ticketId: string, data: SendMessageDTO): Promise<boolean>;
  markRead(ticketId: string, messageId: string): Promise<boolean>;
  emitTyping(ticketId: string, isTyping: boolean): void;
  on<E extends EventName>(event: E, handler: ServerToClientEvents[E]): () => void;
  disconnect(): void;
}

export function createTicketSocket(): TicketSocket {
  const s = ensureSocket();
  if (!s.connected) s.connect();

  return {
    isConnected: () => s.connected,

    onConnectionChange(handler) {
      const onConnect = () => handler(true);
      const onDisconnect = () => handler(false);
      s.on("connect", onConnect);
      s.on("disconnect", onDisconnect);
      return () => {
        s.off("connect", onConnect);
        s.off("disconnect", onDisconnect);
      };
    },

    joinTicket(ticketId) {
      return new Promise((resolve) => {
        s.emit("ticket:join", ticketId, (ok: boolean) => resolve(ok));
      });
    },

    leaveTicket(ticketId) {
      s.emit("ticket:leave", ticketId);
    },

    sendMessage(ticketId, data) {
      return new Promise((resolve) => {
        s.emit("message:send", { ticketId, data }, (ok: boolean) => resolve(ok));
      });
    },

    markRead(ticketId, messageId) {
      return new Promise((resolve) => {
        s.emit("message:read", { ticketId, messageId }, (ok: boolean) => resolve(ok));
      });
    },

    emitTyping(ticketId, isTyping) {
      s.emit(isTyping ? "typing:start" : "typing:stop", ticketId);
    },

    on(event, handler) {
      // TS can't correlate a generic `E` with `ServerToClientEvents[E]`
      // inside this function body (known limitation with dependent generic
      // params) — the public signature above is fully type-checked at every
      // call site, so this cast is just satisfying the implementation.
      s.on(event, handler as never);
      return () => s.off(event, handler as never);
    },

    disconnect() {
      s.disconnect();
    },
  };
}
