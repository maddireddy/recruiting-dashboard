import api from './api';
import { CSRFTokenManager } from '../utils/security';

/**
 * Authentication Service
 *
 * PRODUCTION: Uses httpOnly cookies for JWT tokens (immune to XSS)
 * DEVELOPMENT: Falls back to localStorage for easier debugging
 *
 * Security features:
 * - httpOnly cookies for tokens (set by backend)
 * - CSRF protection via XSRF-TOKEN
 * - Automatic token refresh
 */
export const authService = {
  login: async (email: string, password: string, tenantId: string) => {
    try {
      const response = await api.post('/auth/login', { email, password, tenantId });
      const { accessToken, refreshToken, userId, role, user, csrfToken } = response.data || {};

      // PRODUCTION: Tokens are in httpOnly cookies (set by backend)
      // DEVELOPMENT: Store in localStorage for debugging
      if (import.meta.env.DEV) {
        if (accessToken) localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      }

      // Store non-sensitive user data (always needed)
      if (userId) localStorage.setItem('userId', userId);
      if (tenantId) localStorage.setItem('tenantId', tenantId);
      if (role) localStorage.setItem('role', role);

      // Store CSRF token for request headers
      if (csrfToken) {
        CSRFTokenManager.getInstance().setToken(csrfToken);
      }

      if (import.meta.env.DEV) {
        console.log('[Auth] Login successful', {
          userId,
          role,
          hasCsrfToken: !!csrfToken,
          cookiesEnabled: document.cookie.length > 0,
        });
      }

      // Return a User-like object for the store
      return user ?? { id: userId ?? 'u_dev', email, name: 'Dev User', role: role ?? 'ADMIN' };
    } catch (err) {
      // Dev fallback when backend is unavailable
      if (import.meta.env.DEV) {
        console.warn('[Auth] Backend unavailable, using dev fallback');
        const fakeAccess = 'dev-access-token';
        const fakeRefresh = 'dev-refresh-token';
        localStorage.setItem('accessToken', fakeAccess);
        localStorage.setItem('refreshToken', fakeRefresh);
        localStorage.setItem('userId', 'u_dev');
        localStorage.setItem('tenantId', tenantId || 'tenant_dev');
        localStorage.setItem('role', 'ADMIN');

        // Set fake CSRF token for development
        CSRFTokenManager.getInstance().setToken('dev-csrf-token');

        return { id: 'u_dev', email, name: 'Dev User', role: 'ADMIN' };
      }
      throw err;
    }
  },

  refresh: async () => {
    // PRODUCTION: refreshToken is in httpOnly cookie, backend reads it automatically
    // DEVELOPMENT: Send refresh token from localStorage
    if (import.meta.env.DEV) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/auth/refresh', { refreshToken });
      const { accessToken, token, csrfToken } = response.data;

      // Backend may return 'token' or 'accessToken'
      const newToken = accessToken || token;
      if (newToken) {
        localStorage.setItem('accessToken', newToken);
      }

      // Update CSRF token if provided
      if (csrfToken) {
        CSRFTokenManager.getInstance().setToken(csrfToken);
      }

      return newToken;
    }

    // Production: Just call refresh endpoint, cookies are sent automatically
    const response = await api.post('/auth/refresh', {});
    const { csrfToken } = response.data || {};

    // Update CSRF token if provided
    if (csrfToken) {
      CSRFTokenManager.getInstance().setToken(csrfToken);
    }

    return 'refreshed'; // Token is in cookie, we don't need to return it
  },

  logout: async () => {
    try {
      // Call backend logout endpoint to invalidate tokens
      // In production, httpOnly cookies are sent automatically
      // In development, we send the refresh token explicitly
      const payload = import.meta.env.DEV
        ? { refreshToken: localStorage.getItem('refreshToken') }
        : {};

      await api.post('/auth/logout', payload);

      if (import.meta.env.DEV) {
        console.log('[Auth] Logout successful');
      }
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      // Continue with local cleanup even if server logout fails
    } finally {
      // Clear all local storage
      localStorage.clear();
      sessionStorage.clear();

      // Clear CSRF token
      CSRFTokenManager.getInstance().setToken('');

      // Redirect to login
      window.location.href = '/login';
    }
  },
};
