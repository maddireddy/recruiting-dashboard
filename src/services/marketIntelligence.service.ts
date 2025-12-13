import api from './api';
import type { MarketTrend, MarketSummary } from '../types/marketIntelligence';

export const marketIntelligenceService = {
  async getSummary(params: { region?: string; role?: string }, tenantId?: string): Promise<MarketSummary> {
    const res = await api.get('/market-intelligence/summary', {
      params,
      headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined,
    });
    return res.data;
  },

  async getTrends(params: { region?: string; role?: string }, tenantId?: string): Promise<MarketTrend[]> {
    const res = await api.get('/market-intelligence/trends', {
      params,
      headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined,
    });
    return res.data;
  },
};
