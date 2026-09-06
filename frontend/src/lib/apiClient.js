/**
 * Centralized Axios instance for all API calls.
 *
 * - Attaches Authorization header from localStorage token automatically
 * - withCredentials: true for cookie support
 * - Throws a normalized error object on non-2xx responses
 */
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_APP_BACKENDURI,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request interceptor: attach JWT from localStorage ─────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor: normalize errors ────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';
    const status = error.response?.status ?? 0;

    // Attach a normalized message so callers can use error.message safely
    const normalized = new Error(typeof message === 'string' ? message : JSON.stringify(message));
    normalized.status = status;
    normalized.originalError = error;
    return Promise.reject(normalized);
  },
);

export default apiClient;
