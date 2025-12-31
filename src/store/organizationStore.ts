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
      'internal-chat',
      'timesheet-management',
      'invoice-management',
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
      'internal-chat',
      'timesheet-management',
      'invoice-management',
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
        // Merge persisted plan limits with latest defaults so new features are not locked out
        if (!org) {
          return PLAN_LIMITS.pro.features.includes(feature);
        }

        const baseFeatures = PLAN_LIMITS[org.planTier]?.features ?? [];
        const orgFeatures = org.planLimits?.features ?? [];
        const merged = new Set([...baseFeatures, ...orgFeatures]);

        return merged.has(feature);
      },
    }),
    {
      name: 'organization-storage',
    }
  )
);

/**
 * Initialize organization with default testing data if none exists
 * This is useful for development and testing
 * Sets plan to 'pro' for full feature access during development
 */
export function initializeDefaultOrganization() {
  const store = useOrganizationStore.getState();

  if (!store.organization) {
    const defaultOrg: OrganizationConfig = {
      id: 'default-org-123',
      name: 'Demo Organization',
      subdomain: 'demo',
      brandColor: '#3b82f6',
      planTier: 'pro', // Set to 'pro' for full feature access during testing
      planLimits: PLAN_LIMITS.pro,
      billingInterval: 'monthly',
      createdAt: new Date().toISOString(),
      settings: {
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        currency: 'USD',
      },
    };

    store.setOrganization(defaultOrg);
    console.log('[OrganizationStore] Initialized with default organization:', defaultOrg.name, '- Plan:', defaultOrg.planTier);
  }
}
