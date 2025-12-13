export interface MarketStatPoint {
  date: string; // ISO
  value: number;
}

export interface MarketTrend {
  id: string;
  name: string;
  series: MarketStatPoint[];
}

export interface MarketSummary {
  region?: string;
  role?: string;
  avgSalary?: number;
  openings?: number;
  timeToHireDays?: number;
  updatedAt?: string;
}
