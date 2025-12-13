export interface DiversityBreakdownItem {
  label: string; // e.g., Gender: Female
  value: number; // percentage or count
}

export interface DiversityBreakdown {
  id: string;
  category: string; // e.g., Gender, Ethnicity, VeteranStatus
  type: 'percentage' | 'count';
  items: DiversityBreakdownItem[];
  updatedAt?: string;
}

export interface DiversitySummary {
  totalCandidates?: number;
  last30DaysHires?: number;
  underrepresentedPercent?: number;
  updatedAt?: string;
}
