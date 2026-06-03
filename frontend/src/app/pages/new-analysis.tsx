import { Layout } from "../components/syntax/layout";
import Editor from "@monaco-editor/react";
import { Upload, RotateCcw, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { analysisAPI, historyAPI } from "../services/api";
import { useAnalysisStore } from "../store/analysisStore";
import toast from "react-hot-toast";

const languages = ["C++", "Python", "Java", "JavaScript", "C", "Go"];
const langMap: Record<string, string> = {
  "C++": "cpp", Python: "python", Java: "java", JavaScript: "javascript", C: "c", Go: "go",
};

export function NewAnalysisPage() {
  const navigate = useNavigate();
  const { setAnalysisId, setAnalysis, setAnalyzing, setError } = useAnalysisStore();
  const [selectedLang, setSelectedLang] = useState("JavaScript");
  const [activeTab, setActiveTab] = useState("paste");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentFiles, setRecentFiles] = useState<any[]>([]);

  useEffect(() => {
    historyAPI.getRecent().then((r) => setRecentFiles(r.data.data.analyses)).catch(() => {});
  }, []);

  const handleAnalyze = async () => {
    if (!code.trim()) { toast.error("Please enter some code first"); return; }
    setLoading(true);
    setAnalyzing(true);
    try {
      const { data } = await analysisAPI.submit(code, langMap[selectedLang] || "javascript", `untitled.${langMap[selectedLang]}`);
      const analysisId = data.data.analysisId;
      setAnalysisId(analysisId);
      toast.loading("Analyzing your code...", { id: "analyzing" });
      const result = await analysisAPI.pollUntilDone(analysisId, (status) => {
        if (status === "analyzing") toast.loading("AI engine processing...", { id: "analyzing" });
      });
      toast.success("Analysis complete!", { id: "analyzing" });
      setAnalysis(result);
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Analysis failed", { id: "analyzing" });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setAnalyzing(true);
    try {
      const { data } = await analysisAPI.uploadFile(file);
      const analysisId = data.data.analysisId;
      setAnalysisId(analysisId);
      toast.loading("Analyzing uploaded file...", { id: "analyzing" });
      const result = await analysisAPI.pollUntilDone(analysisId);
      toast.success("Analysis complete!", { id: "analyzing" });
      setAnalysis(result);
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Upload failed", { id: "analyzing" });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl mb-6">New Analysis</h1>
        <div className="mb-6">
          <label className="block text-sm text-slate-400 mb-2">Choose Language</label>
          <select value={selectedLang} onChange={(e) => setSelectedLang(e.target.value)}
            className="w-full md:w-64 px-4 py-2 bg-[#1E293B] border border-[#475569] rounded text-white focus:outline-none focus:border-primary">
            {languages.map((lang) => <option key={lang}>{lang}</option>)}
          </select>
        </div>

        <div className="bg-[#1E293B] border border-[#475569] rounded-lg mb-6">
          <div className="flex gap-4 p-3 border-b border-[#475569]">
            {["paste", "upload", "drag"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm rounded transition-colors ${activeTab === tab ? "bg-[#334155] text-white" : "text-slate-400 hover:text-white"}`}>
                {tab === "paste" ? "Paste Code" : tab === "upload" ? "Upload File" : "Drag and Drop"}
              </button>
            ))}
          </div>
          <div className="p-4">
            {activeTab === "paste" && (
              <div className="rounded overflow-hidden border border-[#475569]">
                <Editor height="400px" language={langMap[selectedLang] || "javascript"} value={code}
                  onChange={(v) => setCode(v || "")} theme="vs-dark"
                  options={{ minimap: { enabled: false }, fontSize: 14, lineNumbers: "on", scrollBeyondLastLine: false }} />
              </div>
            )}
            {activeTab === "upload" && (
              <div className="h-64 border-2 border-dashed border-[#475569] rounded flex flex-col items-center justify-center">
                <Upload className="size-12 text-slate-500 mb-4" />
                <p className="text-slate-400 mb-2">Upload a code file</p>
                <input type="file" accept=".cpp,.py,.java,.js,.ts,.c,.go" className="hidden" id="file-upload"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} />
                <label htmlFor="file-upload" className="px-4 py-2 bg-[#334155] hover:bg-[#475569] rounded text-sm cursor-pointer transition-colors">
                  Choose File
                </label>
              </div>
            )}
            {activeTab === "drag" && (
              <div className="h-64 border-2 border-dashed border-[#475569] rounded flex flex-col items-center justify-center"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f); }}>
                <p className="text-slate-400 mb-2">Drag and drop your file here</p>
                <p className="text-xs text-slate-500">Supports .cpp, .py, .java, .js, .c, .go</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mb-8">
          <button onClick={() => setCode("")}
            className="px-4 py-2 bg-[#334155] hover:bg-[#475569] rounded text-sm flex items-center gap-2 transition-colors">
            <RotateCcw className="size-4" /> Reset
          </button>
          <button onClick={handleAnalyze} disabled={loading}
            className="px-6 py-2 bg-primary hover:bg-primary/90 rounded text-sm transition-colors flex items-center gap-2 disabled:opacity-50">
            {loading && <Loader2 className="size-4 animate-spin" />}
            {loading ? "Analyzing..." : "Analyze Code"}
          </button>
        </div>

        <div>
          <h2 className="text-lg mb-4">Recent Files</h2>
          <div className="space-y-2">
            {recentFiles.length === 0 ? (
              <p className="text-sm text-slate-500">No recent analyses yet.</p>
            ) : recentFiles.map((file: any, i: number) => (
              <div key={i} className="p-4 bg-[#1E293B] border border-[#475569] rounded-lg flex items-center justify-between hover:border-primary cursor-pointer transition-colors">
                <div>
                  <p className="text-sm text-white mb-1">{file.filename}</p>
                  <p className="text-xs text-slate-400">{file.language} • {new Date(file.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={async () => {
                  const { data } = await analysisAPI.getById(file._id);
                  setAnalysis(data.data.analysis);
                  navigate("/dashboard");
                }} className="text-xs text-primary hover:text-primary/80">Load</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
