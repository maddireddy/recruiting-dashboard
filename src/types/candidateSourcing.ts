export type SourcingStatus = 'pending' | 'in-progress' | 'completed' | 'paused';

export interface CandidateSourcingTask {
  id: string;
  title: string;
  description?: string;
  ownerId?: string;
  status: SourcingStatus;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}
