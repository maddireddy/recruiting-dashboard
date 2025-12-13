import api from './api';
import type { Document } from '../types/document';

export const documentService = {
  getAll: async (page = 0, size = 50, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.get<{ content: Document[] }>(`/documents?page=${page}&size=${size}`, { headers });
      if (import.meta.env.DEV) {
        console.debug('[documentService.getAll] response', resp.data);
      }
      return resp.data.content || [];
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[documentService.getAll] error', error?.response?.status, error?.message);
      }
      return [];
    }
  },

  getById: async (id: string, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.get<Document>(`/documents/${id}`, { headers });
      if (import.meta.env.DEV) {
        console.debug('[documentService.getById] response', resp.data);
      }
      return resp.data;
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[documentService.getById] error', error?.response?.status, error?.message);
      }
      throw error;
    }
  },

  getByEntity: async (entityId: string, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.get<Document[]>(`/documents/entity/${entityId}`, { headers });
      if (import.meta.env.DEV) {
        console.debug('[documentService.getByEntity] response', resp.data);
      }
      return resp.data || [];
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[documentService.getByEntity] error', error?.response?.status, error?.message);
      }
      return [];
    }
  },

  getByEntityType: async (entityType: string, entityId: string, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.get<Document[]>(`/documents/entity/${entityType}/${entityId}`, { headers });
      if (import.meta.env.DEV) {
        console.debug('[documentService.getByEntityType] response', resp.data);
      }
      return resp.data || [];
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[documentService.getByEntityType] error', error?.response?.status, error?.message);
      }
      return [];
    }
  },

  upload: async (formData: FormData, tenantId?: string) => {
    const headers: Record<string, string> = { 'Content-Type': 'multipart/form-data' };
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.post<Document>('/documents', formData, { headers });
      if (import.meta.env.DEV) {
        console.debug('[documentService.upload] response', resp.data);
      }
      return resp.data;
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[documentService.upload] error', error?.response?.status, error?.message);
      }
      throw error;
    }
  },

  download: async (id: string) => {
    const token = localStorage.getItem('accessToken');
    const tenantId = localStorage.getItem('tenantId');
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8084/api';
    if (!token || token === 'null' || token === 'undefined') {
      alert('Authentication token missing. Please log in again to download documents.');
      return;
    }
    try {
      const resp = await fetch(`${baseUrl}/documents/download/${id}?token=${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: tenantId ? { 'X-Tenant-Id': tenantId } : {},
      });
      if (!resp.ok) {
        let errorMsg = 'Failed to download document.';
        const errorBody = await resp.text();
        if (errorBody) {
          try {
            const errorJson = JSON.parse(errorBody) as { message?: string };
            errorMsg = errorJson.message || errorMsg;
          } catch {
            errorMsg = errorBody;
          }
        }
        alert(errorMsg);
        return;
      }
      const blob = await resp.blob();
      // Prefer X-Download-Filename, fallback to Content-Disposition, then default
      let filename = resp.headers.get('X-Download-Filename') || '';
      if (!filename) {
        const disposition = resp.headers.get('Content-Disposition');
        if (disposition) {
          const match = disposition.match(/filename\*?=(?:UTF-8''|"?)([^";\n]*)/);
          if (match) filename = decodeURIComponent(match[1]);
        }
      }
      if (!filename) filename = 'download';
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(objectUrl);
      link.remove();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download document.');
    }
  },

  // Fetch blob and filename for inline preview (returns { blob, filename, contentType })
  fetchBlob: async (id: string) => {
    const token = localStorage.getItem('accessToken');
    const tenantId = localStorage.getItem('tenantId');
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8084/api';
    if (!token || token === 'null' || token === 'undefined') {
      throw new Error('Authentication token missing');
    }
    const resp = await fetch(`${baseUrl}/documents/download/${id}?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: tenantId ? { 'X-Tenant-Id': tenantId } : {},
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(text || 'Failed to fetch document');
    }
    const blob = await resp.blob();
    let filename = resp.headers.get('X-Download-Filename') || '';
    if (!filename) {
      const disposition = resp.headers.get('Content-Disposition');
      if (disposition) {
        const match = disposition.match(/filename\*?=(?:UTF-8''|"?)([^";\n]*)/);
        if (match) filename = decodeURIComponent(match[1]);
      }
    }
    const contentType = resp.headers.get('Content-Type') || blob.type || '';
    return { blob, filename: filename || 'document', contentType };
  },

  delete: async (id: string, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      await api.delete(`/documents/${id}`, { headers });
      if (import.meta.env.DEV) {
        console.debug('[documentService.delete] deleted', id);
      }
      return id;
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[documentService.delete] error', error?.response?.status, error?.message);
      }
      throw error;
    }
  }
};
