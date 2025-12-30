export interface ScorecardCriteria {
  name: string;
  description?: string;
  weight: number; // 1-10
  maxScore: number; // typically 5 or 10
}

export interface Scorecard {
  id: string;
  name: string;
  description?: string;
  role?: string;
  criteria: ScorecardCriteria[];
  totalWeight?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type ScorecardCreate = Omit<Scorecard, 'id' | 'createdAt' | 'updatedAt'>;
export type ScorecardUpdate = Partial<Omit<Scorecard, 'id'>> & { id: string };
