export type CustomReport = {
  id: string;
  name: string;
  description?: string;
  filters: Record<string, any>;
  createdAt?: string;
};

export type CustomReportResultRow = Record<string, any>;

export type CustomReportCreate = Omit<CustomReport, 'id' | 'createdAt'>;
export type CustomReportUpdate = Partial<Omit<CustomReport, 'id'>> & { id: string };
