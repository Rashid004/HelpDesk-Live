import { PageHeader } from "../../components/ui/PageHeader";

export function DashboardPage(): React.JSX.Element {
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Queue health at a glance." />
      {/* Stat cards + recent activity land in step 7. */}
      <p style={{ color: "#6B6B6B" }}>Dashboard content coming soon.</p>
    </>
  );
}
