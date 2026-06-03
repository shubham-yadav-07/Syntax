import {
  LayoutDashboard,
  Code2,
  Play,
  Eye,
  Sparkles,
  GitCompare,
  History,
  Settings,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Code2, label: "Code Analyzer", active: false },
  { icon: Play, label: "Dry Run", active: false },
  { icon: Eye, label: "Visualizer", active: false },
  { icon: Sparkles, label: "AI Suggestions", active: false },
  { icon: GitCompare, label: "Compare", active: false },
  { icon: History, label: "History", active: false },
  { icon: Settings, label: "Settings", active: false },
];

export function Sidebar() {
  const [activeItem, setActiveItem] = useState("Dashboard");

  return (
    <aside className="w-56 bg-[#1E293B] border-r border-[#334155] h-[calc(100vh-3.5rem)]">
      <div className="p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.label;
          return (
            <button
              key={item.label}
              onClick={() => setActiveItem(item.label)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "text-slate-300 hover:bg-[#334155] hover:text-white"
              }`}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
