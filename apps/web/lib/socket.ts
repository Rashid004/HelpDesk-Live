/**
 * Socket.IO client wrapper — STUB.
 *
 * Nothing here opens a real connection yet. It exists so the chat page can
 * import a stable interface now; later this file becomes:
 *
 *   import { io, type Socket } from "socket.io-client";
 *   let socket: Socket | null = null;
 *   export function getSocket() {
 *     socket ??= io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
 *       auth: { token: getAccessToken() },
 *       transports: ["websocket"],
 *     });
 *     return socket;
 *   }
 *
 * Server events we'll wire (see apps/backend/src/realtime): "message:new",
 * "typing:start", "typing:stop", "message:read", "presence:update".
 */

export type SocketEvent =
  | "message:new"
  | "typing:start"
  | "typing:stop"
  | "message:read"
  | "presence:update";

type Handler = (payload: unknown) => void;

export interface TicketSocket {
  joinTicket(ticketId: string): void;
  leaveTicket(ticketId: string): void;
  on(event: SocketEvent, handler: Handler): () => void;
  emitTyping(ticketId: string, isTyping: boolean): void;
  disconnect(): void;
}

/** No-op socket. Swap for a real socket.io-client instance later. */
export function createTicketSocket(): TicketSocket {
  const handlers = new Map<SocketEvent, Set<Handler>>();

  return {
    joinTicket(ticketId) {
      console.log("[socket:stub] joinTicket", ticketId);
      // TODO: socket.emit("ticket:join", { ticketId })
    },
    leaveTicket(ticketId) {
      console.log("[socket:stub] leaveTicket", ticketId);
      // TODO: socket.emit("ticket:leave", { ticketId })
    },
    on(event, handler) {
      // TODO: socket.on(event, handler)
      const set = handlers.get(event) ?? new Set<Handler>();
      set.add(handler);
      handlers.set(event, set);
      return () => set.delete(handler);
    },
    emitTyping(ticketId, isTyping) {
      console.log("[socket:stub] emitTyping", ticketId, isTyping);
      // TODO: socket.emit(isTyping ? "typing:start" : "typing:stop", { ticketId })
    },
    disconnect() {
      console.log("[socket:stub] disconnect");
      handlers.clear();
      // TODO: socket.disconnect()
    },
  };
}
