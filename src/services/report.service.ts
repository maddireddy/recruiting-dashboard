import api from './api';
import type { Report, ReportExecution } from '../types/report';

const triggerDownload = (blob: Blob, filename: string) => {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
};

const resolveFilename = (headerValue: string | undefined, fallback: string) => {
  if (!headerValue) return fallback;

  // RFC 6266 filename* takes precedence when available (e.g. filename*=UTF-8''encoded)
  const utf8Match = headerValue.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }

  const quotedMatch = headerValue.match(/filename="?([^";]+)"?/i);
  if (quotedMatch?.[1]) {
    return quotedMatch[1];
  }

  return fallback;
};

const downloadCsv = async (path: string, fallbackFilename: string) => {
  const response = await api.get<Blob>(path, {
    responseType: 'blob',
  });

  const disposition = (response.headers['content-disposition'] || response.headers['Content-Disposition']) as string | undefined;
  const filename = resolveFilename(disposition, fallbackFilename);
  const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: 'text/csv;charset=utf-8' });
  triggerDownload(blob, filename);
};

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
    api.get<Record<string, unknown>[]>(`/reports/${id}/execute`),
  
  getExecutionHistory: (id: string) => 
    api.get<ReportExecution[]>(`/reports/${id}/executions`),
  
  // CSV Export
  exportReportCSV: async (id: string) => downloadCsv(`/reports/${id}/export-csv`, `report-${id}.csv`),
  
  exportCandidatesCSV: async () => downloadCsv('/reports/exports/candidates', 'candidates-export.csv'),
  
  exportJobsCSV: async () => downloadCsv('/reports/exports/jobs', 'jobs-export.csv'),
  
  exportSubmissionsCSV: async () => downloadCsv('/reports/exports/submissions', 'submissions-export.csv')
};
