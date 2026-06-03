import { Layout } from "../components/syntax/layout";
import { Search, ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { historyAPI, analysisAPI } from "../services/api";
import { useAnalysisStore } from "../store/analysisStore";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

export function HistoryPage() {
  const navigate = useNavigate();
  const { setAnalysis, setAnalysisId } = useAnalysisStore();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const load = async (p = 1, q = "") => {
    setLoading(true);
    try {
      const { data } = await historyAPI.getAll({ page: p, limit: 10, search: q || undefined });
      setAnalyses(data.data.analyses);
      setPagination(data.data.pagination);
    } catch { toast.error("Failed to load history"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, []);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); load(1, search); };

  const handleView = async (id: string) => {
    try {
      const { data } = await analysisAPI.getById(id);
      setAnalysis(data.data.analysis);
      setAnalysisId(id);
      navigate("/dashboard");
    } catch { toast.error("Failed to load analysis"); }
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl">Analysis History</h1>
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input type="text" placeholder="Search analyses..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-80 h-10 pl-10 pr-4 bg-[#1E293B] border border-[#475569] rounded text-white placeholder:text-slate-500 focus:outline-none focus:border-primary" />
          </form>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-primary" /></div>
        ) : (
          <div className="bg-[#1E293B] border border-[#475569] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0F172A] border-b border-[#475569]">
                  <tr>
                    {["Filename", "Language", "Complexity", "Date", "Score", "Actions"].map((h) => (
                      <th key={h} className="text-left p-4 text-sm text-slate-400">
                        <div className="flex items-center gap-2">{h} {h !== "Actions" && <ChevronDown className="size-3" />}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analyses.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-500">No analyses yet. Start your first analysis!</td></tr>
                  ) : analyses.map((a: any) => (
                    <tr key={a._id} className="border-b border-[#475569] hover:bg-[#334155] cursor-pointer" onClick={() => handleView(a._id)}>
                      <td className="p-4 text-white text-sm">{a.filename}</td>
                      <td className="p-4"><span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">{a.language?.toUpperCase()}</span></td>
                      <td className="p-4 text-slate-300 text-sm">{a.complexity?.time || "N/A"}</td>
                      <td className="p-4 text-slate-300 text-sm">{new Date(a.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-[#0F172A] rounded-full overflow-hidden">
                            <div style={{ width: `${a.overallScore || 0}%` }}
                              className={`h-full ${(a.overallScore || 0) >= 80 ? "bg-green-500" : (a.overallScore || 0) >= 60 ? "bg-yellow-500" : "bg-red-500"}`} />
                          </div>
                          <span className="text-white text-sm">{a.overallScore || 0}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <button className="text-primary hover:text-primary/80 text-sm">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-slate-400">Showing {((page - 1) * 10) + 1}–{Math.min(page * 10, pagination.total)} of {pagination.total}</p>
            <div className="flex gap-2">
              <button onClick={() => { setPage(p => Math.max(1, p - 1)); load(page - 1, search); }}
                disabled={page === 1} className="px-3 py-1.5 bg-[#334155] hover:bg-[#475569] rounded text-sm disabled:opacity-40">Previous</button>
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => { setPage(p); load(p, search); }}
                  className={`px-3 py-1.5 rounded text-sm ${page === p ? "bg-primary text-white" : "bg-[#334155] hover:bg-[#475569]"}`}>{p}</button>
              ))}
              <button onClick={() => { setPage(p => Math.min(pagination.pages, p + 1)); load(page + 1, search); }}
                disabled={page === pagination.pages} className="px-3 py-1.5 bg-[#334155] hover:bg-[#475569] rounded text-sm disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
