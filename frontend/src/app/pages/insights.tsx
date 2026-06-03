import { Layout } from "../components/syntax/layout";
import { TrendingUp, TrendingDown, Activity, Loader2 } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { insightsAPI } from "../services/api";

export function InsightsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    insightsAPI.get().then((r) => setData(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-primary" /></div></Layout>;

  const summary = data?.summary || {};
  const perfData = data?.performanceData || [];
  const cxData = data?.complexityData || [];
  const recentActivity = data?.recentActivity || [];

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl mb-6">Performance Insights</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-[#1E293B] border border-[#475569] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-slate-400">Average Score</h3>
              <TrendingUp className="size-5 text-green-400" />
            </div>
            <p className="text-3xl text-white mb-1">{summary.averageScore ?? "—"}</p>
            <p className={`text-xs ${(summary.scoreDelta ?? 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
              {(summary.scoreDelta ?? 0) >= 0 ? "+" : ""}{summary.scoreDelta ?? 0} from last month
            </p>
          </div>
          <div className="bg-[#1E293B] border border-[#475569] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-slate-400">Total Analyses</h3>
              <Activity className="size-5 text-primary" />
            </div>
            <p className="text-3xl text-white mb-1">{summary.totalAnalyses ?? 0}</p>
            <p className="text-xs text-slate-400">{summary.thisMonth ?? 0} this month</p>
          </div>
          <div className="bg-[#1E293B] border border-[#475569] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-slate-400">Optimization Rate</h3>
              <TrendingDown className="size-5 text-primary" />
            </div>
            <p className="text-3xl text-white mb-1">{summary.optimizationRate ?? 0}%</p>
            <p className="text-xs text-slate-400">Analyses scoring ≥80</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#1E293B] border border-[#475569] rounded-lg p-6">
            <h3 className="text-sm mb-4">Performance Trend (Last 7 Days)</h3>
            {perfData.length === 0 ? <p className="text-slate-500 text-sm">No data yet.</p> :
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={perfData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#1E293B", border: "1px solid #475569", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="score" stroke="#7C3AED" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>}
          </div>
          <div className="bg-[#1E293B] border border-[#475569] rounded-lg p-6">
            <h3 className="text-sm mb-4">Complexity Distribution</h3>
            {cxData.length === 0 ? <p className="text-slate-500 text-sm">No data yet.</p> :
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={cxData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#1E293B", border: "1px solid #475569", borderRadius: "8px" }} />
                  <Bar dataKey="count" fill="#38BDF8" />
                </BarChart>
              </ResponsiveContainer>}
          </div>
        </div>
      </div>
    </Layout>
  );
}
