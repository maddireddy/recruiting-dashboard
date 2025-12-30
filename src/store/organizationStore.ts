import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PlanTier = 'freemium' | 'starter' | 'pro' | 'enterprise';

export interface PlanLimits {
  maxUsers: number;
  maxCandidates: number;
  maxJobs: number;
  maxActiveJobs: number;
  features: string[];
}

export interface OrganizationConfig {
  id: string;
  name: string;
  subdomain: string;
  logo?: string;
  brandColor: string;
  website?: string;
  industry?: string;
  employeeCount?: string;
  planTier: PlanTier;
  planLimits: PlanLimits;
  billingInterval: 'monthly' | 'yearly';
  createdAt: string;
  settings?: Record<string, any>;
}

interface OrganizationState {
  organization: OrganizationConfig | null;
  isLoading: boolean;
  error: string | null;
  setOrganization: (org: OrganizationConfig) => void;
  updateOrganization: (updates: Partial<OrganizationConfig>) => void;
  clearOrganization: () => void;
  hasFeature: (feature: string) => boolean;
}

// Default plan limits
export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  freemium: {
    maxUsers: 5,
    maxCandidates: 100,
    maxJobs: 5,
    maxActiveJobs: 3,
    features: ['basic-ats', 'email-templates', 'basic-reports'],
  },
  starter: {
    maxUsers: 15,
    maxCandidates: 1000,
    maxJobs: 50,
    maxActiveJobs: 20,
    features: [
      'basic-ats',
      'email-templates',
      'basic-reports',
      'custom-pipeline',
      'advanced-search',
      'calendar-sync',
      'custom-workflows',
    ],
  },
  pro: {
    maxUsers: -1, // unlimited
    maxCandidates: -1,
    maxJobs: -1,
    maxActiveJobs: -1,
    features: [
      'basic-ats',
      'email-templates',
      'basic-reports',
      'custom-pipeline',
      'advanced-search',
      'calendar-sync',
      'custom-workflows',
      'ai-resume-parser',
      'ai-jd-generator',
      'semantic-search',
      'internal-chat',
      'advanced-analytics',
      'white-label',
      'api-access',
      'sms-campaigns',
      'interview-intelligence',
      'talent-pools',
      'offer-management',
    ],
  },
  enterprise: {
    maxUsers: -1,
    maxCandidates: -1,
    maxJobs: -1,
    maxActiveJobs: -1,
    features: [
      'basic-ats',
      'email-templates',
      'basic-reports',
      'custom-pipeline',
      'advanced-search',
      'calendar-sync',
      'custom-workflows',
      'ai-resume-parser',
      'ai-jd-generator',
      'semantic-search',
      'internal-chat',
      'advanced-analytics',
      'white-label',
      'api-access',
      'sms-campaigns',
      'interview-intelligence',
      'talent-pools',
      'offer-management',
      'sso',
      'dedicated-support',
      'custom-integrations',
      'audit-logs',
      'compliance',
    ],
  },
};

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set, get) => ({
      organization: null,
      isLoading: false,
      error: null,
      setOrganization: (org) => set({ organization: org, isLoading: false, error: null }),
      updateOrganization: (updates) =>
        set((state) => ({
          organization: state.organization
            ? { ...state.organization, ...updates }
            : null,
        })),
      clearOrganization: () => set({ organization: null, isLoading: false, error: null }),
      hasFeature: (feature) => {
        const org = get().organization;
        return org?.planLimits.features.includes(feature) ?? false;
      },
    }),
    {
      name: 'organization-storage',
    }
  )
);
