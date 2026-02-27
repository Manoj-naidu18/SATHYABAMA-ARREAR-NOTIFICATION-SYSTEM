import { motion, AnimatePresence } from "motion/react";
import { 
  FileUp, 
  Cpu, 
  Search, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  FileText,
  Loader2,
  BrainCircuit,
  Settings2
} from "lucide-react";
import { useEffect, useState } from "react";
import { GlassCard, GoldButton } from "../components/ui/shared";
import { toast } from "sonner";

type EvaluationResult = {
  fileName: string;
  processedRecords: number;
  alerts: {
    critical: number;
    medium: number;
    low: number;
  };
  confidence: number;
  model: string;
  summary: string;
  topFindings: string[];
  usedAI: boolean;
};

export function EvaluationPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [history, setHistory] = useState<EvaluationResult[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("apns.evaluation.history");
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as EvaluationResult[];
      if (Array.isArray(parsed)) {
        setHistory(parsed);
      }
    } catch {
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) {
      toast.error("Please select a student record file first.");
      return;
    }
    
    setIsProcessing(true);
    setEvaluationResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/evaluation/analyze-document", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let message = "Failed to analyze document";
        try {
          const payload = await response.json();
          message = payload.detail || payload.message || message;
        } catch {
          message = "Failed to analyze document";
        }
        throw new Error(message);
      }

      const payload = (await response.json()) as EvaluationResult;
      setEvaluationResult(payload);
      setHistory((prev) => {
        const next = [payload, ...prev].slice(0, 5);
        localStorage.setItem("apns.evaluation.history", JSON.stringify(next));
        return next;
      });
      setIsProcessing(false);
      setIsCompleted(true);
      toast.success(
        payload.usedAI
          ? "AI analysis completed successfully."
          : "Analysis completed using fallback engine (AI service unavailable)."
      );
    } catch (error) {
      setIsProcessing(false);
      toast.error(error instanceof Error ? error.message : "Unable to process file");
    }
  };

  const totalAlerts = evaluationResult
    ? evaluationResult.alerts.critical + evaluationResult.alerts.medium + evaluationResult.alerts.low
    : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#D4AF37] tracking-tight">AI Arrear Evaluation</h1>
          <p className="text-muted-foreground">Automatic severity classification based on university norms.</p>
        </div>
        <GoldButton icon={Settings2} variant="secondary">Processing Rules</GoldButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-2 space-y-8">
          <GlassCard className="p-12 text-center" glow>
            {!isProcessing && !isCompleted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="mx-auto w-24 h-24 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-6">
                  <FileUp className="h-12 w-12 text-[#D4AF37]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#D4AF37]">Upload Semester Data</h2>
                  <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                    Drag and drop your student records (CSV/XLSX) or browse to begin AI evaluation.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer px-8 py-3 rounded-xl border-2 border-dashed border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 transition-all text-[#D4AF37] font-bold"
                  >
                    {selectedFile ? selectedFile.name : "Select Document"}
                  </label>
                  {selectedFile && (
                    <GoldButton icon={Cpu} onClick={handleStartAnalysis} className="px-12">
                      Start AI Processing
                    </GoldButton>
                  )}
                </div>
              </motion.div>
            ) : isProcessing ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8 py-8"
              >
                <div className="relative mx-auto w-32 h-32">
                  <div className="absolute inset-0 rounded-full border-4 border-[#D4AF37]/20 border-t-[#D4AF37] animate-spin" />
                  <div className="absolute inset-4 rounded-full border-4 border-[#D4AF37]/10 border-b-[#D4AF37] animate-spin-slow" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BrainCircuit className="h-10 w-10 text-[#D4AF37] animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#D4AF37]">Evaluating Student Records...</h3>
                  <div className="mt-6 max-w-md mx-auto space-y-3">
                    <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      <span>Analyzing Credits</span>
                      <span className="text-[#D4AF37]">Active</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 4 }}
                        className="h-full bg-[#D4AF37]" 
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="mx-auto w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-green-500">Evaluation Complete</h2>
                  <p className="text-muted-foreground mt-2">
                    {evaluationResult
                      ? `Processed ${evaluationResult.processedRecords} record(s) and identified ${totalAlerts} severity alert(s).`
                      : "Document analysis completed."}
                  </p>
                </div>
                {evaluationResult?.topFindings?.length ? (
                  <div className="max-w-2xl mx-auto text-left rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-bold text-[#D4AF37] mb-2">Key Findings</p>
                    <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                      {evaluationResult.topFindings.map((item, index) => (
                        <li key={`${item}-${index}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div className="flex justify-center gap-4">
                  <GoldButton
                    variant="outline"
                    onClick={() => {
                      setIsCompleted(false);
                      setSelectedFile(null);
                      setEvaluationResult(null);
                    }}
                  >
                    New Analysis
                  </GoldButton>
                  <GoldButton icon={Search}>Review Results</GoldButton>
                </div>
              </motion.div>
            )}
          </GlassCard>

          {/* Guidelines / Model Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <ShieldAlert className="h-8 w-8 text-[#D4AF37]" />
                <h3 className="text-lg font-bold">Severity Logic</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="font-bold text-foreground">Critical:</span> {">"} 3 Core Subject Arrears
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="font-bold text-foreground">Medium:</span> 2-3 Subject Arrears
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="font-bold text-foreground">Low:</span> 1 Subject Arrear
                </li>
              </ul>
            </GlassCard>
            <GlassCard className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <FileText className="h-8 w-8 text-[#D4AF37]" />
                <h3 className="text-lg font-bold">Supported Formats</h3>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>ERP Student Export (Excel)</p>
                <p>COE Examination Result (CSV)</p>
                <p>University Marksheet Bulk PDF</p>
                <p className="text-xs italic mt-4">* All documents are processed on-device for security.</p>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Sidebar / AI Insight */}
        <div className="space-y-8">
          <GlassCard className="p-6 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-[#D4AF37] flex items-center justify-center">
                <Cpu className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">AI Insight</h3>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-2">Current Model</p>
                <p className="text-sm font-medium">{evaluationResult?.model || "No analysis yet"}</p>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold">Confidence Score</h4>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#D4AF37]"
                      style={{ width: `${Math.max(0, Math.min(100, evaluationResult?.confidence || 0))}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold">{(evaluationResult?.confidence || 0).toFixed(1)}%</span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <h4 className="text-sm font-bold mb-4">Recent Evaluations</h4>
                <div className="space-y-3">
                  {history.length ? (
                    history.map((item, index) => (
                      <div key={`${item.fileName}-${index}`} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground truncate max-w-[180px]" title={item.fileName}>
                          {item.fileName}
                        </span>
                        <span className="font-bold text-[#D4AF37]">{item.processedRecords} Records</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No evaluations recorded yet.</p>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
