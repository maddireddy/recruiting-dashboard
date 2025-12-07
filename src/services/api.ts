import axios, {
  AxiosHeaders,
  type AxiosHeaderValue,
  type AxiosRequestConfig,
  type AxiosResponse,
  type RawAxiosRequestHeaders,
} from 'axios';

// Use Vite environment variable if provided, otherwise use relative `/api` so
// Vite dev server proxy (configured in vite.config.ts) can forward requests
// to the backend and avoid CORS during development.
const baseURL = (import.meta.env.VITE_API_URL as string) ?? '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for cookie-based auth and CORS
});

const ensureHeaders = (headers?: AxiosRequestConfig['headers']): AxiosHeaders => {
  if (headers instanceof AxiosHeaders) return headers;
  if (!headers) return new AxiosHeaders();

  const next = new AxiosHeaders();

  if (typeof headers === 'string') {
    next.set('Authorization', headers);
    return next;
  }

  if (Array.isArray(headers)) {
    headers.forEach(([key, value]) => {
      if (key && value !== undefined && value !== null) {
        next.set(key, value as AxiosHeaderValue);
      }
    });
    return next;
  }

  const source = headers as RawAxiosRequestHeaders;
  (Object.entries(source) as Array<[string, AxiosHeaderValue | undefined]>).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      next.set(key, value);
    }
  });

  return next;
};

// --- Auth refresh single-flight + request queue ---
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;
type Subscriber = (token: string) => void;
type ErrorSubscriber = (error: Error) => void;
const successSubscribers: Subscriber[] = [];
const errorSubscribers: ErrorSubscriber[] = [];

function subscribeTokenRefresh(cb: Subscriber) {
  successSubscribers.push(cb);
}

function subscribeTokenRefreshError(cb: ErrorSubscriber) {
  errorSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  successSubscribers.splice(0).forEach((cb) => cb(token));
}

function onTokenRefreshError(err: Error) {
  errorSubscribers.splice(0).forEach((cb) => cb(err));
}

async function refreshAccessToken(): Promise<string> {
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  const rt = localStorage.getItem('refreshToken');
  const tenantId = localStorage.getItem('tenantId');
  if (!rt) {
    isRefreshing = false;
    throw new Error('No refresh token available');
  }

  const doRefresh = api.post('/auth/refresh', { refreshToken: rt }, {
    // Ensure tenant header is sent if available
    headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined,
  }).then((res) => {
    const { token: newToken, refreshToken: newRefreshToken } = res.data || {};
    if (!newToken) throw new Error('Refresh returned no token');
    localStorage.setItem('accessToken', newToken);
    if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
    return newToken as string;
  });

  refreshPromise = doRefresh
    .then((t) => {
      onTokenRefreshed(t);
      return t;
    })
    .catch((e) => {
      onTokenRefreshError(e);
      throw e;
    })
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise;
}

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken') || '';
    const tenantId = localStorage.getItem('tenantId') || '';
    const userId = localStorage.getItem('userId') || '';

    // Always attach tenant header if present (even for auth endpoints)
    const headers = ensureHeaders(config.headers);

    if (tenantId) {
      headers.set('X-Tenant-Id', tenantId);
      headers.set('X-Tenant-ID', tenantId);
    }

    if (userId) {
      headers.set('X-User-Id', userId);
      headers.set('X-User-ID', userId);
    }

    // Attach Authorization for non-auth endpoints only when token is present
    const isAuthEndpoint = Boolean(config.url && config.url.includes('/auth/'));
    if (!isAuthEndpoint) {
      if (!token) {
        // Avoid sending requests with undefined Bearer; redirect to login by rejecting
        return Promise.reject(new Error('Missing access token'));
      }
      const tokenValue = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      headers.set('Authorization', tokenValue);
    }

    config.headers = headers;

    if (import.meta.env.DEV) {
      try {
        const snapshot = headers.toJSON() as Record<string, string>;
  if (snapshot.Authorization) snapshot.Authorization = 'Bearer ***';
  if (snapshot['X-Tenant-Id']) snapshot['X-Tenant-Id'] = '***';
  if (snapshot['X-Tenant-ID']) snapshot['X-Tenant-ID'] = '***';
        if (snapshot['X-User-Id']) snapshot['X-User-Id'] = '***';
        if (snapshot['X-User-ID']) snapshot['X-User-ID'] = '***';
        console.debug('[api][request]', {
          method: config.method,
          url: config.url,
          headers: snapshot,
        });
      } catch {
        // Ignore logging errors
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  async (response) => {
    // If backend hints token expiry via header, proactively refresh (single-flight)
    if (response.headers['x-token-expired'] === 'true') {
      try {
        const newToken = await refreshAccessToken();
        const originalRequest = response.config as AxiosRequestConfig;
        return await api({
          ...originalRequest,
          headers: {
            ...(originalRequest.headers || {}),
            Authorization: `Bearer ${newToken}`,
          },
        });
      } catch (e) {
        if (import.meta.env.DEV) console.debug('[api] proactive refresh failed', e);
        // fall-through: return original response
        return response;
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (import.meta.env.DEV) {
      console.debug('[api][error]', {
        url: originalRequest?.url,
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    // Avoid loops
    const isRefresh = originalRequest?.url?.includes('/auth/refresh');
    const isLogin = originalRequest?.url?.includes('/auth/login');
    if (isRefresh || isLogin) {
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle 401/403 by queueing retries behind a single refresh
    if (error.response?.status === 401 || error.response?.status === 403) {
      try {
        if (originalRequest._retry) {
          // Already retried once; bail to login
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        const retryPromise = new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            // Retry with the new token
            const headers = { ...(originalRequest.headers || {}), Authorization: `Bearer ${token}` };
            resolve(api({ ...originalRequest, headers }));
          });
          subscribeTokenRefreshError((err) => reject(err));
        });

        await refreshAccessToken();
        return retryPromise as unknown as Promise<AxiosResponse>;
      } catch (e) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
