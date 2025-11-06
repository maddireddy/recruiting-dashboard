export interface Job {
  id: string;
  tenantId: string;
  title: string;
  client: string;
  location: string;
  jobType: 'FULL_TIME' | 'CONTRACT' | 'CONTRACT_TO_HIRE';
  status: 'OPEN' | 'IN_PROGRESS' | 'INTERVIEW' | 'OFFERED' | 'CLOSED';
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minExperience: number;
  maxExperience: number;
  rateMin: number;
  rateMax: number;
  rateCurrency: string;
  startDate: string;
  endDate: string;
  openings: number;
  submissionsCount: number;
  interviewsCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type JobStatus = Job['status'];
