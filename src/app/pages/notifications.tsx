import { motion } from "motion/react";
import {
  Send,
  Search,
  Clock,
  MessageSquare,
  MoreVertical,
  Mail,
  Smartphone,
  Info,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { GlassCard, GoldButton } from "../components/ui/shared";
import { cn } from "../lib/utils";

type NotificationItem = {
  id: number;
  student_id: number;
  student_name?: string;
  message: string;
  status: string;
  severity?: string;
  created_at: string;
};

function normalizeStatus(status: string) {
  const value = String(status || "").toLowerCase();
  if (["sent", "delivered", "opened", "read", "completed"].includes(value)) return "Delivered";
  if (["failed", "error"].includes(value)) return "Failed";
  return "Pending";
}

export function NotificationCenterPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "critical" | "delivered" | "failed">("all");

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

        const payload = (await response.json()) as NotificationItem[];
        if (mounted) {
          setNotifications(Array.isArray(payload) ? payload : []);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Unable to load notifications");
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

  const todayKey = new Date().toISOString().slice(0, 10);
  const todaysItems = notifications.filter(
    (item) => new Date(item.created_at).toISOString().slice(0, 10) === todayKey
  );
  const deliveredCount = todaysItems.filter((item) => normalizeStatus(item.status) === "Delivered").length;
  const failedCount = todaysItems.filter((item) => normalizeStatus(item.status) === "Failed").length;

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return notifications.filter((item) => {
      if (activeFilter === "critical" && String(item.severity || "").toLowerCase() !== "critical") {
        return false;
      }
      if (activeFilter === "delivered" && normalizeStatus(item.status) !== "Delivered") {
        return false;
      }
      if (activeFilter === "failed" && normalizeStatus(item.status) !== "Failed") {
        return false;
      }

      if (!query) return true;
      return [item.student_name || "", item.message, item.status, item.severity || ""]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [notifications, searchTerm, activeFilter]);

  const gatewayHealth = todaysItems.length
    ? Math.max(0, Math.round(((todaysItems.length - failedCount) / todaysItems.length) * 100))
    : 100;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#D4AF37] tracking-tight">Notification Center</h1>
          <p className="text-muted-foreground">Monitor real-time parent communication history.</p>
        </div>
        <div className="flex items-center gap-3">
          <GoldButton variant="secondary" icon={Clock}>Scheduled</GoldButton>
          <GoldButton icon={Send}>Manual Blast</GoldButton>
        </div>
      </div>

      {error && (
        <GlassCard className="p-4 border border-red-500/30">
          <p className="text-sm text-red-500">{error}</p>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest mb-6 flex items-center gap-2">
              <Info className="h-4 w-4" /> Today's Stats
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Sent</span>
                <span className="font-bold">{todaysItems.length}</span>
              </div>
              <div className="flex items-center justify-between text-green-500">
                <span className="text-sm">Delivered</span>
                <span className="font-bold">{deliveredCount}</span>
              </div>
              <div className="flex items-center justify-between text-red-500">
                <span className="text-sm">Failed</span>
                <span className="font-bold">{failedCount}</span>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
                <Smartphone className="h-5 w-5" />
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase">Delivery Health</p>
                  <p className="text-sm font-medium">{gatewayHealth}%</p>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest mb-4">Quick Filters</h3>
            <div className="space-y-2">
              {[
                { key: "all", label: "All Communications" },
                { key: "critical", label: "Critical Alerts" },
                { key: "delivered", label: "Delivered" },
                { key: "failed", label: "Failed" },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key as typeof activeFilter)}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm rounded-lg transition-all",
                    activeFilter === filter.key
                      ? "bg-[#D4AF37] text-white shadow-lg"
                      : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by student or content..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/5 py-2.5 pl-10 pr-4 outline-none focus:border-[#D4AF37] transition-all"
            />
          </div>

          <div className="space-y-4">
            {loading ? (
              <GlassCard className="p-6">
                <p className="text-sm text-muted-foreground">Loading notifications...</p>
              </GlassCard>
            ) : filteredItems.length === 0 ? (
              <GlassCard className="p-6">
                <p className="text-sm text-muted-foreground">No notifications found for this filter.</p>
              </GlassCard>
            ) : (
              filteredItems.map((item, index) => {
                const status = normalizeStatus(item.status);
                const statusClass =
                  status === "Delivered"
                    ? "bg-green-500/10 text-green-500"
                    : status === "Failed"
                      ? "bg-red-500/10 text-red-500"
                      : "bg-amber-500/10 text-amber-500";

                const Icon = item.message.toLowerCase().includes("mail") ? Mail : Smartphone;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 0.25) }}
                  >
                    <GlassCard className="p-6 hover:border-[#D4AF37]/30 group transition-all">
                      <div className="flex items-start gap-4">
                        <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", status === "Failed" ? "bg-red-500/10 text-red-500" : "bg-[#D4AF37]/10 text-[#D4AF37]")}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-[#D4AF37] flex items-center gap-2">
                              {item.severity ? `${item.severity} Alert` : "Notification"}
                              <span className="text-[10px] text-muted-foreground font-normal">
                                • {new Date(item.created_at).toLocaleString()}
                              </span>
                            </h4>
                            <div className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full", statusClass)}>{status}</div>
                          </div>
                          <p className="text-sm font-medium mb-1 truncate">{item.student_name || `Student #${item.student_id}`}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 italic">"{item.message}"</p>
                        </div>
                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-[#D4AF37]">
                            <MessageSquare className="h-4 w-4" />
                          </button>
                          <button className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-[#D4AF37]">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
