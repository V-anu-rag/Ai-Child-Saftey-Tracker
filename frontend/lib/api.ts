import axios from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // Increased to 60s for Render free tier cold starts
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ─── Request Interceptor: Attach JWT from localStorage ───────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("safetrack_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor: Unwrap data, handle 401 ───────────────────────────
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("safetrack_token");
      localStorage.removeItem("safetrack_user");
      window.location.href = "/login";
    }
    const message =
      err.response?.data?.message || err.message || "Unexpected error";
    return Promise.reject(new Error(message));
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  signup: (name: string, email: string, password: string, role: string) =>
    api.post("/auth/signup", { name, email, password, role }),
  getMe: () => api.get("/auth/me"),
  updateMe: (data: Record<string, unknown>) =>
    api.patch("/auth/update-me", data),
};

// ─── Children ─────────────────────────────────────────────────────────────────
export const childrenAPI = {
  getAll: () => api.get("/children"),
  getOne: (id: string) => api.get(`/children/${id}`),
  add: (data: Record<string, unknown>) => api.post("/children", data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/children/${id}`, data),
  remove: (id: string) => api.delete(`/children/${id}`),
  regenerateCode: (id: string) => api.post(`/children/${id}/regenerate-code`),
};

// ─── Alerts ───────────────────────────────────────────────────────────────────
export const alertsAPI = {
  getAll: (params?: Record<string, unknown>) =>
    api.get("/alerts", { params }),
  markRead: (id: string) => api.patch(`/alerts/${id}/read`),
  markAllRead: () => api.patch("/alerts/read-all"),
  resolveSOS: (id: string) => api.patch(`/alerts/${id}/resolve`),
  remove: (id: string) => api.delete(`/alerts/${id}`),
};

// ─── Location ─────────────────────────────────────────────────────────────────
export const locationAPI = {
  getLast: (childId: string) => api.get(`/location/last/${childId}`),
  getHistory: (childId: string, params?: Record<string, unknown>) =>
    api.get(`/location/history/${childId}`, { params }),
};

// ─── Geofences ────────────────────────────────────────────────────────────────
export const geofencesAPI = {
  getAll: (params?: Record<string, unknown>) =>
    api.get("/geofences", { params }),
  create: (data: Record<string, unknown>) => api.post("/geofences", data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/geofences/${id}`, data),
  toggle: (id: string) => api.patch(`/geofences/${id}/toggle`),
  remove: (id: string) => api.delete(`/geofences/${id}`),
};

// ─── Activity ─────────────────────────────────────────────────────────────────
export const activityAPI = {
  get: (childId: string, params?: Record<string, unknown>) =>
    api.get(`/activity/${childId}`, { params }),
};

export default api;
