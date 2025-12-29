export interface User {
  id: string;
  email: string;
  fullName?: string;
  role: 'ADMIN' | 'RECRUITER' | 'HIRING_MANAGER' | 'INTERVIEWER';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
