import api from './api';

export const authService = {
  login: async (email: string, password: string, tenantId: string) => {
    try {
      const response = await api.post('/auth/login', { email, password, tenantId });
      const { accessToken, refreshToken, userId, role, user } = response.data || {};

      if (accessToken) localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      if (userId) localStorage.setItem('userId', userId);
      if (tenantId) localStorage.setItem('tenantId', tenantId);
      if (role) localStorage.setItem('role', role);

      // Return a User-like object for the store
      return user ?? { id: userId ?? 'u_dev', email, name: 'Dev User', role: role ?? 'ADMIN' };
    } catch (err) {
      // Dev fallback when backend is unavailable
      if (import.meta.env.DEV) {
        const fakeAccess = 'dev-access-token';
        const fakeRefresh = 'dev-refresh-token';
        localStorage.setItem('accessToken', fakeAccess);
        localStorage.setItem('refreshToken', fakeRefresh);
        localStorage.setItem('userId', 'u_dev');
        localStorage.setItem('tenantId', tenantId || 'tenant_dev');
        localStorage.setItem('role', 'ADMIN');
        return { id: 'u_dev', email, name: 'Dev User', role: 'ADMIN' };
      }
      throw err;
    }
  },
  
  refresh: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await api.post('/auth/refresh', { refreshToken });
    const { accessToken } = response.data;
    
    localStorage.setItem('accessToken', accessToken);
    return accessToken;
  },
  
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        // Attempt to invalidate the refresh token on the server
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.clear();
      window.location.href = '/login';
    }
  },
};
