import api from './api';
import type { DiversityBreakdown, DiversitySummary } from '../types/diversityMetrics';

export const diversityMetricsService = {
  async getSummary(tenantId?: string): Promise<DiversitySummary> {
    const res = await api.get('/diversity-metrics/summary', {
      headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined,
    });
    return res.data;
  },

  async getBreakdowns(tenantId?: string): Promise<DiversityBreakdown[]> {
    const res = await api.get('/diversity-metrics/breakdowns', {
      headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined,
    });
    return res.data;
  },
};
