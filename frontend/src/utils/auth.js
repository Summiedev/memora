/**
 * auth.js — Central auth token management
 *
 * Rules:
 * - NEVER remove the token on a network error (offline, tab-switch, server blip)
 * - ONLY remove the token on an explicit 401 from the server that confirms the
 *   token is invalid/expired — not on connection errors (status === 0 / no response)
 * - Use a shared axios instance so the Authorization header is always fresh
 */

import axios from "axios";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!BASE_URL) {
  throw new Error('VITE_API_BASE_URL must be defined in your environment.');
}
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || BASE_URL.replace(/\/api\/?$/, "");

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers = [];
let cachedCsrfToken = null;

const onRefreshed = () => {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
};

const subscribeRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

// CSRF Token Management
export async function getCsrfToken(forceRefresh = false) {
  if (cachedCsrfToken && !forceRefresh) {
    return cachedCsrfToken;
  }
  
  try {
    cachedCsrfToken = null; // Clear cache before fetching fresh token
    const response = await axios.get(`${BASE_URL}/csrf-token`, {
      withCredentials: true,
    });
    cachedCsrfToken = response.data.csrfToken;
    return cachedCsrfToken;
  } catch (err) {
    console.error('Failed to fetch CSRF token:', err);
    cachedCsrfToken = null;
    return null;
  }
}

// Clear cached CSRF token (call this on logout)
export function clearCsrfCache() {
  cachedCsrfToken = null;
}

const refreshSession = async () => {
  try {
    const csrfToken = await getCsrfToken();
    await refreshClient.post("/auth/refresh", {}, {
      headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : {}
    });
    return true;
  } catch (err) {
    return false;
  }
};

api.interceptors.request.use(async (config) => {
  config.withCredentials = true;
  
  // Add CSRF token for auth endpoints
  const authEndpoints = [
    '/auth/login', 
    '/auth/register', 
    '/auth/logout', 
    '/auth/refresh',
    '/auth/requestPasswordReset',
    '/auth/resetPassword'
  ];
  
  if (authEndpoints.some(endpoint => config.url?.includes(endpoint))) {
    try {
      // Always get fresh CSRF token for auth endpoints
      const csrfToken = await getCsrfToken(true);
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      } else {
        console.warn('CSRF token unavailable for auth endpoint');
      }
    } catch (err) {
      console.error('Error adding CSRF token:', err);
    }
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/register") &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        const refreshed = await refreshSession();
        isRefreshing = false;
        onRefreshed();

        if (!refreshed) {
          window.location.href = "/login";
          return Promise.reject(error);
        }
      }

      return new Promise((resolve, reject) => {
        subscribeRefresh(async () => {
          try {
            const response = await api(originalRequest);
            resolve(response);
          } catch (err) {
            reject(err);
          }
        });
      });
    }

    if (status === 403) {
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;

export const authH = () => ({});
