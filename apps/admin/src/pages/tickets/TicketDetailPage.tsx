import { useParams } from "react-router-dom";
import { PageHeader } from "../../components/ui/PageHeader";

export function TicketDetailPage(): React.JSX.Element {
  const { id } = useParams();
  return (
    <>
      <PageHeader title="Ticket detail" subtitle={`Ticket ${id}`} />
      {/* Info card + chat panel land in step 6. */}
      <p style={{ color: "#6B6B6B" }}>Ticket detail coming soon.</p>
    </>
  );
}
