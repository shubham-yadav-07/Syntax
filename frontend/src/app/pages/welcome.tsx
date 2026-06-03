import { ArrowRight, CheckCircle, Code2 } from "lucide-react";
import { Link } from "react-router";
import { useAuthStore } from "../store/analysisStore";

export function WelcomePage() {
  const { token } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <nav className="h-14 border-b border-[#475569] px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xl"><Code2 className="size-5 text-primary" />&lt;Syntax/&gt;</div>
        <div className="flex gap-3">
          {token ? (
            <Link to="/new" className="px-4 py-2 bg-primary hover:bg-primary/90 rounded text-sm transition-colors">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 bg-[#334155] hover:bg-[#475569] rounded text-sm transition-colors">Sign In</Link>
              <Link to="/register" className="px-4 py-2 bg-primary hover:bg-primary/90 rounded text-sm transition-colors">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Understand Code Beyond Syntax
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-3xl mx-auto">
            Analyze DSA code with AI-powered complexity analysis, explanations, optimization suggestions, and visual learning.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to={token ? "/new" : "/register"}
              className="px-6 py-3 bg-primary hover:bg-primary/90 rounded flex items-center gap-2 transition-colors">
              Get Started <ArrowRight className="size-4" />
            </Link>
            <Link to={token ? "/dashboard" : "/login"}
              className="px-6 py-3 bg-[#334155] hover:bg-[#475569] rounded transition-colors">
              {token ? "Go to Dashboard" : "Sign In"}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Complexity Analysis", desc: "Get detailed time and space complexity with best, average, and worst-case scenarios.", color: "text-primary", bg: "bg-primary/10" },
            { title: "AI Suggestions", desc: "Receive intelligent optimization suggestions to improve your code performance.", color: "text-sky-400", bg: "bg-sky-500/10" },
            { title: "Interactive Visualizations", desc: "Visualize data structures and algorithm execution with interactive diagrams.", color: "text-green-400", bg: "bg-green-500/10" },
          ].map((f) => (
            <div key={f.title} className="p-6 bg-[#1E293B] border border-[#475569] rounded-lg hover:border-primary transition-colors">
              <div className={`size-12 ${f.bg} rounded-lg flex items-center justify-center mb-4`}>
                <CheckCircle className={`size-6 ${f.color}`} />
              </div>
              <h3 className="text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
