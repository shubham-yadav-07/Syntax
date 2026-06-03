import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { useEffect } from "react";
import { WelcomePage } from "./pages/welcome";
import { LoginPage } from "./pages/login";
import { RegisterPage } from "./pages/register";
import { NewAnalysisPage } from "./pages/new-analysis";
import { DashboardPage } from "./pages/dashboard";
import { SuggestionsPage } from "./pages/suggestions";
import { AlternativesPage } from "./pages/alternatives";
import { VisualizerPage } from "./pages/visualizer";
import { ReportPage } from "./pages/report";
import { HistoryPage } from "./pages/history";
import { SettingsPage } from "./pages/settings";
import { InsightsPage } from "./pages/insights";
import { ReportsPage } from "./pages/reports";
import { useAuthStore } from "./store/analysisStore";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/new" element={<PrivateRoute><NewAnalysisPage /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/suggestions" element={<PrivateRoute><SuggestionsPage /></PrivateRoute>} />
        <Route path="/alternatives" element={<PrivateRoute><AlternativesPage /></PrivateRoute>} />
        <Route path="/visualizer" element={<PrivateRoute><VisualizerPage /></PrivateRoute>} />
        <Route path="/report" element={<PrivateRoute><ReportPage /></PrivateRoute>} />
        <Route path="/history" element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
        <Route path="/insights" element={<PrivateRoute><InsightsPage /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><ReportsPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
