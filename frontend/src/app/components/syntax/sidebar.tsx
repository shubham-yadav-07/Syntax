import {
  LayoutDashboard,
  Plus,
  History,
  BookmarkCheck,
  Eye,
  TrendingUp,
  Settings,
} from "lucide-react";
import { Link, useLocation } from "react-router";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Plus, label: "New Analysis", path: "/new" },
  { icon: History, label: "History", path: "/history" },
  { icon: BookmarkCheck, label: "Saved Reports", path: "/reports" },
  { icon: Eye, label: "Visualizer", path: "/visualizer" },
  { icon: TrendingUp, label: "Insights", path: "/insights" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const location = useLocation();

  return (
    <aside className="w-56 bg-[#1E293B] border-r border-[#475569] h-[calc(100vh-3.5rem)] overflow-y-auto">
      <div className="p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "text-slate-300 hover:bg-[#334155] hover:text-white"
              }`}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
