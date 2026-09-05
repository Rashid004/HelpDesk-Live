"use client";

import { useEffect, useRef, useState } from "react";
import { getStoredUser } from "../lib/session";
import { createTicketSocket } from "../lib/socket";

const STOP_TYPING_AFTER_MS = 1500;

interface State {
  /** True while the other participant is typing. */
  peerTyping: boolean;
  /** Call on every input change — debounces the actual typing:start/stop emits. */
  notifyTyping: () => void;
}

/**
 * Rides the same underlying connection hooks/useTicketMessages.ts already
 * connected for this ticket (createTicketSocket() wraps one shared
 * singleton) — this hook only attaches typing listeners and emits, it
 * doesn't connect/join/leave/disconnect on its own.
 */
export function useTypingIndicator(ticketId: string, enabled = true): State {
  const [peerTyping, setPeerTyping] = useState(false);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    const socket = createTicketSocket();
    const me = getStoredUser();

    const offStart = socket.on("typing:start", (payload) => {
      if (payload.ticketId === ticketId && payload.userId !== me?.id) setPeerTyping(true);
    });
    const offStop = socket.on("typing:stop", (payload) => {
      if (payload.ticketId === ticketId && payload.userId !== me?.id) setPeerTyping(false);
    });

    return () => {
      offStart();
      offStop();
      setPeerTyping(false);
    };
  }, [enabled, ticketId]);

  // Stop announcing "typing" if the component unmounts mid-debounce (e.g.
  // navigating away right after typing) instead of leaving a stale
  // indicator lit on the other end.
  useEffect(() => {
    return () => {
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
      if (isTypingRef.current) createTicketSocket().emitTyping(ticketId, false);
    };
  }, [ticketId]);

  function notifyTyping(): void {
    if (!enabled) return;
    const socket = createTicketSocket();
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emitTyping(ticketId, true);
    }
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    stopTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emitTyping(ticketId, false);
    }, STOP_TYPING_AFTER_MS);
  }

  return { peerTyping, notifyTyping };
}
