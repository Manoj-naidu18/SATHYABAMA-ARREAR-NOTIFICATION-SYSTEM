import {
  User,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  Calendar,
  AlertTriangle,
  FileText,
  History,
  ShieldAlert,
  MessageSquare,
  Send,
  PhoneCall,
} from "lucide-react";
import { GlassCard, GoldButton } from "../components/ui/shared";
import { cn } from "../lib/utils";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";

type StudentProfile = {
  id: number;
  roll_no: string;
  name: string;
  department: string | null;
  semester: number | null;
  email?: string | null;
  phone?: string | null;
  parent_email?: string | null;
  parent_phone?: string | null;
  arrears_count?: number | null;
  photo_url?: string | null;
  created_at?: string;
};

type Notification = {
  id: number;
  message: string;
  status: string;
  created_at: string;
  priority?: string;
};

type AlertAction = {
  id: number;
  channel: string;
  recipient?: string;
  message: string;
  status: string;
  sent_at?: string | null;
  created_at: string;
};

type StudentProfilePayload = {
  student: StudentProfile;
  notifications: Notification[];
  alertActions: AlertAction[];
};

export function StudentProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedRollNo =
    typeof window !== "undefined"
      ? (localStorage.getItem("selectedStudentRollNo") || "").trim()
      : "";
  const effectiveRollNo = (id || selectedRollNo || "").trim();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<StudentProfilePayload | null>(
    null,
  );

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      if (!effectiveRollNo) {
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/students/${encodeURIComponent(effectiveRollNo)}`,
        );
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.detail || "Failed to load student profile");
        }

        const payload = (await response.json()) as StudentProfilePayload;
        if (mounted) {
          setProfileData(payload);
          localStorage.setItem(
            "selectedStudentRollNo",
            payload.student.roll_no || effectiveRollNo,
          );
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Unable to load profile",
          );
          setProfileData(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [effectiveRollNo]);

  const student = profileData?.student;
  const notifications = Array.isArray(profileData?.notifications)
    ? profileData.notifications
    : [];
  const alertActions = Array.isArray(profileData?.alertActions)
    ? profileData.alertActions
    : [];

  const arrearsCount = Number(student?.arrears_count || 0);
  const parentPhone = String(student?.parent_phone || "").trim();
  const parentEmail = String(
    student?.parent_email || student?.email || "",
  ).trim();
  const phoneDigits = parentPhone.replace(/\D/g, "");

  const arrearDetails = useMemo(() => {
    if (arrearsCount < 1) return [];

    return Array.from({ length: arrearsCount }).map((_, index) => {
      const severity =
        arrearsCount > 3 ? "High" : arrearsCount >= 2 ? "Medium" : "Low";
      return {
        subject: `Detected Arrear Subject ${index + 1}`,
        code: `ARR${String(index + 1).padStart(3, "0")}`,
        semester: Number(student?.semester || 1),
        severity,
      };
    });
  }, [arrearsCount, student?.semester]);

  const handleChatWithParent = () => {
    if (!phoneDigits) {
      alert("Parent phone number is not available.");
      return;
    }

    const text = encodeURIComponent(
      `Hello, this is regarding ${student?.name || "student"} (${student?.roll_no || effectiveRollNo}) academic follow-up.`,
    );
    const smsBody = encodeURIComponent(
      `Hello, this is regarding ${student?.name || "student"} (${student?.roll_no || effectiveRollNo}) academic follow-up.`,
    );
    const smsUrl = `sms:${phoneDigits}?body=${smsBody}`;

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = `whatsapp://send?phone=${phoneDigits}&text=${text}`;
      window.setTimeout(() => {
        window.location.href = smsUrl;
      }, 1200);
      return;
    }

    const opened = window.open(
      `https://wa.me/${phoneDigits}?text=${text}`,
      "_blank",
      "noopener,noreferrer",
    );
    if (!opened) {
      window.location.href = smsUrl;
    }
  };

  const handleCallParent = () => {
    if (!phoneDigits && !parentEmail) {
      alert("No parent contact available for call.");
      return;
    }

    const useFreeCall = window.confirm(
      "Press OK for free internet call (Jitsi link). Press Cancel for direct phone call.",
    );

    if (!useFreeCall) {
      if (phoneDigits) {
        window.location.href = `tel:${phoneDigits}`;
      } else {
        alert(
          "Direct phone call is not available. Parent phone number missing.",
        );
      }
      return;
    }

    const room = `apns-${(student?.roll_no || effectiveRollNo || "parent")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")}-${Date.now().toString().slice(-6)}`;
    const jitsiUrl = `https://meet.jit.si/${encodeURIComponent(room)}`;
    const inviteText = `Hello, please join this free parent call for ${student?.name || "student"} (${student?.roll_no || effectiveRollNo}): ${jitsiUrl}`;

    if (phoneDigits) {
      const waUrl = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(inviteText)}`;
      const waWindow = window.open(waUrl, "_blank", "noopener,noreferrer");
      if (!waWindow) {
        window.location.href = `sms:${phoneDigits}?body=${encodeURIComponent(inviteText)}`;
      }
    } else if (parentEmail) {
      const subject = encodeURIComponent(
        `Free Parent Call Link: ${student?.name || "Student"} (${student?.roll_no || effectiveRollNo})`,
      );
      const body = encodeURIComponent(inviteText);
      window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(parentEmail)}&su=${subject}&body=${body}`,
        "_blank",
        "noopener,noreferrer",
      );
    }

    window.open(jitsiUrl, "_blank", "noopener,noreferrer");
  };

  const handleSendAlert = () => {
    const subject = encodeURIComponent(
      `Academic Alert: ${student?.name || "Student"} (${student?.roll_no || effectiveRollNo})`,
    );
    const body = encodeURIComponent(
      `Dear Parent,\n\nThis is an academic alert regarding ${student?.name || "your ward"}.\nCurrent arrear subjects: ${arrearsCount}.\nPlease connect with the department for support.\n\nRegards,\nAcademic Team`,
    );

    if (parentEmail) {
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(parentEmail)}&su=${subject}&body=${body}`;
      window.open(gmailUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (phoneDigits) {
      window.location.href = `sms:${phoneDigits}?body=${body}`;
      return;
    }

    alert("No parent email or phone available to send alert.");
  };

  const handleTwilioCall = async () => {
    if (!phoneDigits) {
      alert("Parent phone number is not available.");
      return;
    }

    try {
      const response = await fetch(`/api/call`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: phoneDigits,
          studentName: student?.name || "Student",
          rollNo: student?.roll_no || effectiveRollNo,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.detail || "Failed to initiate call");
      }

      const result = await response.json();
      alert(`Call initiated successfully to ${phoneDigits}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to initiate call");
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8 text-muted-foreground">
        Loading student profile...
      </div>
    );
  }

  if (!effectiveRollNo) {
    return (
      <div className="max-w-6xl mx-auto p-8 space-y-4">
        <h2 className="text-xl font-bold">No student selected</h2>
        <p className="text-muted-foreground">
          Open Management and click a student to load real profile details.
        </p>
        <GoldButton onClick={() => navigate("/students")}>
          Open Management
        </GoldButton>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="max-w-6xl mx-auto p-8 text-red-500">
        {error || "Student not found"}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <GlassCard className="p-8" glow>
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="relative">
            <div className="h-32 w-32 rounded-2xl bg-[#D4AF37]/10 border-2 border-[#D4AF37]/30 overflow-hidden">
              {student.photo_url ? (
                <img
                  src={student.photo_url}
                  alt={student.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <User className="h-16 w-16 text-[#D4AF37]" />
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {student.name}
                </h1>
                <p className="text-[#D4AF37] font-mono text-sm">
                  {student.roll_no}
                </p>
              </div>
              <div className="flex gap-3">
                <GoldButton
                  variant="secondary"
                  icon={Phone}
                  onClick={handleCallParent}
                >
                  Start Meeting
                </GoldButton>
                <GoldButton
                  variant="secondary"
                  icon={PhoneCall}
                  onClick={handleTwilioCall}
                >
                  Call Parent
                </GoldButton>
                <GoldButton
                  variant="secondary"
                  icon={MessageSquare}
                  onClick={handleChatWithParent}
                >
                  Chat with Parent
                </GoldButton>
                <GoldButton icon={Send} onClick={handleSendAlert}>
                  Send Alert
                </GoldButton>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4 text-[#D4AF37]" />
                <span>{student.department || "Department not specified"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 text-[#D4AF37]" />
                <span>Semester: {student.semester ?? "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-[#D4AF37]" />
                <span>
                  Parent contact: {student.parent_phone || "Not available"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-[#D4AF37]" /> Parent Details
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                  Primary Contact
                </p>
                <p className="font-medium mt-1">Parent / Guardian</p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-[#D4AF37]">
                  <Phone className="h-4 w-4" />
                </div>
                <span>{student.parent_phone || "Not available"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-[#D4AF37]">
                  <Mail className="h-4 w-4" />
                </div>
                <span>{student.parent_email || "Not available"}</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <History className="h-5 w-5 text-[#D4AF37]" /> Notification
              History
            </h3>
            <div className="space-y-4">
              {notifications.length ? (
                notifications.map((log) => (
                  <div
                    key={log.id}
                    className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{log.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 font-bold uppercase">
                      {log.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No notifications found for this student.
                </p>
              )}
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FileText className="h-6 w-6 text-[#D4AF37]" /> Active Arrears
              </h3>
              <div className="px-3 py-1 rounded-full bg-red-500 text-white text-[10px] font-bold uppercase">
                {arrearsCount} Subjects Alert
              </div>
            </div>

            <div className="space-y-4">
              {arrearDetails.length ? (
                arrearDetails.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between group hover:border-[#D4AF37]/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center font-bold",
                          item.severity === "High"
                            ? "bg-red-500/10 text-red-500"
                            : item.severity === "Medium"
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-blue-500/10 text-blue-500",
                        )}
                      >
                        {item.semester}
                      </div>
                      <div>
                        <p className="font-bold">{item.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.code} • Semester {item.semester}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          "text-xs font-bold uppercase tracking-widest",
                          item.severity === "High"
                            ? "text-red-500"
                            : item.severity === "Medium"
                              ? "text-amber-500"
                              : "text-blue-500",
                        )}
                      >
                        {item.severity} Risk
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No active arrears.
                </p>
              )}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h4 className="text-sm font-bold text-[#D4AF37] mb-4 uppercase">
              Recent Message / Call Actions
            </h4>
            {alertActions.length ? (
              <div className="space-y-3">
                {alertActions.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-start justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div>
                      <p className="text-sm font-bold uppercase">
                        {action.channel}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {action.recipient || "No recipient"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {action.message}
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-green-500/10 text-green-500 font-bold uppercase">
                      {action.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No call/mail actions recorded yet.
              </p>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
