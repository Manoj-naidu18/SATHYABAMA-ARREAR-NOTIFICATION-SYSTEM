import {
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Calendar,
  Download,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { GlassCard, GoldButton } from "../components/ui/shared";
import { apiUrl } from "../lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type Student = {
  id: number;
  department: string | null;
  arrears_count?: number | null;
  created_at?: string;
};

type Notification = {
  id: number;
  status: string;
  created_at: string;
  severity?: string;
};

function toSeverityBucket(arrearsCount: number) {
  if (arrearsCount > 3) return "critical";
  if (arrearsCount >= 2) return "medium";
  if (arrearsCount === 1) return "low";
  return "none";
}

function isSuccessfulStatus(status: string) {
  return ["sent", "delivered", "opened", "read", "completed"].includes(
    String(status || "").toLowerCase()
  );
}

export function AnalyticsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadAnalyticsData() {
      try {
        setLoading(true);
        setError(null);

        const [studentsResponse, notificationsResponse] = await Promise.all([
          fetch(apiUrl("/api/students")),
          fetch(apiUrl("/api/notifications")),
        ]);

        if (!studentsResponse.ok) throw new Error("Failed to load students");
        if (!notificationsResponse.ok) throw new Error("Failed to load notifications");

        const studentsPayload = (await studentsResponse.json()) as Student[];
        const notificationsPayload = (await notificationsResponse.json()) as Notification[];

        if (mounted) {
          setStudents(Array.isArray(studentsPayload) ? studentsPayload : []);
          setNotifications(Array.isArray(notificationsPayload) ? notificationsPayload : []);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Unable to load analytics");
          setStudents([]);
          setNotifications([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadAnalyticsData();

    return () => {
      mounted = false;
    };
  }, []);

  const departmentData = useMemo(() => {
    const grouped = new Map<string, { name: string; critical: number; medium: number; low: number }>();

    students.forEach((student) => {
      const department = student.department || "Unknown";
      if (!grouped.has(department)) {
        grouped.set(department, { name: department, critical: 0, medium: 0, low: 0 });
      }

      const bucket = toSeverityBucket(Number(student.arrears_count || 0));
      const target = grouped.get(department)!;
      if (bucket === "critical") target.critical += 1;
      if (bucket === "medium") target.medium += 1;
      if (bucket === "low") target.low += 1;
    });

    return Array.from(grouped.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [students]);

  const trendData = useMemo(() => {
    const monthMap = new Map<string, { month: string; alerts: number; response: number }>();

    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthMap.set(key, {
        month: date.toLocaleDateString(undefined, { month: "short" }),
        alerts: 0,
        response: 0,
      });
    }

    notifications.forEach((item) => {
      const date = new Date(item.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const row = monthMap.get(key);
      if (!row) return;
      row.alerts += 1;
      if (isSuccessfulStatus(item.status)) {
        row.response += 1;
      }
    });

    return Array.from(monthMap.values());
  }, [notifications]);

  const severityData = useMemo(() => {
    let critical = 0;
    let medium = 0;
    let low = 0;

    students.forEach((student) => {
      const bucket = toSeverityBucket(Number(student.arrears_count || 0));
      if (bucket === "critical") critical += 1;
      if (bucket === "medium") medium += 1;
      if (bucket === "low") low += 1;
    });

    return [
      { name: "Critical", value: critical, color: "#ef4444" },
      { name: "Medium", value: medium, color: "#f59e0b" },
      { name: "Low", value: low, color: "#3b82f6" },
    ];
  }, [students]);

  const totalSeverity = severityData.reduce((sum, item) => sum + item.value, 0);
  const criticalShare = totalSeverity ? Math.round((severityData[0].value / totalSeverity) * 100) : 0;

  const avgArrears = students.length
    ? (
        students.reduce((sum, student) => sum + Number(student.arrears_count || 0), 0) /
        students.length
      ).toFixed(2)
    : "0.00";

  const notificationSuccessRate = notifications.length
    ? Math.round(
        (notifications.filter((item) => isSuccessfulStatus(item.status)).length / notifications.length) * 100
      )
    : 0;

  const highRiskStudents = students.filter((item) => Number(item.arrears_count || 0) > 3).length;
  const highRiskRatio = students.length ? Math.round((highRiskStudents / students.length) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#D4AF37] tracking-tight">System Analytics</h1>
          <p className="text-muted-foreground">Live insights from student and notification data.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10 transition-all">
            <Calendar className="h-4 w-4" /> Last 6 Months
          </button>
          <GoldButton icon={Download}>Export</GoldButton>
        </div>
      </div>

      {error && (
        <GlassCard className="p-4 border border-red-500/30">
          <p className="text-sm text-red-500">{error}</p>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-8 lg:col-span-1">
          <GlassCard className="p-6 h-[400px]" glow>
            <h3 className="text-lg font-bold text-[#D4AF37] mb-6 flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" /> Arrear Severity Ratio
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={severityData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.85)",
                      borderRadius: "12px",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(10px)",
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Critical cases account for <span className="font-bold text-red-500">{criticalShare}%</span> of total arrears.
              </p>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-[#D4AF37] mb-4">Performance KPI</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average Arrears / Student</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{loading ? "..." : avgArrears}</span>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Notification Success Rate</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{loading ? "..." : `${notificationSuccessRate}%`}</span>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">High-Risk Student Ratio</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{loading ? "..." : `${highRiskRatio}%`}</span>
                  <TrendingDown className="h-4 w-4 text-red-500" />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-8 lg:col-span-2">
          <GlassCard className="p-6" glow>
            <h3 className="text-lg font-bold text-[#D4AF37] mb-6 flex items-center gap-2">
              <BarChartIcon className="h-5 w-5" /> Departmental Arrear Analysis
            </h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#717182" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#717182" }} />
                  <Tooltip
                    cursor={{ fill: "rgba(212,175,55,0.05)" }}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.85)",
                      borderRadius: "12px",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(10px)",
                    }}
                  />
                  <Legend verticalAlign="top" height={36} align="right" />
                  <Bar dataKey="critical" name="Critical" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="medium" name="Medium" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="low" name="Low" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-[#D4AF37] mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" /> Parent Outreach Response Trend
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#717182" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#717182" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.85)",
                      borderRadius: "12px",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(10px)",
                    }}
                  />
                  <Legend verticalAlign="top" height={36} align="right" />
                  <Line type="monotone" dataKey="alerts" name="Alerts Sent" stroke="#D4AF37" strokeWidth={3} dot={{ r: 4, fill: "#D4AF37" }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="response" name="Successful Delivery" stroke="#0F766E" strokeWidth={3} dot={{ r: 4, fill: "#0F766E" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
