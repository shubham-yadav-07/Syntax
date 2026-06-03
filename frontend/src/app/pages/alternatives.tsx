import { Layout } from "../components/syntax/layout";
import { useState } from "react";
import { useAnalysisStore } from "../store/analysisStore";
import { useNavigate } from "react-router";

export function AlternativesPage() {
  const { currentAnalysis } = useAnalysisStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  if (!currentAnalysis) {
    return <Layout><div className="p-6 text-center"><p className="text-slate-400 mb-4">No analysis found.</p>
      <button onClick={() => navigate("/new")} className="px-4 py-2 bg-primary rounded text-sm">New Analysis</button></div></Layout>;
  }

  const solutions = currentAnalysis.alternatives || [];
  const active = solutions[activeTab] || {};

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl mb-6">Alternative Solutions</h1>

        <div className="flex gap-2 mb-6 flex-wrap">
          {solutions.map((s: any, i: number) => (
            <button key={i} onClick={() => setActiveTab(i)}
              className={`px-4 py-2 text-sm rounded transition-colors ${activeTab === i ? "bg-primary text-white" : "bg-[#334155] text-slate-300 hover:text-white"}`}>
              {s.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#1E293B] border border-[#475569] rounded-lg p-4">
            <h3 className="text-sm mb-3">Code</h3>
            <div className="p-4 bg-[#0F172A] rounded font-mono text-sm text-slate-300 max-h-80 overflow-auto">
              <pre>{active.code || "// Code not available"}</pre>
            </div>
            {active.description && <p className="mt-3 text-xs text-slate-400">{active.description}</p>}
          </div>

          <div className="bg-[#1E293B] border border-[#475569] rounded-lg p-4">
            <h3 className="text-sm mb-3">Complexity Analysis</h3>
            <div className="space-y-4">
              {[
                { label: "Time Complexity", value: active.timeComplexity },
                { label: "Space Complexity", value: active.spaceComplexity },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-slate-400">{label}</span>
                  <span className="text-white">{value || "N/A"}</span>
                </div>
              ))}
              {[
                { label: "Readability", value: active.readabilityScore, color: "bg-primary" },
                { label: "Efficiency Score", value: active.efficiencyScore, color: "bg-green-500" },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">{label}</span>
                    <span className="text-white">{value ?? 0}%</span>
                  </div>
                  <div className="h-2 bg-[#0F172A] rounded-full overflow-hidden">
                    <div style={{ width: `${value ?? 0}%` }} className={`h-full ${color}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#1E293B] border border-[#475569] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0F172A] border-b border-[#475569]">
                <tr>
                  {["Solution", "Time", "Space", "Readability", "Efficiency"].map((h) => (
                    <th key={h} className="text-left p-3 text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {solutions.map((s: any, i: number) => (
                  <tr key={i} className={`border-b border-[#475569] cursor-pointer hover:bg-[#334155] ${activeTab === i ? "bg-[#334155]" : ""}`}
                    onClick={() => setActiveTab(i)}>
                    <td className="p-3 text-white">{s.name}</td>
                    <td className="p-3 text-slate-300">{s.timeComplexity}</td>
                    <td className="p-3 text-slate-300">{s.spaceComplexity}</td>
                    <td className="p-3 text-slate-300">{s.readabilityScore}%</td>
                    <td className="p-3 text-slate-300">{s.efficiencyScore}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
