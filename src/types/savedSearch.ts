export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}
