import { Input, Select, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { TicketCategory, TicketPriority, TicketStatus } from "@repo/shared";
import {
  CATEGORY_OPTIONS,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
} from "../../lib/ticketOptions";

export type TicketFilterValue = {
  search: string;
  status: TicketStatus | null;
  category: TicketCategory | null;
  priority: TicketPriority | null;
};

export const EMPTY_FILTERS: TicketFilterValue = {
  search: "",
  status: null,
  category: null,
  priority: null,
};

type Props = {
  value: TicketFilterValue;
  onChange: (next: TicketFilterValue) => void;
};

/** Client-side filter bar above the ticket table. */
export function TicketFilters({ value, onChange }: Props): React.JSX.Element {
  const set = <K extends keyof TicketFilterValue>(key: K, v: TicketFilterValue[K]) =>
    onChange({ ...value, [key]: v });

  const dirty =
    value.search !== "" ||
    value.status !== null ||
    value.category !== null ||
    value.priority !== null;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 16,
        alignItems: "center",
      }}
    >
      <Input
        allowClear
        prefix={<SearchOutlined />}
        placeholder="Search title or reference #"
        value={value.search}
        onChange={(e) => set("search", e.target.value)}
        style={{ width: 260, maxWidth: "100%" }}
      />
      <Select
        allowClear
        placeholder="Status"
        options={STATUS_OPTIONS}
        value={value.status}
        onChange={(v) => set("status", v ?? null)}
        style={{ width: 150 }}
      />
      <Select
        allowClear
        placeholder="Category"
        options={CATEGORY_OPTIONS}
        value={value.category}
        onChange={(v) => set("category", v ?? null)}
        style={{ width: 160 }}
      />
      <Select
        allowClear
        placeholder="Priority"
        options={PRIORITY_OPTIONS}
        value={value.priority}
        onChange={(v) => set("priority", v ?? null)}
        style={{ width: 140 }}
      />
      {dirty && (
        <Button type="text" onClick={() => onChange(EMPTY_FILTERS)}>
          Clear
        </Button>
      )}
    </div>
  );
}
