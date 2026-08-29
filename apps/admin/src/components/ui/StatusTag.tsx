import { Tag } from "antd";
import type { TicketStatus } from "@repo/shared";
import { STATUS_META, brutTagStyle } from "../../lib/theme";

/** Ticket status as a bold-bordered saturated Tag. */
export function StatusTag({ status }: { status: TicketStatus }): React.JSX.Element {
  const meta = STATUS_META[status];
  return <Tag style={brutTagStyle(meta.color)}>{meta.label}</Tag>;
}
