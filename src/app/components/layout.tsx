import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Upload,
  Users,
  UserCircle,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Link, useLocation, Outlet, useNavigate } from "react-router";
import { cn } from "../lib/utils";
import { AnimatedBackground } from "./ui/animated-background";

type UserRole = "admin" | "faculty" | "hr";

const adminMenuItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/dashboard",
    theme: "dashboard" as const,
  },
  {
    icon: Upload,
    label: "AI Evaluation",
    path: "/evaluation",
    theme: "upload" as const,
  },
  {
    icon: Users,
    label: "Management",
    path: "/students",
    theme: "dashboard" as const,
  },
  {
    icon: UserCircle,
    label: "Student Profile",
    path: "/profile",
    theme: "profile" as const,
  },
  {
    icon: Bell,
    label: "Notifications",
    path: "/notifications",
    theme: "alert" as const,
  },
  {
    icon: BarChart3,
    label: "Analytics",
    path: "/analytics",
    theme: "analytics" as const,
  },
  {
    icon: Settings,
    label: "Settings",
    path: "/settings",
    theme: "dashboard" as const,
  },
];

const facultyMenuItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/dashboard",
    theme: "dashboard" as const,
  },
  {
    icon: UserCircle,
    label: "Student Profile",
    path: "/profile",
    theme: "profile" as const,
  },
  {
    icon: Bell,
    label: "Notifications",
    path: "/notifications",
    theme: "alert" as const,
  },
];

function getUserRole(): UserRole {
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

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = getUserRole();
  const menuItems = role === "faculty" ? facultyMenuItems : adminMenuItems;
  const currentItem =
    menuItems.find((item) => location.pathname.startsWith(item.path)) ||
    menuItems[0];

  const handleSignOut = () => {
    localStorage.removeItem("apnsUser");
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen">
      <AnimatedBackground type={currentItem.theme} />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-50 h-screen w-64 border-r border-white/20 bg-white/5 backdrop-blur-[20px]">
        <div className="flex h-20 items-center px-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#D4AF37] flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="text-sm font-semibold tracking-tight text-[#D4AF37]">
              SATHYABAMA ARREAR NOTIFICATION SYSTEM
            </span>
          </div>
        </div>

        <nav className="mt-6 flex-1 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300",
                  isActive
                    ? "bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/20"
                    : "text-muted-foreground hover:bg-white/10 hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-white" : "text-[#D4AF37]",
                  )}
                />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute right-2 h-1.5 w-1.5 rounded-full bg-white"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-8 w-full px-4">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all duration-300"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
