export type SilverMedalist = {
  id: string;
  candidateId: string;
  candidateName?: string;
  jobId: string;
  jobTitle?: string;
  status: 'contacted' | 'pending' | 'reengaged' | 'archived';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SilverMedalistCreate = Omit<SilverMedalist, 'id' | 'createdAt' | 'updatedAt'>;
export type SilverMedalistUpdate = Partial<Omit<SilverMedalist, 'id'>> & { id: string };
