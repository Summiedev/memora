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

// CSRF Token Management with retry logic for mobile
export async function getCsrfToken(forceRefresh = false, retryCount = 0) {
  const MAX_RETRIES = 3;
  
  if (cachedCsrfToken && !forceRefresh) {
    return cachedCsrfToken;
  }
  
  try {
    console.log(`[CSRF] Fetching token (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);
    cachedCsrfToken = null; // Clear cache before fetching fresh token
    
    const response = await axios.get(`${BASE_URL}/csrf-token`, {
      withCredentials: true,
      timeout: 10000, // 10 second timeout
    });
    
    const token = response.data.csrfToken;
    if (!token) {
      throw new Error('CSRF token not in response');
    }
    
    cachedCsrfToken = token;
    console.log('[CSRF] Token fetched successfully');
    return token;
  } catch (err) {
    console.error('[CSRF] Failed to fetch token:', err.message);
    cachedCsrfToken = null;
    
    // Retry logic for transient failures
    if (retryCount < MAX_RETRIES) {
      console.log(`[CSRF] Retrying in 500ms...`);
      await new Promise(resolve => setTimeout(resolve, 500));
      return getCsrfToken(forceRefresh, retryCount + 1);
    }
    
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
      console.log(`[Auth] ${config.method?.toUpperCase()} ${config.url} - fetching CSRF token...`);
      
      // Always get fresh CSRF token for auth endpoints
      const csrfToken = await getCsrfToken(true);
      
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
        console.log('[Auth] CSRF token added to request');
      } else {
        console.warn('[Auth] CSRF token unavailable - proceeding without it');
      }
    } catch (err) {
      console.error('[Auth] Error adding CSRF token:', err);
    }
  }
  
  console.log('[Request]', config.method?.toUpperCase(), config.url, {
    withCredentials: config.withCredentials,
    csrfToken: config.headers['X-CSRF-Token'] ? 'present' : 'absent'
  });
  
  return config;
}, (err) => {
  console.error('[Request Interceptor Error]', err);
  return Promise.reject(err);
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const errorData = error.response?.data;
    const iscsrf = errorData?.error?.toLowerCase().includes('csrf') || 
                   errorData?.message?.toLowerCase().includes('csrf') ||
                   status === 403;

    // Log response errors
    console.error('[Response Error]', {
      status,
      isCSRF: iscsrf,
      message: errorData?.error || errorData?.message || error.message,
      url: originalRequest?.url
    });

    // Handle CSRF token errors with retry on mobile
    if (iscsrf && originalRequest && !originalRequest._csrfRetry) {
      console.log('[CSRF Error] Retrying with fresh CSRF token...');
      originalRequest._csrfRetry = true;
      
      try {
        // Clear cache and get fresh token
        clearCsrfCache();
        const freshToken = await getCsrfToken(true);
        
        if (freshToken) {
          originalRequest.headers['X-CSRF-Token'] = freshToken;
          console.log('[CSRF Error] Retrying request with fresh token');
          return api(originalRequest);
        }
      } catch (err) {
        console.error('[CSRF Error] Failed to retry:', err);
      }
    }

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
