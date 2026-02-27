import { motion } from "motion/react";
import {
  Users,
  BellRing,
  AlertTriangle,
  ArrowUpRight,
  MoreVertical,
  CheckCircle2,
  Clock,
  Send,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { GlassCard, GoldButton } from "../components/ui/shared";
import { cn } from "../lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import logoImg from "../../assets/4b35c7bc4c6a88b42d39cda172ff55d3ddce0d64.png";

type Student = {
  id: number;
  roll_no: string;
  name: string;
  department: string | null;
  semester: number | null;
  arrears_count?: number | null;
  created_at: string;
};

type Notification = {
  id: number;
  student_id: number;
  student_name?: string;
  message: string;
  status: string;
  severity?: string;
  sent_at?: string | null;
  created_at: string;
};

function statusVariant(status: string) {
  const normalized = String(status || "").toLowerCase();
  if (["sent", "delivered", "opened", "read", "completed"].includes(normalized)) {
    return "success";
  }
  if (["failed", "error"].includes(normalized)) {
    return "danger";
  }
  return "pending";
}

function timeAgo(value?: string | null) {
  if (!value) return "just now";
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} mins ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs} hrs ago`;
  const days = Math.floor(hrs / 24);
  return `${days} days ago`;
}

export function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [studentsResponse, notificationsResponse] = await Promise.all([
          fetch("/api/students"),
          fetch("/api/notifications"),
        ]);

        if (!studentsResponse.ok) {
          throw new Error("Failed to load students");
        }

        if (!notificationsResponse.ok) {
          throw new Error("Failed to load notifications");
        }

        const studentsPayload = (await studentsResponse.json()) as Student[];
        const notificationsPayload = (await notificationsResponse.json()) as Notification[];

        if (mounted) {
          setStudents(Array.isArray(studentsPayload) ? studentsPayload : []);
          setNotifications(Array.isArray(notificationsPayload) ? notificationsPayload : []);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Unable to load dashboard data");
          setStudents([]);
          setNotifications([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [refreshKey]);

  const totalStudents = students.length;
  const activeArrears = students.filter((student) => Number(student.arrears_count || 0) > 0).length;
  const notificationsSent = notifications.length;
  const deliveredCount = notifications.filter(
    (item) => statusVariant(item.status) === "success"
  ).length;
  const responseRate = notificationsSent ? Math.round((deliveredCount / notificationsSent) * 100) : 0;

  const stats = [
    { label: "Total Students", value: String(totalStudents), icon: Users },
    { label: "Active Arrears", value: String(activeArrears), icon: AlertTriangle },
    { label: "Notifications Sent", value: String(notificationsSent), icon: Send },
    { label: "Delivery Rate", value: `${responseRate}%`, icon: BellRing },
  ];

  const chartData = useMemo(() => {
    const dayMap = new Map<string, { name: string; alerts: number; sent: number }>();

    for (let index = 6; index >= 0; index -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - index);
      const key = date.toISOString().slice(0, 10);
      dayMap.set(key, {
        name: date.toLocaleDateString(undefined, { weekday: "short" }),
        alerts: 0,
        sent: 0,
      });
    }

    notifications.forEach((item) => {
      const key = new Date(item.created_at).toISOString().slice(0, 10);
      const row = dayMap.get(key);
      if (!row) return;
      row.alerts += 1;
      if (statusVariant(item.status) === "success") {
        row.sent += 1;
      }
    });

    return Array.from(dayMap.values());
  }, [notifications]);

  const recentActivity = useMemo(() => {
    return notifications.slice(0, 6).map((item) => {
      const severity = String(item.severity || "low").toLowerCase();
      const normalizedSeverity = severity === "critical" ? "Critical" : severity === "medium" ? "Medium" : "Low";
      return {
        id: item.id,
        student: item.student_name || `Student #${item.student_id}`,
        severity: normalizedSeverity,
        action: item.message || "Notification",
        time: timeAgo(item.created_at),
        status: item.status,
      };
    });
  }, [notifications]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1
            className="text-3xl font-bold tracking-tight bg-[linear-gradient(110deg,#4E3A0A_20%,#8B6A13_45%,#C39A2A_50%,#8B6A13_55%,#4E3A0A_80%)] bg-[length:220%_100%] bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(139,106,19,0.45)]"
            animate={{ backgroundPosition: ["0% 50%", "200% 50%"] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
          >
            Sathyabama Arrear Notification System
          </motion.h1>
          <p className="text-muted-foreground">Live academic risk and parent outreach insights</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-[#D4AF37] hover:bg-white/10 transition-all"
            onClick={() => setRefreshKey((value) => value + 1)}
          >
            Refresh Data
          </button>
          <motion.img
            src={logoImg}
            alt="Sathyabama Arrear Notification logo"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            className="h-28 w-28 cursor-pointer object-contain"
          />
        </div>
      </div>

      {error && (
        <GlassCard className="p-4 border border-red-500/30">
          <p className="text-sm text-red-500">{error}</p>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-[#D4AF37]/10 p-3">
                  <stat.icon className="h-6 w-6 text-[#D4AF37]" />
                </div>
                <div className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-green-500/10 text-green-500">
                  <ArrowUpRight className="h-3 w-3" /> Live
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-1">{loading ? "..." : stat.value}</h3>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard className="p-6" glow>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#D4AF37]">7-Day Notification Trend</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#717182" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#717182" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.85)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(10px)",
                  }}
                />
                <Area type="monotone" dataKey="alerts" stroke="#D4AF37" strokeWidth={2} fillOpacity={1} fill="url(#colorAlerts)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#D4AF37]">Recent Activity</h3>
            <button className="text-xs text-[#D4AF37] hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity available.</p>
            ) : (
              recentActivity.map((activity) => {
                const variant = statusVariant(activity.status);
                return (
                  <div key={activity.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/10">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center",
                        activity.severity === "Critical"
                          ? "bg-red-500/10"
                          : activity.severity === "Medium"
                            ? "bg-amber-500/10"
                            : "bg-blue-500/10"
                      )}
                    >
                      {variant === "success" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : variant === "danger" ? (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      ) : variant === "pending" ? (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Send className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{activity.student}</p>
                      <p className="text-xs text-muted-foreground truncate">{activity.action}</p>
                      <p className="text-[11px] text-muted-foreground">{activity.time}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full",
                          activity.severity === "Critical"
                            ? "bg-red-500 text-white"
                            : activity.severity === "Medium"
                              ? "bg-amber-500 text-white"
                              : "bg-blue-500 text-white"
                        )}
                      >
                        {activity.severity}
                      </div>
                      <button className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
