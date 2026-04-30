import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

// 1. Get the debugger host (your computer's IP) automatically from Expo
// In production, use EXPO_PUBLIC_API_URL
const debuggerHost = Constants.expoConfig?.hostUri?.split(":")[0];
const DEV_API_URL = debuggerHost ? `http://${debuggerHost}:5000/api` : "http://localhost:5000/api";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEV_API_URL;

console.log("📡 API Base URL:", BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// ─── Request Interceptor: Attach JWT ──────────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {}
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Handle 401 ─────────────────────────────────────────
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const message =
      error.response?.data?.message || error.message || "An unexpected error occurred";

    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync("authToken");
      // Navigation reset handled in AuthContext
    }

    return Promise.reject({ message, status: error.response?.status });
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  signup: (name: string, email: string, password: string, role: string) =>
    api.post("/auth/signup", { name, email, password, role }),
  getMe: () => api.get("/auth/me"),
  updateMe: (data: Record<string, string>) => api.patch("/auth/update-me", data),
};

// ─── Children ─────────────────────────────────────────────────────────────────
export const childrenAPI = {
  getAll: () => api.get("/children"),
  getOne: (id: string) => api.get(`/children/${id}`),
  add: (data: Record<string, unknown>) => api.post("/children", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/children/${id}`, data),
  remove: (id: string) => api.delete(`/children/${id}`),
  pair: (pairingCode: string, deviceName: string) =>
    api.post("/children/pair", { pairingCode, deviceName }),
  unpairSelf: () => api.post("/children/unpair-self"),
};

// ─── Location ─────────────────────────────────────────────────────────────────
export const locationAPI = {
  update: (data: Record<string, unknown>) => api.post("/location/update", data),
  getLast: (childId: string) => api.get(`/location/last/${childId}`),
  getHistory: (childId: string, params?: Record<string, unknown>) =>
    api.get(`/location/history/${childId}`, { params }),
};

// ─── Alerts ───────────────────────────────────────────────────────────────────
export const alertsAPI = {
  getAll: (params?: Record<string, unknown>) => api.get("/alerts", { params }),
  markRead: (id: string) => api.patch(`/alerts/${id}/read`),
  markAllRead: () => api.patch("/alerts/read-all"),
  triggerSOS: (data: Record<string, unknown>) => api.post("/alerts/sos", data),
  remove: (id: string) => api.delete(`/alerts/${id}`),
};

// ─── Geofences ────────────────────────────────────────────────────────────────
export const geofencesAPI = {
  getAll: (params?: Record<string, unknown>) => api.get("/geofences", { params }),
  create: (data: Record<string, unknown>) => api.post("/geofences", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/geofences/${id}`, data),
  toggle: (id: string) => api.patch(`/geofences/${id}/toggle`),
  remove: (id: string) => api.delete(`/geofences/${id}`),
};

// ─── Activity ─────────────────────────────────────────────────────────────────
export const activityAPI = {
  get: (childId: string, params?: Record<string, unknown>) =>
    api.get(`/activity/${childId}`, { params }),
};

export default api;
