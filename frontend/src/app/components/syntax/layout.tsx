import { Search, Bell, Menu } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import { Sidebar } from "./sidebar";
import { useAuthStore } from "../../store/analysisStore";

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthStore();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">

      {/* TAILWIND TEST */}
      <div className="bg-red-500 text-white p-4 text-3xl font-bold">
        TAILWIND WORKING
      </div>

      <nav className="h-14 bg-[#1E293B] border-b border-[#475569] px-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-[#334155] rounded transition-colors"
          >
            <Menu className="size-5" />
          </button>

          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-semibold"
          >
            &lt;Syntax/&gt;
          </Link>

          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />

            <input
              type="text"
              placeholder="Search..."
              className="w-80 h-9 pl-10 pr-4 bg-[#0F172A] border border-[#475569] rounded text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-[#334155] rounded transition-colors">
            <Bell className="size-5 text-slate-400" />
          </button>

          <Link
            to="/settings"
            className="size-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold hover:bg-primary/80 transition-colors"
            title={user?.name || "Profile"}
          >
            {initials}
          </Link>
        </div>
      </nav>

      <div className="flex">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div
          className={`fixed lg:static inset-y-0 left-0 z-40 transform transition-transform duration-200 lg:transform-none ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        <main className="flex-1 min-h-[calc(100vh-3.5rem)] overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}