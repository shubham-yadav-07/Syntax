import { Search, Bell, Moon, Sun } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <nav className="h-14 bg-[#1E293B] border-b border-[#334155] px-6 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-lg">⚡</span>
          </div>
          <h1 className="text-lg text-white">AlgoLens</h1>
        </div>

        <div className="relative w-96 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search algorithms..."
            className="w-full h-9 pl-10 pr-4 bg-[#0F172A] border border-[#334155] rounded-md focus:outline-none focus:border-primary text-sm text-white placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="size-9 rounded-md hover:bg-[#334155] flex items-center justify-center">
          <Bell className="size-4 text-slate-400" />
        </button>

        <button
          onClick={toggleTheme}
          className="size-9 rounded-md hover:bg-[#334155] flex items-center justify-center"
        >
          {isDark ? (
            <Sun className="size-4 text-slate-400" />
          ) : (
            <Moon className="size-4 text-slate-400" />
          )}
        </button>

        <div className="size-8 rounded-md bg-primary flex items-center justify-center cursor-pointer">
          <span className="text-white text-xs">AK</span>
        </div>
      </div>
    </nav>
  );
}
