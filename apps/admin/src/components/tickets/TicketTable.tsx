import type { ReactNode } from "react";
import { Table, Button, Space, Avatar, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EyeOutlined, EditOutlined, DeleteOutlined, UserAddOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Ticket } from "@repo/shared";
import { StatusTag } from "../ui/StatusTag";
import { PriorityTag } from "../ui/PriorityTag";
import { CATEGORY_LABELS } from "../../lib/ticketOptions";
import { COLORS } from "../../lib/theme";
import { agentById, customerById } from "../../mocks/users";

type Props = {
  tickets: Ticket[];
  loading?: boolean;
  emptyText?: ReactNode;
  onView: (t: Ticket) => void;
  onEdit: (t: Ticket) => void;
  onDelete: (t: Ticket) => void;
  onAssignToMe: (t: Ticket) => void;
};

function AgentCell({ agentId }: { agentId: string | null }): React.JSX.Element {
  const agent = agentById(agentId);
  if (!agent) return <span style={{ color: COLORS.muted }}>Unassigned</span>;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <Avatar
        size={24}
        src={agent.profileImageUrl}
        style={{ border: `2px solid ${COLORS.ink}`, background: COLORS.brandBlue, fontSize: 12 }}
      >
        {agent.fullName.charAt(0)}
      </Avatar>
      {agent.fullName}
    </span>
  );
}

export function TicketTable({
  tickets,
  loading,
  emptyText,
  onView,
  onEdit,
  onDelete,
  onAssignToMe,
}: Props): React.JSX.Element {
  const columns: ColumnsType<Ticket> = [
    {
      title: "Ref #",
      dataIndex: "referenceNumber",
      width: 96,
      fixed: "left",
      render: (ref: string) => <span style={{ fontWeight: 700 }}>{ref}</span>,
    },
    {
      title: "Title",
      dataIndex: "title",
      ellipsis: true,
      render: (title: string, t) => (
        <button
          type="button"
          onClick={() => onView(t)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            font: "inherit",
            fontWeight: 600,
            textAlign: "left",
            cursor: "pointer",
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          {title}
        </button>
      ),
    },
    {
      title: "Customer",
      dataIndex: "customer",
      width: 150,
      render: (id: string) => customerById(id)?.fullName ?? "—",
    },
    {
      title: "Category",
      dataIndex: "category",
      width: 130,
      render: (c: Ticket["category"]) => CATEGORY_LABELS[c],
    },
    {
      title: "Priority",
      dataIndex: "priority",
      width: 110,
      render: (p: Ticket["priority"]) => <PriorityTag priority={p} />,
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 120,
      render: (s: Ticket["status"]) => <StatusTag status={s} />,
    },
    {
      title: "Agent",
      dataIndex: "agent",
      width: 170,
      render: (agentId: string | null) => <AgentCell agentId={agentId} />,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      width: 120,
      render: (d: Date) => (
        <Tooltip title={dayjs(d).format("DD MMM YYYY, HH:mm")}>{dayjs(d).format("DD MMM")}</Tooltip>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 170,
      fixed: "right",
      render: (_, t) => (
        <Space size={4}>
          <Tooltip title="View">
            <Button size="small" icon={<EyeOutlined />} onClick={() => onView(t)} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(t)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button size="small" danger icon={<DeleteOutlined />} onClick={() => onDelete(t)} />
          </Tooltip>
          {t.agent === null && (
            <Tooltip title="Assign to me">
              <Button
                size="small"
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => onAssignToMe(t)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table<Ticket>
      rowKey="id"
      columns={columns}
      dataSource={tickets}
      loading={loading}
      locale={emptyText ? { emptyText } : undefined}
      scroll={{ x: 1080 }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: [10, 20, 50],
        showTotal: (total) => `${total} ticket${total === 1 ? "" : "s"}`,
      }}
    />
  );
}
