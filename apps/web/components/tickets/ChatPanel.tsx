"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "../../hooks/useTicketMessages";
import { useTicketMessages } from "../../hooks/useTicketMessages";
import { useTypingIndicator } from "../../hooks/useTypingIndicator";
import { formatTime } from "../../lib/format";
import { getStoredUser } from "../../lib/session";
import { Button } from "../ui/Button";
import { FieldError } from "../ui/Field";
import { Skeleton } from "../ui/Skeleton";
import { Textarea } from "../ui/Textarea";

export function ChatPanel({
  ticketId,
  peerLabel,
}: {
  ticketId: string;
  /** "Agent" or "Customer" — whichever role the other participant plays. */
  peerLabel: string;
}): React.JSX.Element {
  const { messages, loading, error, connected, send, retry, reload } = useTicketMessages(ticketId);
  const { peerTyping, notifyTyping } = useTypingIndicator(ticketId);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const me = getStoredUser();

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length]);

  async function handleSend(): Promise<void> {
    const content = draft.trim();
    if (!content || sending) return;
    setDraft("");
    setSending(true);
    try {
      await send(content);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {!connected && (
        <div className="flex items-center gap-2 border-2 border-ink rounded-brut bg-status-open px-3 py-2 text-xs font-bold">
          <span
            aria-hidden
            className="size-3 rounded-full border-2 border-ink animate-pulse bg-paper"
          />
          Reconnecting…
        </div>
      )}

      {error && (
        <div className="flex flex-col items-start gap-2">
          <FieldError>{error}</FieldError>
          <Button variant="outline" size="sm" onClick={reload}>
            Try again
          </Button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-14 w-2/3" />
          <Skeleton className="h-14 w-1/2 self-end" />
          <Skeleton className="h-14 w-3/5" />
        </div>
      )}

      {!loading && !error && (
        <>
          <div
            ref={listRef}
            className="flex flex-col gap-3 max-h-96 overflow-y-auto border-2 border-ink rounded-brut bg-paper p-3"
          >
            {messages.length === 0 && (
              <p className="text-sm text-muted text-center py-6">
                No messages yet — say hello.
              </p>
            )}
            {messages.map((m) => (
              <MessageBubble key={m.clientId ?? m.id} message={m} mine={m.sender === me?.id} onRetry={retry} />
            ))}
          </div>

          {/* Reserved height so the typing indicator doesn't shift the layout. */}
          <div className="h-5 text-xs font-bold text-muted px-1">
            {peerTyping ? `${peerLabel} is typing…` : ""}
          </div>

          <div className="flex items-end gap-3">
            <Textarea
              rows={2}
              placeholder="Type a message…"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                notifyTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!draft.trim() || !connected} loading={sending}>
              Send
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function MessageBubble({
  message,
  mine,
  onRetry,
}: {
  message: ChatMessage;
  mine: boolean;
  onRetry: (clientId: string) => void;
}): React.JSX.Element {
  return (
    <div className={mine ? "flex flex-col items-end" : "flex flex-col items-start"}>
      <div
        className={
          "max-w-[80%] border-2 border-ink rounded-brut px-3 py-2 shadow-brut-sm " +
          (mine ? "bg-brand-yellow text-ink" : "bg-cream text-ink")
        }
      >
        {!mine && message.senderName && (
          <p className="text-[10px] font-black uppercase tracking-wide mb-0.5">
            {message.senderName}
          </p>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
      </div>
      <div className="flex items-center gap-1.5 mt-1 px-1">
        <span className="text-[10px] text-muted">{formatTime(message.createdAt)}</span>
        {mine && message.status === "sending" && (
          <span className="text-[10px] text-muted">Sending…</span>
        )}
        {mine && message.status === "failed" && message.clientId && (
          <button
            type="button"
            onClick={() => onRetry(message.clientId!)}
            className="text-[10px] font-bold text-danger underline underline-offset-2"
          >
            Failed — retry
          </button>
        )}
        {mine && message.status === "sent" && message.readAt && (
          <span className="text-[10px] text-muted">Read</span>
        )}
      </div>
    </div>
  );
}
