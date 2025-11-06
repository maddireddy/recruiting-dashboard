export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  tenantId: string;
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  visaStatus: string;
  primarySkills: string[];
  secondarySkills?: string[];
  totalExperience: number;
  availability: string;
  status: string;
  currentLocation?: {
    city: string;
    state: string;
    country: string;
  };
  rateExpectation?: {
    hourly: number;
    currency: string;
    negotiable: boolean;
  };
  resumeUrl?: string;
  linkedInUrl?: string;
  createdAt?: string;
}

export interface Stats {
  total: number;
  active: number;
  available?: number;
  placed?: number;
}

export interface PageData<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// Re-export detailed types
export * from './candidate';
