import { create } from "zustand";

interface AnalysisState {
  currentAnalysisId: string | null;
  currentAnalysis: any | null;
  isAnalyzing: boolean;
  error: string | null;
  setAnalysisId: (id: string) => void;
  setAnalysis: (analysis: any) => void;
  setAnalyzing: (v: boolean) => void;
  setError: (e: string | null) => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  currentAnalysisId: null,
  currentAnalysis: null,
  isAnalyzing: false,
  error: null,
  setAnalysisId: (id) => set({ currentAnalysisId: id }),
  setAnalysis: (analysis) => set({ currentAnalysis: analysis, isAnalyzing: false }),
  setAnalyzing: (v) => set({ isAnalyzing: v }),
  setError: (e) => set({ error: e, isAnalyzing: false }),
  reset: () => set({ currentAnalysisId: null, currentAnalysis: null, isAnalyzing: false, error: null }),
}));

interface AuthState {
  user: any | null;
  token: string | null;
  setUser: (user: any) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    try { return JSON.parse(localStorage.getItem("syntax_user") || "null"); } catch { return null; }
  })(),
  token: localStorage.getItem("syntax_token"),
  setUser: (user) => {
    localStorage.setItem("syntax_user", JSON.stringify(user));
    set({ user });
  },
  setToken: (token) => {
    localStorage.setItem("syntax_token", token);
    set({ token });
  },
  logout: () => {
    localStorage.clear();
    set({ user: null, token: null });
  },
}));
