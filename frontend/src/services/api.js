import axios from "axios";

export const TOKEN_KEY = "talkiq_token";
export const USER_KEY = "talkiq_user";
export const LOGOUT_EVENT = "talkiq:logout";

// One place for the backend URL. Set VITE_API_URL in frontend/.env to change it.
export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_URL,
  // Normal requests. Slow calls (speech upload, debate evaluation) pass a bigger timeout.
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 = token missing, wrong or expired (tokens last 60 minutes).
    // Clear the saved login and tell AuthContext so the user goes back to /login.
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.dispatchEvent(new Event(LOGOUT_EVENT));
    }
    return Promise.reject(error);
  }
);

// Turns any axios error into a short message a user can read.
export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (error?.code === "ECONNABORTED") {
    return "The server took too long to respond. Please try again.";
  }
  if (!error?.response) {
    if (error?.request) return "Cannot reach the server. Check that the backend is running.";
    return error?.message || fallback;
  }
  if (error.response.status === 429) {
    return "Too many requests. Please wait a minute and try again.";
  }
  const detail = error.response.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    // FastAPI validation error (422)
    const first = detail[0];
    const field = Array.isArray(first.loc) ? first.loc[first.loc.length - 1] : "";
    return field ? `${field}: ${first.msg}` : first.msg;
  }
  return fallback;
}

// Same as getErrorMessage but returns an Error object that also keeps the HTTP status.
export function toApiError(error, fallback) {
  const e = new Error(getErrorMessage(error, fallback));
  e.status = error?.response?.status;
  return e;
}

export default api;
