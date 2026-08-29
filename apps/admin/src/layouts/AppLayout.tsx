import { useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Layout,
  Menu,
  Button,
  Badge,
  Dropdown,
  Avatar,
  Grid,
  Drawer,
  Typography,
} from "antd";
import type { MenuProps } from "antd";
import {
  DashboardOutlined,
  TagsOutlined,
  TeamOutlined,
  SettingOutlined,
  BellOutlined,
  MenuOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { COLORS } from "../lib/theme";
import { CURRENT_AGENT, MOCK_UNREAD_NOTIFICATIONS } from "../mocks/users";

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const NAV_ITEMS: MenuProps["items"] = [
  { key: "/dashboard", icon: <DashboardOutlined />, label: <Link to="/dashboard">Dashboard</Link> },
  { key: "/tickets", icon: <TagsOutlined />, label: <Link to="/tickets">Tickets</Link> },
  { key: "/customers", icon: <TeamOutlined />, label: <Link to="/customers">Customers</Link> },
  { key: "/settings", icon: <SettingOutlined />, label: <Link to="/settings">Settings</Link> },
];

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/tickets": "Tickets",
  "/customers": "Customers",
  "/settings": "Settings",
};

function Brand({ compact }: { compact?: boolean }): React.JSX.Element {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: compact ? "18px 0" : "18px 20px",
        justifyContent: compact ? "center" : "flex-start",
      }}
    >
      <span
        aria-hidden
        style={{
          display: "grid",
          placeItems: "center",
          width: 34,
          height: 34,
          flexShrink: 0,
          background: COLORS.brandYellow,
          border: `2px solid ${COLORS.ink}`,
          borderRadius: 6,
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: 700,
          fontSize: 18,
        }}
      >
        H
      </span>
      {!compact && (
        <span
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: "-0.02em",
            whiteSpace: "nowrap",
          }}
        >
          HelpDesk Live
        </span>
      )}
    </div>
  );
}

export function AppLayout(): React.JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.lg;

  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Highlight the nav item whose key prefixes the current path
  // (so /tickets/:id keeps "Tickets" active).
  const selectedKey = useMemo(() => {
    const match = (NAV_ITEMS ?? []).find(
      (item) => item && location.pathname.startsWith(String(item.key)),
    );
    return match ? String(match.key) : location.pathname;
  }, [location.pathname]);

  const pageTitle = PAGE_TITLES[selectedKey] ?? "HelpDesk Live";

  const userMenu: MenuProps["items"] = [
    { key: "profile", icon: <UserOutlined />, label: "Profile" },
    { key: "settings", icon: <SettingOutlined />, label: "Settings" },
    { type: "divider" },
    { key: "logout", icon: <LogoutOutlined />, label: "Logout", danger: true },
  ];

  const onUserMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "settings" || key === "profile") navigate("/settings");
    // TODO: replace with real logout — clear tokens, disconnect socket,
    // redirect to /login.
    if (key === "logout") console.log("[auth] logout (mock)");
  };

  const navMenu = (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      items={NAV_ITEMS}
      style={{ borderInlineEnd: "none", background: "transparent", padding: "0 12px" }}
      onClick={() => isMobile && setDrawerOpen(false)}
    />
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {!isMobile && (
        <Sider
          theme="light"
          width={230}
          collapsedWidth={72}
          collapsed={collapsed}
          style={{
            borderRight: `2px solid ${COLORS.ink}`,
            display: "flex",
            flexDirection: "column",
            position: "sticky",
            top: 0,
            height: "100vh",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Brand compact={collapsed} />
            <div style={{ flex: 1, overflowY: "auto" }}>{navMenu}</div>
            <div style={{ borderTop: `2px solid ${COLORS.ink}`, padding: 12 }}>
              <Button
                block
                onClick={() => setCollapsed((c) => !c)}
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              >
                {!collapsed && "Collapse"}
              </Button>
            </div>
          </div>
        </Sider>
      )}

      {isMobile && (
        <Drawer
          open={drawerOpen}
          placement="left"
          width={250}
          onClose={() => setDrawerOpen(false)}
          closable={false}
          styles={{ body: { padding: 0 } }}
        >
          <Brand />
          {navMenu}
        </Drawer>
      )}

      <Layout>
        <Header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `2px solid ${COLORS.ink}`,
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {isMobile && (
              <Button
                aria-label="Open navigation"
                icon={<MenuOutlined />}
                onClick={() => setDrawerOpen(true)}
              />
            )}
            <Typography.Title level={4} style={{ margin: 0, fontSize: 18 }}>
              {pageTitle}
            </Typography.Title>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Badge count={MOCK_UNREAD_NOTIFICATIONS} size="small" color={COLORS.brandPink}>
              {/* TODO: replace with real notifications feed (Socket.IO + REST). */}
              <Button aria-label="Notifications" icon={<BellOutlined />} />
            </Badge>

            <Dropdown
              menu={{ items: userMenu, onClick: onUserMenuClick }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <button
                type="button"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <Avatar
                  src={CURRENT_AGENT.profileImageUrl}
                  style={{ border: `2px solid ${COLORS.ink}`, background: COLORS.brandBlue }}
                >
                  {CURRENT_AGENT.fullName.charAt(0)}
                </Avatar>
                {!isMobile && (
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{CURRENT_AGENT.fullName}</span>
                )}
              </button>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ padding: "24px clamp(16px, 4vw, 40px)" }}>
          <div style={{ maxWidth: 1240, margin: "0 auto" }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
