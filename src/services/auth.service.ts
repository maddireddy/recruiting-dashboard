import api from './api';

export const authService = {
  login: async (email: string, password: string, tenantId: string) => {
    const response = await api.post('/auth/login', { email, password, tenantId });
    const { accessToken, refreshToken, userId, role } = response.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userId', userId);
    localStorage.setItem('tenantId', tenantId);
    localStorage.setItem('role', role);
    
    return response.data;
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
