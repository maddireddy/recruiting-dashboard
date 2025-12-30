import api from './api';
import type { Scorecard, ScorecardCreate, ScorecardUpdate } from '../types/scorecard';

const resource = '/scorecards';

export async function listScorecards(tenantId?: string): Promise<Scorecard[]> {
  const params = tenantId ? { tenantId } : {};
  const { data } = await api.get(resource, { params });
  return data;
}

export async function getScorecard(id: string, tenantId?: string): Promise<Scorecard> {
  const params = tenantId ? { tenantId } : {};
  const { data } = await api.get(`${resource}/${id}`, { params });
  return data;
}

export async function createScorecard(payload: ScorecardCreate, tenantId?: string): Promise<Scorecard> {
  const body = tenantId ? { ...payload, tenantId } : payload;
  const { data } = await api.post(resource, body);
  return data;
}

export async function updateScorecard(payload: ScorecardUpdate, tenantId?: string): Promise<Scorecard> {
  const { id, ...rest } = payload;
  const body = tenantId ? { ...rest, tenantId } : rest;
  const { data } = await api.put(`${resource}/${id}`, body);
  return data;
}

export async function deleteScorecard(id: string, tenantId?: string): Promise<string> {
  const params = tenantId ? { tenantId } : {};
  await api.delete(`${resource}/${id}`, { params });
  return id;
}
