"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ScreenLoader } from "../../../components/app/ScreenLoader";
import { TopBar } from "../../../components/app/TopBar";
import { AgentClaimPanel } from "../../../components/tickets/AgentClaimPanel";
import { AgentStatusForm } from "../../../components/tickets/AgentStatusForm";
import { RatingWidget } from "../../../components/tickets/RatingWidget";
import { TicketAttachments } from "../../../components/tickets/TicketAttachments";
import { Button } from "../../../components/ui/Button";
import { CategoryBadge, PriorityBadge, StatusBadge } from "../../../components/ui/Badge";
import { Card, CardBody, CardHeader, CardTitle } from "../../../components/ui/Card";
import { FieldError } from "../../../components/ui/Field";
import { Skeleton } from "../../../components/ui/Skeleton";
import { homeFor, useAuthGuard } from "../../../hooks/useAuthGuard";
import { useSession } from "../../../hooks/useSession";
import { useTicket } from "../../../hooks/useTicket";
import { formatDate } from "../../../lib/format";

export default function TicketDetailPage(): React.JSX.Element {
  const { ready } = useAuthGuard();
  const { user } = useSession();
  const { id } = useParams<{ id: string }>();
  const { ticket, loading, error, notFound, reload } = useTicket(id, ready);

  if (!ready || !user) return <ScreenLoader label="Checking your session…" />;

  const isAgent = user.role === "agent";
  const isOwner = !isAgent && ticket?.customer === user.id;
  const isAssignedToMe = isAgent && ticket?.agent === user.id;
  const isUnclaimed = isAgent && ticket?.agent === null;
  const canRate =
    isOwner && (ticket?.status === "resolved" || ticket?.status === "closed");

  return (
    <div className="min-h-dvh flex flex-col">
      <TopBar user={user} />

      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-6">
        <Link href={homeFor(user.role)} className="text-xs font-bold underline underline-offset-4 self-start">
          ← Back to {isAgent ? "queue" : "your tickets"}
        </Link>

        {loading && <DetailSkeleton />}

        {!loading && error && (
          <div className="flex flex-col items-start gap-3">
            <FieldError>{error}</FieldError>
            <Button variant="outline" size="sm" onClick={reload}>
              Try again
            </Button>
          </div>
        )}

        {!loading && !error && notFound && (
          <Card className="text-center flex flex-col items-center gap-3 py-10">
            <h1 className="font-display text-2xl font-black">Ticket not found</h1>
            <p className="text-sm text-muted max-w-sm">
              It may have been removed, or you don&apos;t have access to it.
            </p>
            <Link href={homeFor(user.role)}>
              <Button variant="outline" size="sm">
                Back to {isAgent ? "queue" : "your tickets"}
              </Button>
            </Link>
          </Card>
        )}

        {!loading && !error && ticket && (
          <>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="label-brut">{ticket.referenceNumber}</span>
                <StatusBadge status={ticket.status} />
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-black leading-tight">
                {ticket.title}
              </h1>
              <div className="flex flex-wrap gap-2">
                <CategoryBadge category={ticket.category} />
                <PriorityBadge priority={ticket.priority} />
              </div>
              <p className="text-xs text-muted">
                Opened {formatDate(ticket.createdAt)} · Updated {formatDate(ticket.updatedAt)}
                {isAgent && ticket.customerName ? ` · Customer: ${ticket.customerName}` : ""}
                {!isAgent && ticket.agentName ? ` · Agent: ${ticket.agentName}` : ""}
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[2fr_1fr] items-start">
              <div className="flex flex-col gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
                    {ticket.attachments && <TicketAttachments attachments={ticket.attachments} />}
                  </CardBody>
                </Card>

                {ticket.resolutionNote && (
                  <Card tone="cream">
                    <CardHeader>
                      <CardTitle>Resolution</CardTitle>
                    </CardHeader>
                    <CardBody>
                      <p className="text-sm whitespace-pre-wrap">{ticket.resolutionNote}</p>
                    </CardBody>
                  </Card>
                )}

                <Card tone="cream">
                  <CardHeader>
                    <CardTitle>Conversation</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <p className="text-sm text-muted">
                      Live chat lands here in the next pass — this ticket&apos;s real messages,
                      typing indicator, and read receipts over Socket.IO.
                    </p>
                  </CardBody>
                </Card>
              </div>

              <div className="flex flex-col gap-6">
                {isUnclaimed && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Unassigned</CardTitle>
                    </CardHeader>
                    <CardBody>
                      <AgentClaimPanel ticketId={ticket.id} onClaimed={reload} />
                    </CardBody>
                  </Card>
                )}

                {isAgent && !isUnclaimed && !isAssignedToMe && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Assigned</CardTitle>
                    </CardHeader>
                    <CardBody>
                      <p className="text-sm text-muted">
                        Already claimed by {ticket.agentName || "another agent"}.
                      </p>
                    </CardBody>
                  </Card>
                )}

                {isAssignedToMe && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Update status</CardTitle>
                    </CardHeader>
                    <CardBody>
                      <AgentStatusForm ticket={ticket} onUpdated={reload} />
                    </CardBody>
                  </Card>
                )}

                {canRate && (
                  <Card tone="yellow">
                    <CardHeader>
                      <CardTitle>Rate this resolution</CardTitle>
                    </CardHeader>
                    <CardBody>
                      <RatingWidget ticket={ticket} onRated={reload} />
                    </CardBody>
                  </Card>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function DetailSkeleton(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-5 w-1/3" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}
