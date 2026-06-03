import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { authAPI } from "../services/api";
import { useAuthStore } from "../store/analysisStore";
import toast from "react-hot-toast";

export function RegisterPage() {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error("Passwords do not match"); return; }
    setLoading(true);
    try {
      const res = await authAPI.register(form.name, form.email, form.password);
      const { user, accessToken, refreshToken } = res.data.data;
      localStorage.setItem("syntax_token", accessToken);
      localStorage.setItem("syntax_refresh", refreshToken);
      setUser(user);
      setToken(accessToken);
      toast.success("Account created!");
      navigate("/new");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl">&lt;Syntax/&gt;</Link>
          <p className="text-slate-400 mt-2">Create your account</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-[#1E293B] border border-[#475569] rounded-lg p-8 space-y-4">
          {[
            { label: "Full Name", key: "name", type: "text", placeholder: "John Doe" },
            { label: "Email", key: "email", type: "email", placeholder: "you@example.com" },
            { label: "Password", key: "password", type: "password", placeholder: "Min 8 chars" },
            { label: "Confirm Password", key: "confirm", type: "password", placeholder: "••••••••" },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-sm text-slate-400 mb-2">{label}</label>
              <input type={type} required value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full px-4 py-2 bg-[#0F172A] border border-[#475569] rounded text-white focus:outline-none focus:border-primary"
                placeholder={placeholder} />
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-primary hover:bg-primary/90 rounded text-sm font-medium disabled:opacity-50 transition-colors">
            {loading ? "Creating account..." : "Create Account"}
          </button>
          <p className="text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
