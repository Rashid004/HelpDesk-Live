import { useState } from "react";
import { Modal, Typography } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { COLORS } from "../../lib/theme";

const { Text } = Typography;

type ConfirmDeleteModalProps = {
  open: boolean;
  /** Shown in bold in the heading, e.g. "HD-1042". */
  referenceNumber?: string;
  title?: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

/**
 * Bold-styled destructive confirm dialog. Handles its own in-flight
 * state so callers just pass an async onConfirm.
 */
export function ConfirmDeleteModal({
  open,
  referenceNumber,
  title = "Delete ticket",
  description = "This can't be undone.",
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps): React.JSX.Element {
  const [loading, setLoading] = useState(false);

  async function handleOk(): Promise<void> {
    try {
      setLoading(true);
      await onConfirm();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText={confirmLabel}
      cancelText="Cancel"
      confirmLoading={loading}
      okButtonProps={{ danger: true }}
      title={
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ExclamationCircleFilled style={{ color: COLORS.danger }} />
          {title}
          {referenceNumber ? <Text strong>#{referenceNumber}</Text> : null}
        </span>
      }
    >
      <p style={{ margin: 0 }}>{description}</p>
    </Modal>
  );
}
