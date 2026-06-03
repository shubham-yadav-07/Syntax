import { Layout } from "../components/syntax/layout";
import { Download, Share2, Trash2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { reportsAPI } from "../services/api";
import toast from "react-hot-toast";

export function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const { data } = await reportsAPI.getAll(); setReports(data.data.reports); }
    catch { toast.error("Failed to load reports"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    try { await reportsAPI.delete(id); toast.success("Deleted"); load(); }
    catch { toast.error("Failed to delete"); }
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl mb-6">Saved Reports</h1>
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-primary" /></div>
        ) : reports.length === 0 ? (
          <div className="p-12 bg-[#1E293B] border border-[#475569] rounded-lg text-center">
            <p className="text-slate-400">No saved reports yet. Run an analysis and save it as a report!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((r: any) => (
              <div key={r._id} className="p-4 bg-[#1E293B] border border-[#475569] rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm text-white mb-1">{r.title}</p>
                  <p className="text-xs text-slate-400">
                    {r.snapshot?.language?.toUpperCase()} • {r.snapshot?.complexity?.time} •{" "}
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => reportsAPI.downloadPDF(r.analysisId?._id || r.analysisId, r.title)}
                    className="p-2 bg-[#334155] hover:bg-[#475569] rounded text-xs flex items-center gap-1">
                    <Download className="size-3" /> PDF
                  </button>
                  <button onClick={() => handleDelete(r._id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded text-red-400">
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
