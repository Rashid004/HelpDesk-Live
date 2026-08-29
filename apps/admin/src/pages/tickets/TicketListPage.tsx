import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, App } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { Ticket } from "@repo/shared";
import { PageHeader } from "../../components/ui/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonPanel } from "../../components/ui/SkeletonPanel";
import { TicketTable } from "../../components/tickets/TicketTable";
import {
  TicketFilters,
  EMPTY_FILTERS,
  type TicketFilterValue,
} from "../../components/tickets/TicketFilters";
import { useTickets } from "../../hooks/useTickets";
import { CURRENT_AGENT } from "../../mocks/users";

export function TicketListPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { tickets, loading, assignTicket } = useTickets();
  const [filters, setFilters] = useState<TicketFilterValue>(EMPTY_FILTERS);

  const filtersDirty = useMemo(
    () => JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS),
    [filters],
  );

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return tickets.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q) && !t.referenceNumber.toLowerCase().includes(q))
        return false;
      if (filters.status && t.status !== filters.status) return false;
      if (filters.category && t.category !== filters.category) return false;
      if (filters.priority && t.priority !== filters.priority) return false;
      return true;
    });
  }, [tickets, filters]);

  const handleAssignToMe = async (t: Ticket) => {
    try {
      await assignTicket(t.id, CURRENT_AGENT.id);
      message.success(`${t.referenceNumber} assigned to you`);
    } catch {
      message.error("Could not assign ticket");
    }
  };

  return (
    <>
      <PageHeader
        title="Tickets"
        subtitle="Every conversation in the queue."
        action={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => message.info("Create ticket — wired in the next step")}
          >
            New Ticket
          </Button>
        }
      />

      <TicketFilters value={filters} onChange={setFilters} />

      {loading && tickets.length === 0 ? (
        <SkeletonPanel rows={8} />
      ) : (
        <TicketTable
          tickets={filtered}
          loading={loading}
          onView={(t) => navigate(`/tickets/${t.id}`)}
          onEdit={() => message.info("Edit ticket — wired in the next step")}
          onDelete={() => message.info("Delete ticket — wired in the next step")}
          onAssignToMe={handleAssignToMe}
          emptyText={
            <EmptyState
              title={filtersDirty ? "No tickets match these filters" : "No tickets yet"}
              description={
                filtersDirty
                  ? "Try loosening the search or clearing a filter."
                  : "New tickets from customers will show up here."
              }
              action={
                filtersDirty ? (
                  <Button onClick={() => setFilters(EMPTY_FILTERS)}>Clear filters</Button>
                ) : undefined
              }
            />
          }
        />
      )}
    </>
  );
}
