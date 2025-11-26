import api from './api';
import type { Report, ReportExecution } from '../types/report';

export const reportService = {
  // Report CRUD
  getAll: (page = 0, size = 20) => 
    api.get<{ content: Report[] }>(`/reports?page=${page}&size=${size}`),
  
  getById: (id: string) => 
    api.get<Report>(`/reports/${id}`),
  
  getByType: (reportType: string) => 
    api.get<Report[]>(`/reports/type/${reportType}`),
  
  create: (report: Partial<Report>) => 
    api.post<Report>('/reports', report),
  
  update: (id: string, report: Partial<Report>) => 
    api.put<Report>(`/reports/${id}`, report),
  
  delete: (id: string) => 
    api.delete(`/reports/${id}`),
  
  // Execute Report
  execute: (id: string) => 
    api.get<Array<Record<string, any>>>(`/reports/${id}/execute`),
  
  getExecutionHistory: (id: string) => 
    api.get<ReportExecution[]>(`/reports/${id}/executions`),
  
  // CSV Export
  exportReportCSV: (id: string) => {
    const token = localStorage.getItem('token');
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8083/api';
    window.open(`${baseUrl}/reports/${id}/export-csv?token=${token}`, '_blank');
  },
  
  exportCandidatesCSV: () => {
    const token = localStorage.getItem('token');
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8083/api';
    window.location.href = `${baseUrl}/reports/exports/candidates?token=${token}`;
  },
  
  exportJobsCSV: () => {
    const token = localStorage.getItem('token');
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8083/api';
    window.location.href = `${baseUrl}/reports/exports/jobs?token=${token}`;
  },
  
  exportSubmissionsCSV: () => {
    const token = localStorage.getItem('token');
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8083/api';
    window.location.href = `${baseUrl}/reports/exports/submissions?token=${token}`;
  }
};
