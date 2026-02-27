import { BellRing, UserCircle, CheckCircle2, Clock } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { GlassCard } from "../components/ui/shared";

type Notification = {
  id: number;
  student_id: number;
  student_name?: string;
  message: string;
  status: string;
  created_at: string;
};

function statusVariant(status: string) {
  const normalized = String(status || "").toLowerCase();
  if (["sent", "delivered", "opened", "read", "completed"].includes(normalized)) {
    return "success";
  }
  return "pending";
}

export function FacultyDashboardPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadNotifications() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/notifications");
        if (!response.ok) {
          throw new Error("Failed to load notifications");
        }

        const payload = (await response.json()) as Notification[];
        if (mounted) {
          setNotifications(Array.isArray(payload) ? payload : []);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Unable to load data");
          setNotifications([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadNotifications();

    return () => {
      mounted = false;
    };
  }, []);

  const sentCount = useMemo(
    () => notifications.filter((item) => statusVariant(item.status) === "success").length,
    [notifications],
  );

  const pendingCount = Math.max(notifications.length - sentCount, 0);
  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <motion.h1
          className="text-3xl font-bold tracking-tight bg-[linear-gradient(110deg,#4E3A0A_20%,#8B6A13_45%,#C39A2A_50%,#8B6A13_55%,#4E3A0A_80%)] bg-[length:220%_100%] bg-clip-text text-transparent"
          animate={{ backgroundPosition: ["0% 50%", "200% 50%"] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
        >
          Faculty Dashboard
        </motion.h1>
        <p className="text-muted-foreground mt-2">
          Monitor your student communication updates and profile access.
        </p>
      </div>

      {error && (
        <GlassCard className="p-4 border border-red-500/30">
          <p className="text-sm text-red-500">{error}</p>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Sent Notifications</p>
              <h3 className="text-2xl font-bold mt-1">{loading ? "..." : sentCount}</h3>
            </div>
            <CheckCircle2 className="h-8 w-8 text-[#D4AF37]" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Notifications</p>
              <h3 className="text-2xl font-bold mt-1">{loading ? "..." : pendingCount}</h3>
            </div>
            <Clock className="h-8 w-8 text-[#D4AF37]" />
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="p-6 lg:col-span-2" glow>
          <div className="flex items-center gap-2 mb-4">
            <BellRing className="h-5 w-5 text-[#D4AF37]" />
            <h3 className="text-lg font-bold text-[#D4AF37]">Recent Notifications</h3>
          </div>
          <div className="space-y-3">
            {recentNotifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {loading ? "Loading notifications..." : "No notifications yet."}
              </p>
            ) : (
              recentNotifications.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-white/20 bg-white/5 px-4 py-3"
                >
                  <p className="text-sm font-medium">{item.student_name || `Student #${item.student_id}`}</p>
                  <p className="text-sm text-muted-foreground mt-1">{item.message}</p>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <UserCircle className="h-5 w-5 text-[#D4AF37]" />
            <h3 className="text-lg font-bold text-[#D4AF37]">Quick Access</h3>
          </div>
          <div className="space-y-3 text-sm">
            <Link to="/profile" className="block rounded-lg px-3 py-2 bg-white/5 hover:bg-white/10 transition-colors">
              Open Profile
            </Link>
            <Link to="/notifications" className="block rounded-lg px-3 py-2 bg-white/5 hover:bg-white/10 transition-colors">
              View Notifications
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
