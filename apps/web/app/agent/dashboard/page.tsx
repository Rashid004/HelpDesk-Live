"use client";

import { useState } from "react";
import { ScreenLoader } from "../../../components/app/ScreenLoader";
import { EmptyState } from "../../../components/app/EmptyState";
import { TopBar } from "../../../components/app/TopBar";
import { AgentTicketCard } from "../../../components/tickets/AgentTicketCard";
import { Button } from "../../../components/ui/Button";
import { FieldError } from "../../../components/ui/Field";
import { Pagination } from "../../../components/ui/Pagination";
import { TicketCardSkeleton } from "../../../components/ui/Skeleton";
import { Tabs } from "../../../components/ui/Tabs";
import { useAuthGuard } from "../../../hooks/useAuthGuard";
import { useSession } from "../../../hooks/useSession";
import { useTickets } from "../../../hooks/useTickets";

type Scope = "unassigned" | "mine";

export default function AgentDashboardPage(): React.JSX.Element {
  const { ready } = useAuthGuard("agent");
  const { user } = useSession();
  const [scope, setScope] = useState<Scope>("unassigned");

  const queue = useTickets({ unassigned: scope === "unassigned" }, ready && scope === "unassigned");
  const mine = useTickets({ mine: scope === "mine" }, ready && scope === "mine");
  const active = scope === "unassigned" ? queue : mine;

  if (!ready || !user) return <ScreenLoader label="Checking your session…" />;

  function reloadBoth(): void {
    queue.reload();
    mine.reload();
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <TopBar user={user} />

      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl sm:text-4xl font-black">Ticket queue</h1>
          <p className="text-sm text-muted">
            {active.loading
              ? "Loading tickets…"
              : `${active.pagination?.total ?? active.tickets.length} ${(active.pagination?.total ?? active.tickets.length) === 1 ? "ticket" : "tickets"}`}
          </p>
        </div>

        <Tabs
          items={[
            { key: "unassigned", label: "Unassigned queue" },
            { key: "mine", label: "My tickets" },
          ]}
          active={scope}
          onChange={(key) => setScope(key as Scope)}
        />

        {active.error && (
          <div className="flex flex-col items-start gap-3">
            <FieldError>{active.error}</FieldError>
            <Button variant="outline" size="sm" onClick={active.reload}>
              Try again
            </Button>
          </div>
        )}

        {active.loading && !active.error && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <TicketCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!active.loading && !active.error && active.tickets.length === 0 && active.page === 1 && (
          <EmptyState
            icon={scope === "unassigned" ? "📥" : "🗂️"}
            title={scope === "unassigned" ? "Queue is empty" : "Nothing claimed yet"}
            body={
              scope === "unassigned"
                ? "No open tickets are waiting to be claimed right now."
                : "Tickets you assign to yourself show up here."
            }
          />
        )}

        {!active.loading && !active.error && active.tickets.length > 0 && (
          <>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 list-none">
              {active.tickets.map((t) => (
                <li key={t.id}>
                  <AgentTicketCard ticket={t} onClaimed={reloadBoth} />
                </li>
              ))}
            </ul>
            {active.pagination && (
              <Pagination pagination={active.pagination} onPageChange={active.setPage} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
