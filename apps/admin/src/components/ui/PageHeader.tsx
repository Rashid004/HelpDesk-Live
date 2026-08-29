import type { ReactNode } from "react";
import { Typography } from "antd";

const { Title } = Typography;

type PageHeaderProps = {
  title: string;
  subtitle?: ReactNode;
  /** Optional top-right action, e.g. a "New Ticket" button. */
  action?: ReactNode;
};

/**
 * Shared page title block. Reused across every page so headings,
 * spacing and the action-button slot stay consistent.
 */
export function PageHeader({ title, subtitle, action }: PageHeaderProps): React.JSX.Element {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 20,
      }}
    >
      <div>
        <Title level={2} style={{ margin: 0, fontSize: 26 }}>
          {title}
        </Title>
        {subtitle ? (
          <div style={{ color: "#6B6B6B", marginTop: 4, fontSize: 14 }}>{subtitle}</div>
        ) : null}
      </div>
      {action ? <div style={{ flexShrink: 0 }}>{action}</div> : null}
    </div>
  );
}
