import {
  Bell,
  Cpu,
  Mail,
  Smartphone,
  Globe,
  Save,
  ChevronRight,
  Database,
} from "lucide-react";
import { useEffect, useState } from "react";
import { GlassCard, GoldButton } from "../components/ui/shared";
import { toast } from "sonner";

type HealthResponse = {
  ok: boolean;
  dbConnected: boolean;
  mode: string;
  dbError?: string | null;
};

const SETTINGS_STORAGE_KEY = "apns.settings";

type SavedSettings = {
  autoClassification: boolean;
  sensitivity: number;
};

export function SettingsPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [autoClassification, setAutoClassification] = useState(true);
  const [sensitivity, setSensitivity] = useState(75);

  useEffect(() => {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SavedSettings;
        setAutoClassification(Boolean(parsed.autoClassification));
        setSensitivity(Number(parsed.sensitivity || 75));
      } catch {
      }
    }

    let mounted = true;
    async function loadHealth() {
      try {
        setLoadingHealth(true);
        const response = await fetch("/api/health");
        if (!response.ok) {
          throw new Error("Unable to fetch health status");
        }

        const payload = (await response.json()) as HealthResponse;
        if (mounted) {
          setHealth(payload);
        }
      } catch {
        if (mounted) {
          setHealth(null);
        }
      } finally {
        if (mounted) {
          setLoadingHealth(false);
        }
      }
    }

    loadHealth();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = () => {
    const payload: SavedSettings = {
      autoClassification,
      sensitivity,
    };

    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(payload));
    toast.success("Settings saved successfully.");
  };

  const smtpStatus = loadingHealth
    ? "Checking"
    : health?.ok
      ? "Connected"
      : "Disconnected";

  const smsStatus = loadingHealth
    ? "Checking"
    : health?.dbConnected
      ? "Connected"
      : "Disconnected";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#D4AF37] tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">Configure AI behavior and monitor live system connectivity.</p>
      </div>

      <div className="space-y-6">
        <GlassCard className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
              <Cpu className="h-6 w-6 text-[#D4AF37]" />
            </div>
            <h3 className="text-xl font-bold">AI Evaluation Engine</h3>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">Auto-classification</p>
                <p className="text-sm text-muted-foreground">Automatically assign severity levels after upload.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={autoClassification}
                  onChange={(event) => setAutoClassification(event.target.checked)}
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]" />
              </label>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Severity Sensitivity</label>
              <input
                type="range"
                className="w-full accent-[#D4AF37]"
                min="0"
                max="100"
                value={sensitivity}
                onChange={(event) => setSensitivity(Number(event.target.value))}
              />
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>Standard</span>
                <span>{sensitivity}%</span>
                <span>Strict</span>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
              <Globe className="h-6 w-6 text-[#D4AF37]" />
            </div>
            <h3 className="text-xl font-bold">Communication Gateways</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#D4AF37]" />
                <span className="font-medium text-sm">Email Gateway</span>
              </div>
              <span className={`text-[10px] font-bold uppercase ${smtpStatus === "Connected" ? "text-green-500" : smtpStatus === "Checking" ? "text-amber-500" : "text-red-500"}`}>
                {smtpStatus}
              </span>
            </div>
            <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-[#D4AF37]" />
                <span className="font-medium text-sm">SMS Gateway</span>
              </div>
              <span className={`text-[10px] font-bold uppercase ${smsStatus === "Connected" ? "text-green-500" : smsStatus === "Checking" ? "text-amber-500" : "text-red-500"}`}>
                {smsStatus}
              </span>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Database className="h-4 w-4 text-[#D4AF37]" />
              <span>Database mode</span>
            </div>
            <span className="font-bold text-[#D4AF37] uppercase">{health?.mode || "unknown"}</span>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
              <Bell className="h-6 w-6 text-[#D4AF37]" />
            </div>
            <h3 className="text-xl font-bold">Smart Templates</h3>
          </div>
          <div className="space-y-4">
            {[
              "Critical Arrear Alert",
              "Semester Performance Report",
              "Attendance Warning",
              "Parent-Teacher Meet Invite",
            ].map((template) => (
              <button key={template} className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 hover:border-[#D4AF37]/30 hover:bg-white/5 transition-all text-left">
                <span className="text-sm font-medium">{template}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </GlassCard>

        <div className="flex justify-end gap-4">
          <button
            className="px-6 py-2 rounded-xl border border-white/20 text-muted-foreground hover:bg-white/10 transition-all font-medium"
            onClick={() => {
              localStorage.removeItem(SETTINGS_STORAGE_KEY);
              setAutoClassification(true);
              setSensitivity(75);
              toast.success("Settings reset to defaults.");
            }}
          >
            Reset
          </button>
          <GoldButton icon={Save} onClick={handleSave}>Save Config</GoldButton>
        </div>
      </div>
    </div>
  );
}
