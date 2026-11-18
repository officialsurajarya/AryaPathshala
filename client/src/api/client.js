// Arya Pathshala — Centralized API Client

// In production, NEVER call localhost/private network to prevent browser "Access other apps and services" security prompt
const isProd = process.env.NODE_ENV === "production" || (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1");

const API_BASE_URL = isProd
  ? (process.env.REACT_APP_API_URL && !process.env.REACT_APP_API_URL.includes("localhost") ? process.env.REACT_APP_API_URL : "/api")
  : (process.env.REACT_APP_API_URL || "http://localhost:5000/api");

const getAuthToken = () => {
  return localStorage.getItem("arya_auth_token");
};

export const apiRequest = async (endpoint, options = {}) => {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const token = getAuthToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get("content-type");

    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      const error = new Error(data.message || `HTTP Error ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.warn(`[API] Request failed for ${endpoint}:`, error.message);
    throw error;
  }
};

// Convenience methods
export const api = {
  get: (endpoint, options) => apiRequest(endpoint, { ...options, method: "GET" }),
  post: (endpoint, body, options) =>
    apiRequest(endpoint, {
      ...options,
      method: "POST",
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    }),
  put: (endpoint, body, options) =>
    apiRequest(endpoint, {
      ...options,
      method: "PUT",
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    }),
  patch: (endpoint, body, options) =>
    apiRequest(endpoint, {
      ...options,
      method: "PATCH",
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    }),
  delete: (endpoint, options) =>
    apiRequest(endpoint, { ...options, method: "DELETE" }),
};

export default api;
