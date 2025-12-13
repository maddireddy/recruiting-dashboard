export interface EeoRecord {
  id: string;
  candidateId: string;
  gender?: string;
  ethnicity?: string;
  veteranStatus?: string;
  disabilityStatus?: string;
  collectedAt: string; // ISO
  source?: string; // application, survey, import
}

export interface EeoAggregateItem {
  label: string;
  count: number;
  percent?: number;
}

export interface EeoReport {
  byGender: EeoAggregateItem[];
  byEthnicity: EeoAggregateItem[];
  byVeteranStatus: EeoAggregateItem[];
  byDisabilityStatus: EeoAggregateItem[];
  generatedAt: string;
}
