import { Layout } from "../components/syntax/layout";
import Editor from "@monaco-editor/react";
import { ChevronRight, Link as LinkIcon } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAnalysisStore } from "../store/analysisStore";

export function DashboardPage() {
  const { currentAnalysis } = useAnalysisStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("explanation");

  const a = currentAnalysis;
  if (!a) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <p className="text-slate-400 mb-4">No analysis loaded.</p>
          <button onClick={() => navigate("/new")} className="px-4 py-2 bg-primary rounded text-sm">
            Start New Analysis
          </button>
        </div>
      </Layout>
    );
  }

  const cx = a.complexity || {};
  const stats = a.stats || {};
  const explanations = a.explanations || [];
  const dryRun = a.dryRun || [];
  const breakdown = a.complexityBreakdown || [];

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link to="/dashboard" className="hover:text-white">Dashboard</Link>
          <ChevronRight className="size-4" />
          <span className="text-white">{a.filename || "Analysis"}</span>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            { label: "Suggestions", path: "/suggestions" },
            { label: "Alternatives", path: "/alternatives" },
            { label: "Visualizer", path: "/visualizer" },
            { label: "Report", path: "/report" },
          ].map((btn) => (
            <button key={btn.path} onClick={() => navigate(btn.path)}
              className="px-3 py-1.5 bg-[#334155] hover:bg-[#475569] rounded text-xs flex items-center gap-1 transition-colors">
              <LinkIcon className="size-3" /> {btn.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: "Time Complexity", value: cx.time },
            { label: "Space Complexity", value: cx.space },
            { label: "Best Case", value: cx.bestCase },
            { label: "Average Case", value: cx.averageCase },
            { label: "Worst Case", value: cx.worstCase },
          ].map((card) => (
            <div key={card.label} className="p-4 bg-[#1E293B] border border-[#475569] rounded-lg">
              <p className="text-xs text-slate-400 mb-1">{card.label}</p>
              <p className="text-2xl text-white">{card.value || "N/A"}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-[#1E293B] border border-[#475569] rounded-lg">
            <h3 className="text-sm mb-3">Code Statistics</h3>
            <div className="space-y-2 text-sm">
              {[
                ["Lines of code", stats.linesOfCode],
                ["Loops", stats.loops],
                ["Recursive calls", stats.recursiveCalls],
                ["Variables", stats.variables],
                ["Functions", stats.functions],
                ["Nested depth", stats.nestedDepth],
              ].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between">
                  <span className="text-slate-400">{k}</span>
                  <span className="text-white">{v ?? "N/A"}</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span className="text-slate-400">Algorithm</span>
                <span className="text-white text-xs">{a.patterns?.detectedAlgorithm || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 p-4 bg-[#1E293B] border border-[#475569] rounded-lg">
            <div className="flex gap-2 mb-4 flex-wrap">
              {["explanation", "dryrun", "breakdown"].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-xs rounded transition-colors ${activeTab === tab ? "bg-primary text-white" : "text-slate-400 hover:text-white"}`}>
                  {tab === "explanation" ? "Explanation" : tab === "dryrun" ? "Dry Run" : "Complexity Breakdown"}
                </button>
              ))}
            </div>
            {activeTab === "explanation" && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {explanations.length === 0 ? <p className="text-xs text-slate-500">No explanations available.</p> :
                  explanations.map((item: any, i: number) => (
                    <div key={i} className="flex gap-3 p-2 bg-[#0F172A] rounded">
                      <span className="text-xs text-primary shrink-0 w-6">{item.line}</span>
                      <p className="text-xs text-slate-300">{item.text}</p>
                    </div>
                  ))}
              </div>
            )}
            {activeTab === "dryrun" && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {dryRun.length === 0 ? <p className="text-xs text-slate-500">No dry run data.</p> :
                  dryRun.map((step: any, i: number) => (
                    <div key={i} className="p-2 bg-[#0F172A] rounded text-xs">
                      <span className="text-primary font-mono">Step {step.step}: </span>
                      <span className="text-slate-300">{step.description}</span>
                      {step.variables && Object.keys(step.variables).length > 0 && (
                        <div className="mt-1 text-slate-500">
                          {Object.entries(step.variables).map(([k, v]) => (
                            <span key={k} className="mr-2">{k}={String(v)}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
            {activeTab === "breakdown" && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {breakdown.length === 0 ? <p className="text-xs text-slate-500">No breakdown data.</p> :
                  breakdown.map((b: any, i: number) => (
                    <div key={i} className="p-2 bg-[#0F172A] rounded text-xs flex justify-between">
                      <span className="text-slate-300">{b.section} (L{b.lineStart}–{b.lineEnd})</span>
                      <span className="text-primary">{b.complexity}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm mb-3">Line-by-Line Explanation</h3>
            <div className="space-y-2">
              {explanations.slice(0, 6).map((item: any, i: number) => (
                <div key={i} className="p-3 bg-[#1E293B] border border-[#475569] rounded-lg">
                  <div className="flex gap-3">
                    <div className="size-6 rounded bg-primary/10 flex items-center justify-center text-xs text-primary shrink-0">{item.line}</div>
                    <p className="text-sm text-slate-300">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm mb-3">Code — {a.language?.toUpperCase()}</h3>
            <div className="rounded overflow-hidden border border-[#475569]">
              <Editor height="300px" language={a.language || "javascript"} value={a.code || ""}
                theme="vs-dark" options={{ minimap: { enabled: false }, fontSize: 13, readOnly: true, scrollBeyondLastLine: false }} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
