import { createBrowserRouter, Navigate } from "react-router";
import { AppLayout } from "./components/layout";
import { LoginPage } from "./pages/login";
import { DashboardPage } from "./pages/dashboard";
import { EvaluationPage } from "./pages/evaluation";
import { StudentManagementPage } from "./pages/management";
import { StudentProfilePage } from "./pages/profile";
import { NotificationCenterPage } from "./pages/notifications";
import { AnalyticsPage } from "./pages/analytics";
import { SettingsPage } from "./pages/settings";

function hasAuthenticatedUser() {
  if (typeof window === "undefined") {
    return false;
  }
  return Boolean(localStorage.getItem("apnsUser"));
}

function RequireAuth({ children }: { children: JSX.Element }) {
  if (!hasAuthenticatedUser()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function LoginRoute() {
  if (hasAuthenticatedUser()) {
    return <Navigate to="/dashboard" replace />;
  }
  return <LoginPage />;
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
      { path: "dashboard", Component: DashboardPage },
      { path: "evaluation", Component: EvaluationPage },
      { path: "students", Component: StudentManagementPage },
      { path: "profile", Component: StudentProfilePage },
      { path: "profile/:id", Component: StudentProfilePage },
      { path: "notifications", Component: NotificationCenterPage },
      { path: "analytics", Component: AnalyticsPage },
      { path: "settings", Component: SettingsPage },
      { path: "*", element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);
