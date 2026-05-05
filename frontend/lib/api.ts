import axios from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // Increased to 60s for Render free tier cold starts
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ─── Deduplication Logic ──────────────────────────────────────────────────────
const pendingRequests = new Map<string, AbortController>();

const generateRequestKey = (config: any) => {
  return `${config.method}:${config.url}?${JSON.stringify(config.params || {})}`;
};

// ─── Request Interceptor: Attach JWT & Deduplicate ────────────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("safetrack_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }

  // Deduplicate GET requests
  if (config.method?.toLowerCase() === "get") {
    const requestKey = generateRequestKey(config);
    if (pendingRequests.has(requestKey)) {
      const controller = pendingRequests.get(requestKey);
      controller?.abort("Duplicate request cancelled");
    }
    const controller = new AbortController();
    config.signal = controller.signal;
    pendingRequests.set(requestKey, controller);
  }

  return config;
});

// ─── Response Interceptor: Unwrap data, Handle 401, Retry 429/50x ─────────────
api.interceptors.response.use(
  (res) => {
    if (res.config.method?.toLowerCase() === "get") {
      pendingRequests.delete(generateRequestKey(res.config));
    }
    return res.data;
  },
  async (err) => {
    const config = err.config;

    // Clean up pending map
    if (config?.method?.toLowerCase() === "get") {
      pendingRequests.delete(generateRequestKey(config));
    }

    // Ignore aborted requests to prevent UI crashes
    if (axios.isCancel(err)) {
      console.log("Request canceled:", err.message);
      return new Promise(() => {}); // Return unresolved promise to halt execution chain
    }

    // Handle Auth expiration
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("safetrack_token");
      localStorage.removeItem("safetrack_user");
      window.location.href = "/login";
    }

    // ─── Exponential Backoff Retry System ─────────────────────────────────────
    const status = err.response?.status;
    if ((status === 429 || (status && status >= 500)) && config) {
      config._retryCount = config._retryCount || 0;
      const maxRetries = 3;

      if (config._retryCount < maxRetries) {
        config._retryCount += 1;

        // Emit event on first retry to notify UI
        if (typeof window !== "undefined" && config._retryCount === 1) {
          window.dispatchEvent(new CustomEvent("api-retrying"));
        }

        // Respect Retry-After header or calculate backoff (1s, 2s, 4s)
        let delay = 1000 * Math.pow(2, config._retryCount - 1); 
        const retryAfter = err.response?.headers?.["retry-after"];
        
        if (retryAfter) {
          const parsed = parseInt(retryAfter, 10);
          if (!isNaN(parsed)) delay = parsed * 1000;
        }

        console.warn(`[API] Retrying ${config.url} (Attempt ${config._retryCount}/${maxRetries}) in ${delay}ms`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        
        // Retry the request
        return api(config);
      }
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
