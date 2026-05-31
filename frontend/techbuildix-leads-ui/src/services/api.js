import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.detail || err.message;
    return Promise.reject(new Error(msg));
  }
);

let _getToken = null;
export function setTokenGetter(fn) {
  _getToken = fn;
}

api.interceptors.request.use((config) => {
  if (_getToken) {
    const token = _getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const leadsApi = {
  getAll: () => api.get("/leads").then((r) => r.data),
  getStats: () => api.get("/leads/stats").then((r) => r.data),
};

export const scrapeApi = {
  start: (searchTerm) => api.post("/scrape", { search_term: searchTerm }).then((r) => r.data),
  status: () => api.get("/scrape/status").then((r) => r.data),
};

export const emailApi = {
  start: () => api.post("/send-emails").then((r) => r.data),
  status: () => api.get("/send-emails/status").then((r) => r.data),
};

export const settingsApi = {
  get: () => api.get("/settings").then((r) => r.data),
  save: (payload) => api.post("/settings", payload).then((r) => r.data),
  status: () => api.get("/settings/status").then((r) => r.data),
};

export const logsApi = {
  get: (jobType, limit = 100) =>
    api.get("/logs", { params: { job_type: jobType, limit } }).then((r) => r.data),
};

export const subscriptionApi = {
  getPlans: () => api.get("/plans").then((r) => r.data),
  getMySubscription: () => api.get("/subscription").then((r) => r.data),
  getLimits: () => api.get("/subscription/limits").then((r) => r.data),
  createCheckout: (planId, interval = "monthly") =>
    api.post("/subscription/create-checkout", null, { params: { plan_id: planId, interval } }).then((r) => r.data),
  portal: () => api.post("/subscription/portal").then((r) => r.data),
};

export default api;
