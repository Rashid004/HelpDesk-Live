import { Tag } from "antd";
import type { TicketPriority } from "@repo/shared";
import { PRIORITY_META, brutTagStyle } from "../../lib/theme";

/** Ticket priority as a bold-bordered saturated Tag. */
export function PriorityTag({ priority }: { priority: TicketPriority }): React.JSX.Element {
  const meta = PRIORITY_META[priority];
  return <Tag style={brutTagStyle(meta.color)}>{meta.label}</Tag>;
}
