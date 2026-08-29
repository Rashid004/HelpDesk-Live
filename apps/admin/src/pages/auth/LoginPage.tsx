import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Input, Button, Typography, App } from "antd";
import { loginSchema, type LoginDTO } from "@repo/shared";
import { zodRule } from "../../lib/zodRule";
import { COLORS } from "../../lib/theme";

const { Title, Text } = Typography;

export function LoginPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  async function onFinish(values: LoginDTO): Promise<void> {
    setLoading(true);
    // TODO: replace with real POST /api/auth/login — persist tokens,
    // connect Socket.IO, then navigate.
    await new Promise((r) => setTimeout(r, 600));
    console.log("[auth] login (mock)", values);
    setLoading(false);
    message.success("Signed in");
    navigate("/dashboard");
  }

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <span
          aria-hidden
          style={{
            display: "grid",
            placeItems: "center",
            width: 34,
            height: 34,
            background: COLORS.brandYellow,
            border: `2px solid ${COLORS.ink}`,
            borderRadius: 6,
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 700,
          }}
        >
          H
        </span>
        <Title level={3} style={{ margin: 0 }}>
          Agent Console
        </Title>
      </div>
      <Text style={{ color: COLORS.muted, display: "block", marginBottom: 20 }}>
        Sign in to pick up tickets and chat with customers.
      </Text>

      <Form<LoginDTO> layout="vertical" requiredMark={false} onFinish={onFinish}>
        <Form.Item name="email" label="Email" rules={[zodRule(loginSchema, "email")]}>
          <Input placeholder="you@helpdesklive.io" autoComplete="email" />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[zodRule(loginSchema, "password")]}>
          <Input.Password placeholder="••••••••" autoComplete="current-password" />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={loading} style={{ marginTop: 4 }}>
          Sign in
        </Button>
      </Form>
    </Card>
  );
}
