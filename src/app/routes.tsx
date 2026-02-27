import { createBrowserRouter, Navigate } from "react-router";
import { AppLayout } from "./components/layout";
import { LoginPage } from "./pages/login";
import { DashboardPage } from "./pages/dashboard";
import { FacultyDashboardPage } from "./pages/faculty-dashboard";
import { EvaluationPage } from "./pages/evaluation";
import { StudentManagementPage } from "./pages/management";
import { StudentProfilePage } from "./pages/profile";
import { NotificationCenterPage } from "./pages/notifications";
import { AnalyticsPage } from "./pages/analytics";
import { SettingsPage } from "./pages/settings";

type UserRole = "admin" | "faculty" | "hr";

function hasAuthenticatedUser() {
  if (typeof window === "undefined") {
    return false;
  }
  return Boolean(localStorage.getItem("apnsUser"));
}

function getUserRole(): UserRole {
  if (typeof window === "undefined") {
    return "admin";
  }

  const userRaw = localStorage.getItem("apnsUser");
  if (!userRaw) {
    return "admin";
  }

  try {
    const parsed = JSON.parse(userRaw) as { role?: string };
    if (parsed.role === "faculty") {
      return "faculty";
    }
    if (parsed.role === "hr") {
      return "hr";
    }
  } catch {
    return "admin";
  }

  return "admin";
}

function RequireAuth({ children }: { children: JSX.Element }) {
  if (!hasAuthenticatedUser()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function RequireAdmin({ children }: { children: JSX.Element }) {
  if (!hasAuthenticatedUser()) {
    return <Navigate to="/login" replace />;
  }

  const role = getUserRole();
  if (role === "faculty") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function LoginRoute() {
  if (hasAuthenticatedUser()) {
    return <Navigate to="/dashboard" replace />;
  }
  return <LoginPage />;
}

function RoleDashboardRoute() {
  const role = getUserRole();
  if (role === "faculty") {
    return <FacultyDashboardPage />;
  }
  return <DashboardPage />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Navigate
        to={hasAuthenticatedUser() ? "/dashboard" : "/login"}
        replace
      />
    ),
  },
  {
    path: "/login",
    element: <LoginRoute />,
  },
  {
    path: "/",
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { path: "dashboard", element: <RoleDashboardRoute /> },
      {
        path: "evaluation",
        element: (
          <RequireAdmin>
            <EvaluationPage />
          </RequireAdmin>
        ),
      },
      {
        path: "students",
        element: (
          <RequireAdmin>
            <StudentManagementPage />
          </RequireAdmin>
        ),
      },
      { path: "profile", Component: StudentProfilePage },
      { path: "profile/:id", Component: StudentProfilePage },
      { path: "notifications", Component: NotificationCenterPage },
      {
        path: "analytics",
        element: (
          <RequireAdmin>
            <AnalyticsPage />
          </RequireAdmin>
        ),
      },
      {
        path: "settings",
        element: (
          <RequireAdmin>
            <SettingsPage />
          </RequireAdmin>
        ),
      },
      { path: "*", element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);
