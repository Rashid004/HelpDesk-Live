"use client";

import type { Message } from "@repo/shared";
import { useCallback, useEffect, useRef, useState } from "react";
import { listMessages } from "../lib/api";
import { getStoredUser } from "../lib/session";
import { createTicketSocket, type TicketSocket } from "../lib/socket";

export type MessageSendStatus = "sent" | "sending" | "failed";

export interface ChatMessage extends Message {
  status: MessageSendStatus;
  /** Only set on an optimistic message, before the server echo replaces it. */
  clientId?: string;
}

interface State {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  /** Live socket transport state — drives a "reconnecting…" indicator. */
  connected: boolean;
  send: (content: string) => Promise<void>;
  retry: (clientId: string) => void;
  reload: () => void;
}

/**
 * Owns the chat connection's lifecycle for one ticket: fetches history over
 * REST, connects + joins the Socket.IO room, listens for message:new/read,
 * and leaves + disconnects on unmount. hooks/useTypingIndicator.ts rides the
 * same underlying connection (createTicketSocket() is a shared singleton)
 * without managing any of that itself.
 */
export function useTicketMessages(ticketId: string, enabled = true): State {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<TicketSocket | null>(null);

  /**
   * Marks each unread message from the other participant as read — one
   * `message:read` emit per message, not the REST bulk endpoint
   * (PATCH /messages/read-all). That REST route never broadcasts anything
   * (see message.service.ts's markAllReadForTicket vs. the socket handler
   * in message.handler.ts), so a sender would never see a live "Read"
   * update from it — only the socket event actually round-trips back to
   * everyone in the room, including the sender.
   */
  const markUnreadFromPeer = useCallback(
    (list: Message[]) => {
      const socket = socketRef.current;
      const me = getStoredUser();
      if (!socket) return;
      for (const m of list) {
        if (m.sender !== me?.id && !m.readAt) {
          void socket.markRead(ticketId, m.id);
        }
      }
    },
    [ticketId],
  );

  const loadHistory = useCallback(() => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    listMessages(ticketId)
      .then((list) => {
        setMessages(list.map((m) => ({ ...m, status: "sent" as const })));
        markUnreadFromPeer(list);
      })
      .catch(() => setError("We couldn't load the conversation. Please try again."))
      .finally(() => setLoading(false));
  }, [enabled, ticketId, markUnreadFromPeer]);

  useEffect(() => {
    if (!enabled) return;
    loadHistory();

    const socket = createTicketSocket();
    socketRef.current = socket;
    let cancelled = false;
    let hasConnectedOnce = false;

    function joinRoom(): void {
      socket.joinTicket(ticketId).then((ok) => {
        if (!cancelled && !ok) setError("You don't have access to this conversation.");
      });
    }

    const offConnChange = socket.onConnectionChange((isConnected) => {
      if (cancelled) return;
      setConnected(isConnected);
      if (isConnected) {
        if (hasConnectedOnce) {
          // Reconnected after a drop — the server doesn't remember our room
          // membership, so re-join and quietly catch up on anything sent
          // while we were offline.
          joinRoom();
          loadHistory();
        } else {
          hasConnectedOnce = true;
          joinRoom();
        }
      }
    });

    const offNew = socket.on("message:new", (message) => {
      if (cancelled) return;
      const me = getStoredUser();

      // Pure updater — React (in StrictMode dev) invokes setState updaters
      // twice to catch impure ones, so this must not mutate anything
      // outside `prev`. The reconciliation target is derived from `prev`
      // itself: the oldest still-"sending" bubble of mine. An earlier
      // version tracked "pending" ids in a ref and `.shift()`ed it from
      // inside this updater — the double-invoke silently consumed the ref
      // on the first (discarded) call, so the second (committed) call
      // always missed and appended a duplicate bubble instead of resolving
      // the optimistic one.
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;

        if (message.sender === me?.id) {
          const idx = prev.findIndex((m) => m.clientId && m.status === "sending");
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = { ...message, status: "sent" };
            return next;
          }
        }
        return [...prev, { ...message, status: "sent" }];
      });

      markUnreadFromPeer([message]);
    });

    const offRead = socket.on("message:read", (message) => {
      if (cancelled) return;
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? { ...m, readAt: message.readAt } : m)),
      );
    });

    return () => {
      cancelled = true;
      offConnChange();
      offNew();
      offRead();
      socket.leaveTicket(ticketId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled, ticketId, loadHistory, markUnreadFromPeer]);

  const send = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      const socket = socketRef.current;
      if (!socket || !trimmed) return;

      const me = getStoredUser();
      const clientId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const optimistic: ChatMessage = {
        id: clientId,
        clientId,
        ticket: ticketId,
        sender: me?.id ?? "",
        senderName: me?.fullName,
        senderRole: me?.role,
        content: trimmed,
        readAt: null,
        createdAt: new Date(),
        status: "sending",
      };
      setMessages((prev) => [...prev, optimistic]);

      const ok = await socket.sendMessage(ticketId, { content: trimmed });
      if (!ok) {
        setMessages((prev) =>
          prev.map((m) => (m.clientId === clientId ? { ...m, status: "failed" } : m)),
        );
        return;
      }
      // The server emits the "message:new" broadcast before it acks
      // (see message.handler.ts), and both travel the same socket, so it
      // should already have resolved this bubble by now. This is just a
      // defensive fallback in case that ordering ever doesn't hold — don't
      // leave a genuinely-sent message stuck showing "sending…" forever.
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.clientId === clientId && m.status === "sending" ? { ...m, status: "sent" } : m,
          ),
        );
      }, 5000);
    },
    [ticketId],
  );

  const retry = useCallback(
    (clientId: string) => {
      const target = messages.find((m) => m.clientId === clientId);
      if (!target?.content) return;
      setMessages((prev) => prev.filter((m) => m.clientId !== clientId));
      void send(target.content);
    },
    [messages, send],
  );

  return { messages, loading, error, connected, send, retry, reload: loadHistory };
}
