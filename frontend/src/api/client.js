import axios from "axios";

export const API_BASE =
  process.env.REACT_APP_API_BASE || "http://localhost:5000";

export const TOKEN_KEY = "wku_token";

const client = axios.create({ baseURL: `${API_BASE}/api` });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Turns an axios failure into the message the API sent, so pages can show it.
export function apiError(error, fallback = "Something went wrong") {
  return error?.response?.data?.error || error?.message || fallback;
}

export const fileUrl = (resourceId) => `${API_BASE}/api/resources/${resourceId}/file`;

export default client;
