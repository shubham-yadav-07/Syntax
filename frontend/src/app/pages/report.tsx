import { Layout } from "../components/syntax/layout";
import { Download, Share2, Save, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { useAnalysisStore } from "../store/analysisStore";
import { reportsAPI } from "../services/api";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

const COLORS = ["#7C3AED", "#334155"];

export function ReportPage() {
  const { currentAnalysis, currentAnalysisId } = useAnalysisStore();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  if (!currentAnalysis || !currentAnalysisId) {
    return <Layout><div className="p-6 text-center"><p className="text-slate-400 mb-4">No analysis found.</p>
      <button onClick={() => navigate("/new")} className="px-4 py-2 bg-primary rounded text-sm">New Analysis</button></div></Layout>;
  }

  const a = currentAnalysis;
  const cx = a.complexity || {};
  const score = a.overallScore || 87;
  const scoreData = [{ name: "Score", value: score }, { name: "Remaining", value: 100 - score }];

  const handleSave = async () => {
    setSaving(true);
    try {
      await reportsAPI.save(currentAnalysisId, `${a.filename} Report`);
      toast.success("Report saved!");
    } catch { toast.error("Failed to save report"); } finally { setSaving(false); }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await reportsAPI.downloadPDF(currentAnalysisId, a.filename || "syntax-report");
      toast.success("PDF downloaded!");
    } catch { toast.error("Failed to download PDF"); } finally { setDownloading(false); }
  };

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl">Analysis Report</h1>
          <div className="flex gap-2 flex-wrap">
            <button onClick={handleDownload} disabled={downloading}
              className="px-4 py-2 bg-[#334155] hover:bg-[#475569] rounded text-sm flex items-center gap-2 disabled:opacity-50">
              {downloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />} Download PDF
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 bg-primary hover:bg-primary/90 rounded text-sm flex items-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#1E293B] border border-[#475569] rounded-lg p-6">
              <h2 className="text-lg mb-4">Analysis Summary</h2>
              <div className="space-y-4">
                {[
                  ["Algorithm", a.patterns?.detectedAlgorithm || "Unknown"],
                  ["Language", a.language?.toUpperCase()],
                  ["Lines of Code", a.stats?.linesOfCode],
                  ["Analysis Date", new Date(a.createdAt || Date.now()).toLocaleDateString()],
                  ["Filename", a.filename],
                ].map(([label, value]) => (
                  <div key={String(label)} className="flex justify-between py-2 border-b border-[#475569]">
                    <span className="text-slate-400">{label}</span>
                    <span className="text-white">{value || "N/A"}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Status</span>
                  <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-sm">Completed</span>
                </div>
              </div>
            </div>

            <div className="bg-[#1E293B] border border-[#475569] rounded-lg p-6">
              <h2 className="text-lg mb-4">Complexity Analysis</h2>
              <div className="grid grid-cols-2 gap-4">
                {[["Time Complexity", cx.time], ["Space Complexity", cx.space], ["Best Case", cx.bestCase], ["Worst Case", cx.worstCase]].map(([label, value]) => (
                  <div key={String(label)} className="p-4 bg-[#0F172A] rounded">
                    <p className="text-xs text-slate-400 mb-1">{label}</p>
                    <p className="text-2xl text-white">{value || "N/A"}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1E293B] border border-[#475569] rounded-lg p-6">
              <h2 className="text-lg mb-4">Optimization Suggestions</h2>
              <div className="space-y-3">
                {(a.suggestions || []).slice(0, 3).map((s: any, i: number) => (
                  <div key={i} className={`p-3 rounded flex items-start gap-3 ${
                    s.impact === "high" ? "bg-green-500/10 border border-green-500/30" :
                    s.impact === "medium" ? "bg-yellow-500/10 border border-yellow-500/30" :
                    "bg-blue-500/10 border border-blue-500/30"}`}>
                    <div className={`size-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      s.impact === "high" ? "bg-green-500/20" : s.impact === "medium" ? "bg-yellow-500/20" : "bg-blue-500/20"}`}>
                      <span className={`text-xs ${s.impact === "high" ? "text-green-400" : s.impact === "medium" ? "text-yellow-400" : "text-blue-400"}`}>
                        {i + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-white mb-1">{s.title}</p>
                      <p className="text-xs text-slate-400">{s.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#1E293B] border border-[#475569] rounded-lg p-6">
              <h2 className="text-lg mb-4 text-center">Performance Score</h2>
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                      <Pie data={scoreData} cx={100} cy={100} innerRadius={60} outerRadius={80}
                        startAngle={90} endAngle={-270} dataKey="value">
                        {scoreData.map((_, index) => <Cell key={index} fill={COLORS[index]} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-4xl text-white">{score}</p>
                      <p className="text-xs text-slate-400">out of 100</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#1E293B] border border-[#475569] rounded-lg p-6">
              <h2 className="text-lg mb-4">Key Metrics</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Loops</span>
                  <span className="text-white">{a.stats?.loops ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Recursion</span>
                  <span className="text-white">{a.patterns?.hasRecursion ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">HashMap Used</span>
                  <span className="text-white">{a.patterns?.hasHashMap ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nested Loops</span>
                  <span className={a.patterns?.hasNestedLoops ? "text-red-400" : "text-green-400"}>
                    {a.patterns?.hasNestedLoops ? "Yes ⚠" : "No ✓"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
