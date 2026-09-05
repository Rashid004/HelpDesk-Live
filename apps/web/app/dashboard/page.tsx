"use client";

import { ScreenLoader } from "../../components/app/ScreenLoader";
import { TopBar } from "../../components/app/TopBar";
import { EmptyTickets } from "../../components/tickets/EmptyTickets";
import { TicketCard } from "../../components/tickets/TicketCard";
import { Button } from "../../components/ui/Button";
import { FieldError } from "../../components/ui/Field";
import { Pagination } from "../../components/ui/Pagination";
import { TicketCardSkeleton } from "../../components/ui/Skeleton";
import { useAuthGuard } from "../../hooks/useAuthGuard";
import { usePushNotifications } from "../../hooks/usePushNotifications";
import { useSession } from "../../hooks/useSession";
import { useTickets } from "../../hooks/useTickets";

export default function DashboardPage(): React.JSX.Element {
  const { ready } = useAuthGuard("customer");
  const { tickets, pagination, loading, error, page, setPage, reload } = useTickets({}, ready);
  const { user } = useSession();

  usePushNotifications(ready);

  if (!ready || !user) return <ScreenLoader label="Checking your session…" />;

  return (
    <div className="min-h-dvh flex flex-col">
      <TopBar user={user} />

      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-3xl sm:text-4xl font-black">
              Your tickets
            </h1>
            <p className="text-sm text-muted">
              {loading
                ? "Loading your support history…"
                : `${pagination?.total ?? tickets.length} ${(pagination?.total ?? tickets.length) === 1 ? "ticket" : "tickets"} total`}
            </p>
          </div>
        </div>

        {error && (
          <div className="flex flex-col items-start gap-3">
            <FieldError>{error}</FieldError>
            <Button variant="outline" size="sm" onClick={reload}>
              Try again
            </Button>
          </div>
        )}

        {loading && !error && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <TicketCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && !error && tickets.length === 0 && page === 1 && <EmptyTickets />}

        {!loading && !error && tickets.length > 0 && (
          <>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 list-none">
              {tickets.map((t) => (
                <li key={t.id}>
                  <TicketCard ticket={t} />
                </li>
              ))}
            </ul>
            {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
          </>
        )}
      </main>
    </div>
  );
}
