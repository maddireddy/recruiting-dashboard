import api from './api';

export interface AdminUser {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  department?: string;
  roles: string[];
  permissions: string[];
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

const getHeaders = (tenantId?: string) => {
  const token = localStorage.getItem('token');
  const headers: any = { 'Authorization': `Bearer ${token}` };
  if (tenantId) headers['X-Tenant-ID'] = tenantId;
  return headers;
};

export async function listUsers(tenantId?: string): Promise<AdminUser[]> {
  try {
    const { data } = await api.get('/api/users', {
      headers: getHeaders(tenantId)
    });
    return Array.isArray(data) ? data : data?.content || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function getUser(id: string, tenantId?: string): Promise<AdminUser | null> {
  try {
    const { data } = await api.get(`/api/users/${id}`, {
      headers: getHeaders(tenantId)
    });
    return data;
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    return null;
  }
}

export async function createUser(user: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>, tenantId?: string): Promise<AdminUser> {
  try {
    const { data } = await api.post('/api/users', user, {
      headers: getHeaders(tenantId)
    });
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function updateUser(id: string, user: Partial<AdminUser>, tenantId?: string): Promise<AdminUser> {
  try {
    const { data } = await api.put(`/api/users/${id}`, user, {
      headers: getHeaders(tenantId)
    });
    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function deleteUser(id: string, tenantId?: string): Promise<void> {
  try {
    await api.delete(`/api/users/${id}`, {
      headers: getHeaders(tenantId)
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

export async function inviteUser(email: string, roles: string[], tenantId?: string): Promise<AdminUser> {
  try {
    const { data } = await api.post('/api/users/invite', { email, roles }, {
      headers: getHeaders(tenantId)
    });
    return data;
  } catch (error) {
    console.error('Error inviting user:', error);
    throw error;
  }
}
