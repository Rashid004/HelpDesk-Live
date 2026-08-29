import type { ReactNode } from "react";
import { Card } from "antd";
import { COLORS } from "../../lib/theme";

type StatCardProps = {
  label: string;
  value: ReactNode;
  /** Small helper line under the value, e.g. "vs. 12 yesterday". */
  hint?: ReactNode;
  icon?: ReactNode;
  /** Accent bar / icon-chip color. Defaults to brand blue. */
  accent?: string;
};

/** Dashboard metric block — bold-bordered, hard shadow via .ant-card. */
export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = COLORS.brandBlue,
}: StatCardProps): React.JSX.Element {
  return (
    <Card styles={{ body: { padding: 18 } }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div className="label-brut" style={{ color: COLORS.muted }}>
            {label}
          </div>
          <div
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 700,
              fontSize: 30,
              lineHeight: 1.1,
              marginTop: 6,
            }}
          >
            {value}
          </div>
          {hint ? (
            <div style={{ color: COLORS.muted, fontSize: 13, marginTop: 4 }}>{hint}</div>
          ) : null}
        </div>
        {icon ? (
          <span
            aria-hidden
            style={{
              display: "grid",
              placeItems: "center",
              width: 40,
              height: 40,
              flexShrink: 0,
              background: accent,
              color: "#fff",
              border: `2px solid ${COLORS.ink}`,
              borderRadius: 6,
              fontSize: 18,
            }}
          >
            {icon}
          </span>
        ) : null}
      </div>
    </Card>
  );
}
