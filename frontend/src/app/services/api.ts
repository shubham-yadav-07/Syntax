import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 60000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("syntax_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem("syntax_refresh");
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken: refresh });
        localStorage.setItem("syntax_token", data.data.accessToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = "/";
      }
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (name: string, email: string, password: string) =>
    api.post("/auth/register", { name, email, password }),
  login: async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    const { accessToken, refreshToken } = res.data.data;
    localStorage.setItem("syntax_token", accessToken);
    localStorage.setItem("syntax_refresh", refreshToken);
    return res;
  },
  logout: () => {
    localStorage.removeItem("syntax_token");
    localStorage.removeItem("syntax_refresh");
    localStorage.removeItem("syntax_user");
  },
  me: () => api.get("/auth/me"),
  isLoggedIn: () => !!localStorage.getItem("syntax_token"),
};

// ─── Analysis ─────────────────────────────────────────────────────────────────
export const analysisAPI = {
  submit: (code: string, language: string, filename?: string) =>
    api.post("/analysis/submit", { code, language, filename }),

  uploadFile: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/analysis/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getById: (id: string) => api.get(`/analysis/${id}`),
  getStatus: (id: string) => api.get(`/analysis/${id}/status`),

  pollUntilDone: (id: string, onProgress?: (status: string) => void): Promise<any> =>
    new Promise((resolve, reject) => {
      let tries = 0;
      const interval = setInterval(async () => {
        tries++;
        try {
          const { data } = await analysisAPI.getStatus(id);
          const status = data.data.status;
          onProgress?.(status);
          if (status === "completed") {
            clearInterval(interval);
            const full = await analysisAPI.getById(id);
            resolve(full.data.data.analysis);
          } else if (status === "failed") {
            clearInterval(interval);
            reject(new Error(data.data.errorMessage || "Analysis failed"));
          } else if (tries >= 30) {
            clearInterval(interval);
            reject(new Error("Timed out"));
          }
        } catch (e) {
          clearInterval(interval);
          reject(e);
        }
      }, 2000);
    }),

  delete: (id: string) => api.delete(`/analysis/${id}`),
};

// ─── History ──────────────────────────────────────────────────────────────────
export const historyAPI = {
  getAll: (params: Record<string, any> = {}) => api.get("/history", { params }),
  getRecent: () => api.get("/history/recent"),
};

// ─── Suggestions ──────────────────────────────────────────────────────────────
export const suggestionsAPI = {
  getByAnalysis: (analysisId: string) => api.get(`/suggestions/${analysisId}`),
};

// ─── Visualizations ───────────────────────────────────────────────────────────
export const visualizationAPI = {
  getAll: (analysisId: string) => api.get(`/visualizations/${analysisId}`),
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const reportsAPI = {
  getAll: (params: Record<string, any> = {}) => api.get("/reports", { params }),
  save: (analysisId: string, title?: string) =>
    api.post("/reports/save", { analysisId, title }),
  share: (reportId: string) => api.post(`/reports/${reportId}/share`),
  getShared: (token: string) => api.get(`/reports/shared/${token}`),
  downloadPDF: async (analysisId: string, filename = "syntax-report") => {
    const token = localStorage.getItem("syntax_token");
    const response = await axios.get(`${BASE_URL}/reports/${analysisId}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob",
    });
    const url = URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  },
  delete: (id: string) => api.delete(`/reports/${id}`),
};

// ─── Insights ─────────────────────────────────────────────────────────────────
export const insightsAPI = {
  get: () => api.get("/insights"),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data: Record<string, any>) => api.patch("/users/profile", data),
  updatePreferences: (prefs: Record<string, any>) => api.patch("/users/preferences", prefs),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch("/users/password", { currentPassword, newPassword }),
};

export default api;
