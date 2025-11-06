export interface RateExpectation {
  hourly?: number;
  currency?: string;
  negotiable?: boolean;
  lastUpdated?: string | null;
}

export interface Candidate {
  id: string;
  tenantId?: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  alternatePhone?: string | null;
  visaStatus?: string | null;
  visaExpiryDate?: string | null;
  needsSponsorship?: boolean | null;
  currentLocation?: string | null;
  preferredLocations?: string[] | null;
  willingToRelocate?: boolean | null;
  totalExperience?: number | null;
  relevantExperience?: number | null;
  currentEmployer?: string | null;
  currentJobTitle?: string | null;
  primarySkills?: string[] | null;
  secondarySkills?: string[] | null;
  certifications?: string[] | null;
  availability?: string | null;
  availableFrom?: string | null;
  preferredJobType?: string | null;
  preferredWorkMode?: string | null;
  rateExpectation?: RateExpectation | null;
  resumeUrl?: string | null;
  portfolioUrl?: string | null;
  linkedInUrl?: string | null;
  githubUrl?: string | null;
  source?: string | null;
  referredBy?: string | null;
  recruiterAssigned?: string | null;
  preferredContactMethod?: string | null;
  bestTimeToCall?: string | null;
  timeZone?: string | null;
  status?: string | null;
  lastContacted?: string | null;
  lastContactedBy?: string | null;
  tags?: string[] | null;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  createdBy?: string | null;
}

export type CandidateListResponse = {
  content: Candidate[];
  pageable?: any;
  totalPages?: number;
  totalElements?: number;
  size?: number;
  number?: number;
};
