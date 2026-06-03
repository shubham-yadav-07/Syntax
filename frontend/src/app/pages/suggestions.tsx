import { Layout } from "../components/syntax/layout";
import { CheckCircle, TrendingUp, ArrowRight } from "lucide-react";
import { useAnalysisStore } from "../store/analysisStore";
import { useNavigate } from "react-router";

export function SuggestionsPage() {
  const { currentAnalysis } = useAnalysisStore();
  const navigate = useNavigate();

  if (!currentAnalysis) {
    return <Layout><div className="p-6 text-center"><p className="text-slate-400 mb-4">No analysis found.</p>
      <button onClick={() => navigate("/new")} className="px-4 py-2 bg-primary rounded text-sm">New Analysis</button></div></Layout>;
  }

  const suggestions = currentAnalysis.suggestions || [];
  const cx = currentAnalysis.complexity || {};

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl mb-6">AI Optimization Suggestions</h1>
        {suggestions.length === 0 ? (
          <div className="p-8 bg-[#1E293B] border border-[#475569] rounded-lg text-center">
            <p className="text-slate-400">Your code looks well-optimized! No suggestions at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {suggestions.map((s: any) => (
              <div key={s.id} className="p-4 bg-[#1E293B] border border-[#475569] rounded-lg hover:border-primary cursor-pointer transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <div className="size-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircle className="size-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm mb-1">{s.title}</h3>
                    <p className="text-xs text-slate-400">{s.description}</p>
                    {s.codeExample && (
                      <pre className="mt-2 p-2 bg-[#0F172A] rounded text-xs text-slate-300 overflow-x-auto">{s.codeExample}</pre>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs ${s.impact === "high" ? "bg-red-500/10 text-red-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                    {s.impact}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Potential improvement</span>
                  <span className="text-xs text-green-400">{s.improvement}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-[#1E293B] border border-[#475569] rounded-lg p-6">
          <h2 className="text-lg mb-4">Performance Comparison</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-2">Current</p>
              <p className="text-3xl text-white mb-2">{cx.time || "N/A"}</p>
              <p className="text-xs text-slate-500">Time complexity</p>
            </div>
            <div className="flex items-center justify-center"><ArrowRight className="size-8 text-primary" /></div>
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-2">Optimized</p>
              <p className="text-3xl text-green-400 mb-2">
                {suggestions.find((s: any) => s.impact === "high")?.improvement?.split("→")[1]?.trim() || cx.time || "N/A"}
              </p>
              <p className="text-xs text-slate-500">With optimizations</p>
            </div>
          </div>
          {suggestions.length > 0 && (
            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="size-5 text-green-400" />
                <div>
                  <p className="text-sm text-white mb-1">Potential Performance Gain</p>
                  <p className="text-2xl text-green-400">{suggestions.filter((s: any) => s.impact === "high").length > 0 ? "Significant" : "Moderate"}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
