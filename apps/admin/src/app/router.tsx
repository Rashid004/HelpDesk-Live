import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { TicketListPage } from "../pages/tickets/TicketListPage";
import { TicketDetailPage } from "../pages/tickets/TicketDetailPage";
import { SettingsPage } from "../pages/settings/SettingsPage";
import { LoginPage } from "../pages/auth/LoginPage";

// TODO: replace with a real auth guard once /api/auth is wired — for now
// every route under AppLayout renders regardless of session state.
export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/tickets", element: <TicketListPage /> },
      { path: "/tickets/:id", element: <TicketDetailPage /> },
      { path: "/settings", element: <SettingsPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);
