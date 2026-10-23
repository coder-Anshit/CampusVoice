// services/client.js
// ─────────────────────────────────────────────────────────────────────────────
// Single axios instance for the whole app.
// Every service imports THIS — never creates its own axios instance.
// To switch from  localhost to production just change BASE_URL (or use .env).
// ─────────────────────────────────────────────────────────────────────────────

import axios from  "axios";

const BASE_URL = process.env.REACT_APP_API_URL ?? "http://localhost:5000/api";

export const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor — attach auth token when present ──────────────────
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor — normalise error shape ──────────────────────────
client.interceptors.response.use(
  (res) => res,
  (err) => {
    // Preserve the original error so callers can still inspect err.response
    return Promise.reject(err);
  }
);

export default client;
