import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 → redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// ─── Auth ────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// ─── Servers ─────────────────────────────────────────
export const serversAPI = {
  list: () => api.get('/servers'),
  get: (id) => api.get(`/servers/${id}`),
  metrics: (id, limit = 50) => api.get(`/servers/${id}/metrics?limit=${limit}`),
  create: (data) => api.post('/servers', data),
  update: (id, data) => api.put(`/servers/${id}`, data),
  delete: (id) => api.delete(`/servers/${id}`),
};

// ─── Status ──────────────────────────────────────────
export const statusAPI = {
  all: () => api.get('/status'),
  get: (id) => api.get(`/status/${id}`),
};

// ─── Alerts ──────────────────────────────────────────
export const alertsAPI = {
  list: (params = {}) => api.get('/alerts', { params }),
  markRead: (id) => api.put(`/alerts/${id}/read`),
  markAllRead: () => api.put('/alerts/read-all'),
  delete: (id) => api.delete(`/alerts/${id}`),
  unreadCount: () => api.get('/alerts/unread-count'),
};

// ─── Analytics ───────────────────────────────────────
export const analyticsAPI = {
  summary: () => api.get('/analytics/summary'),
  uptimeTrend: (hours = 24) => api.get(`/analytics/uptime-trend?hours=${hours}`),
  latencyTrend: (hours = 24) => api.get(`/analytics/latency-trend?hours=${hours}`),
  failureFrequency: () => api.get('/analytics/failure-frequency'),
  incidents: (limit = 50) => api.get(`/analytics/incidents?limit=${limit}`),
  aiInsights: () => api.get('/analytics/ai-insights'),
};

// ─── Export ──────────────────────────────────────────
export const exportAPI = {
  csv: () => api.get('/export/csv', { responseType: 'blob' }),
  excel: () => api.get('/export/excel', { responseType: 'blob' }),
};

// ─── Health ──────────────────────────────────────────
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
