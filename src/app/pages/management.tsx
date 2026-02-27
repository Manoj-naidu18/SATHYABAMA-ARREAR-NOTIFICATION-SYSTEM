import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  Filter,
  ChevronRight,
  MoreVertical,
  Mail,
  Phone,
  ArrowUpDown,
  FileText,
  SendHorizontal,
} from "lucide-react";
import { GlassCard, GoldButton } from "../components/ui/shared";
import { cn } from "../lib/utils";
import { useNavigate } from "react-router";

type Student = {
  id: number;
  roll_no: string;
  name: string;
  department: string | null;
  semester: number | null;
  created_at: string;
};

export function StudentManagementPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadStudents() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/students");
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error || "Failed to fetch students");
        }

        const data = (await response.json()) as Student[];
        if (isMounted) {
          setStudents(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Unable to load students",
          );
          setStudents([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadStudents();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return students;

    return students.filter((student) =>
      [student.roll_no, student.name, student.department ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [students, searchTerm]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#D4AF37] tracking-tight">
            Student Repository
          </h1>
          <p className="text-muted-foreground">
            Manage student records and monitor parent outreach status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <GoldButton icon={Users} variant="secondary">
            Bulk Import
          </GoldButton>
          <GoldButton icon={SendHorizontal}>Notify All Critical</GoldButton>
        </div>
      </div>

      <GlassCard className="p-4" glow>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by ID, Name or Department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/5 py-2.5 pl-10 pr-4 outline-none focus:border-[#D4AF37] transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10 transition-all">
              <Filter className="h-4 w-4" /> Filter
            </button>
            <button className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10 transition-all">
              <ArrowUpDown className="h-4 w-4" /> Sort
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                <th className="px-4 py-4">Student ID</th>
                <th className="px-4 py-4">Full Name</th>
                <th className="px-4 py-4">Department</th>
                <th className="px-4 py-4">Semester</th>
                <th className="px-4 py-4">Record Status</th>
                <th className="px-4 py-4">Data Source</th>
                <th className="px-4 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && (
                <tr>
                  <td
                    className="px-4 py-6 text-sm text-muted-foreground"
                    colSpan={7}
                  >
                    Loading students...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td className="px-4 py-6 text-sm text-red-500" colSpan={7}>
                    Failed to load students: {error}
                  </td>
                </tr>
              )}

              {!loading && !error && filteredStudents.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-6 text-sm text-muted-foreground"
                    colSpan={7}
                  >
                    No student records found.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="group hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => {
                      localStorage.setItem("selectedStudentRollNo", student.roll_no);
                      navigate(`/profile/${student.roll_no}`);
                    }}
                  >
                    <td className="px-4 py-4 font-mono text-xs text-[#D4AF37]">
                      {student.roll_no}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center font-bold text-[#D4AF37] text-xs">
                          {student.name.charAt(0)}
                        </div>
                        <button
                          type="button"
                          className="font-medium hover:text-[#D4AF37] hover:underline text-left"
                          onClick={(event) => {
                            event.stopPropagation();
                            localStorage.setItem("selectedStudentRollNo", student.roll_no);
                            navigate(`/profile/${student.roll_no}`);
                          }}
                        >
                          {student.name}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {student.department || "-"}
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-bold">
                        {student.semester ?? "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-blue-500 text-white">
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <span className="text-xs text-muted-foreground">
                          PostgreSQL
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-[#D4AF37]/10 rounded-lg text-[#D4AF37]">
                          <Mail className="h-4 w-4" />
                        </button>
                        <button className="p-2 hover:bg-[#D4AF37]/10 rounded-lg text-[#D4AF37]">
                          <Phone className="h-4 w-4" />
                        </button>
                        <button className="p-2 hover:bg-[#D4AF37]/10 rounded-lg text-[#D4AF37]">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-between px-4 py-2 border-t border-white/10">
          <p className="text-xs text-muted-foreground">
            Showing {filteredStudents.length} of {students.length} students
          </p>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 text-xs font-bold border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50"
              disabled
            >
              Previous
            </button>
            <button className="px-3 py-1 text-xs font-bold bg-[#D4AF37] text-white rounded-lg hover:bg-[#D4AF37]/80">
              1
            </button>
            <button className="px-3 py-1 text-xs font-bold border border-white/10 rounded-lg hover:bg-white/10">
              2
            </button>
            <button className="px-3 py-1 text-xs font-bold border border-white/10 rounded-lg hover:bg-white/10">
              3
            </button>
            <button className="px-3 py-1 text-xs font-bold border border-white/10 rounded-lg hover:bg-white/10">
              Next
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
