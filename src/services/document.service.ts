import api from './api';
import type { Document } from '../types/document';

export const documentService = {
  getAll: (page = 0, size = 50) => 
    api.get<{ content: Document[] }>(`/documents?page=${page}&size=${size}`),

  getById: (id: string) => 
    api.get<Document>(`/documents/${id}`),

  getByEntity: (entityId: string) => 
    api.get<Document[]>(`/documents/entity/${entityId}`),

  getByEntityType: (entityType: string, entityId: string) => 
    api.get<Document[]>(`/documents/entity/${entityType}/${entityId}`),

  upload: (formData: FormData) => 
    api.post<Document>('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  download: async (id: string) => {
    const token = localStorage.getItem('accessToken');
    const tenantId = localStorage.getItem('tenantId');
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8083/api';
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
        try {
          const errorJson = await resp.json();
          errorMsg = errorJson.message || errorMsg;
        } catch {}
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
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8083/api';
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

  delete: (id: string) => 
    api.delete(`/documents/${id}`)
};
