import type { ReactNode } from "react";
import { InboxOutlined } from "@ant-design/icons";
import { COLORS } from "../../lib/theme";

type EmptyStateProps = {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
};

/** Consistent empty/zero-result block: chunky icon chip + copy + action. */
export function EmptyState({
  title,
  description,
  icon = <InboxOutlined />,
  action,
}: EmptyStateProps): React.JSX.Element {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 10,
        padding: "48px 24px",
      }}
    >
      <span
        aria-hidden
        style={{
          display: "grid",
          placeItems: "center",
          width: 56,
          height: 56,
          background: COLORS.brandYellow,
          border: `2px solid ${COLORS.ink}`,
          borderRadius: 6,
          fontSize: 26,
        }}
      >
        {icon}
      </span>
      <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: 18 }}>
        {title}
      </div>
      {description ? (
        <div style={{ color: COLORS.muted, fontSize: 14, maxWidth: 360 }}>{description}</div>
      ) : null}
      {action ? <div style={{ marginTop: 6 }}>{action}</div> : null}
    </div>
  );
}
