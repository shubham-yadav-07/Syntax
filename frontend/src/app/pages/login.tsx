import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { authAPI } from "../services/api";
import { useAuthStore } from "../store/analysisStore";
import toast from "react-hot-toast";

export function LoginPage() {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(form.email, form.password);
      const { user, accessToken } = res.data.data;
      setUser(user);
      setToken(accessToken);
      toast.success("Welcome back!");
      navigate("/new");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl">&lt;Syntax/&gt;</Link>
          <p className="text-slate-400 mt-2">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-[#1E293B] border border-[#475569] rounded-lg p-8 space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Email</label>
            <input type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2 bg-[#0F172A] border border-[#475569] rounded text-white focus:outline-none focus:border-primary"
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Password</label>
            <input type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2 bg-[#0F172A] border border-[#475569] rounded text-white focus:outline-none focus:border-primary"
              placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-primary hover:bg-primary/90 rounded text-sm font-medium disabled:opacity-50 transition-colors">
            {loading ? "Signing in..." : "Sign In"}
          </button>
          <p className="text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
