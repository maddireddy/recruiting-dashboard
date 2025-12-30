/**
 * Feature Map Configuration
 * Maps application routes/pages to required subscription features
 * Used by FeatureGuard to control access based on organization plan tier
 */

export interface FeatureRequirement {
  feature: string;
  description: string;
  availableIn: string[]; // Plan tiers that have this feature
}

export const FEATURE_MAP: Record<string, FeatureRequirement> = {
  // Core ATS - Available in all plans
  '/': { feature: 'basic-ats', description: 'Dashboard access', availableIn: ['freemium', 'starter', 'pro', 'enterprise'] },
  '/candidates': { feature: 'basic-ats', description: 'Candidate management', availableIn: ['freemium', 'starter', 'pro', 'enterprise'] },
  '/jobs': { feature: 'basic-ats', description: 'Job management', availableIn: ['freemium', 'starter', 'pro', 'enterprise'] },
  '/interviews': { feature: 'basic-ats', description: 'Interview scheduling', availableIn: ['freemium', 'starter', 'pro', 'enterprise'] },
  '/submissions': { feature: 'basic-ats', description: 'Submission tracking', availableIn: ['freemium', 'starter', 'pro', 'enterprise'] },

  // Email - Basic in all, templates in starter+
  '/email-logs': { feature: 'basic-ats', description: 'Email history', availableIn: ['freemium', 'starter', 'pro', 'enterprise'] },
  '/email-templates': { feature: 'email-templates', description: 'Email templates', availableIn: ['freemium', 'starter', 'pro', 'enterprise'] },

  // Reporting - Basic in freemium, advanced in starter+
  '/reports': { feature: 'basic-reports', description: 'Basic reporting', availableIn: ['freemium', 'starter', 'pro', 'enterprise'] },
  '/custom-reports': { feature: 'advanced-analytics', description: 'Custom reports', availableIn: ['pro', 'enterprise'] },

  // Advanced Search - Starter+
  '/advanced-search': { feature: 'advanced-search', description: 'Advanced candidate search', availableIn: ['starter', 'pro', 'enterprise'] },
  '/saved-searches': { feature: 'advanced-search', description: 'Saved search queries', availableIn: ['starter', 'pro', 'enterprise'] },
  '/boolean-search-templates': { feature: 'advanced-search', description: 'Boolean search templates', availableIn: ['starter', 'pro', 'enterprise'] },

  // Talent Pools - Starter+
  '/talent-pools': { feature: 'talent-pools', description: 'Talent pool management', availableIn: ['pro', 'enterprise'] },
  '/silver-medalists': { feature: 'talent-pools', description: 'Silver medalist tracking', availableIn: ['pro', 'enterprise'] },

  // Offers - Starter+
  '/offers': { feature: 'offer-management', description: 'Offer management', availableIn: ['pro', 'enterprise'] },

  // AI Features - Pro+
  '/ai': { feature: 'ai-resume-parser', description: 'AI Lab', availableIn: ['pro', 'enterprise'] },
  '/ai/semantic-search': { feature: 'semantic-search', description: 'AI-powered semantic search', availableIn: ['pro', 'enterprise'] },
  '/ai/resume-parser': { feature: 'ai-resume-parser', description: 'AI resume parsing', availableIn: ['pro', 'enterprise'] },
  '/ai/jd-generator': { feature: 'ai-jd-generator', description: 'AI job description generator', availableIn: ['pro', 'enterprise'] },
  '/ai/rediscovery': { feature: 'ai-resume-parser', description: 'AI candidate rediscovery', availableIn: ['pro', 'enterprise'] },
  '/ai/talent-pool-matching': { feature: 'ai-resume-parser', description: 'AI talent pool matching', availableIn: ['pro', 'enterprise'] },
  '/ai/interview-intelligence': { feature: 'interview-intelligence', description: 'AI interview analysis', availableIn: ['pro', 'enterprise'] },

  // Interview Management - Pro+
  '/interview-guides': { feature: 'interview-intelligence', description: 'Interview guides', availableIn: ['pro', 'enterprise'] },
  '/interview-recordings': { feature: 'interview-intelligence', description: 'Interview recordings', availableIn: ['pro', 'enterprise'] },
  '/scorecards': { feature: 'interview-intelligence', description: 'Interview scorecards', availableIn: ['pro', 'enterprise'] },
  '/scheduling': { feature: 'calendar-sync', description: 'Interview scheduling', availableIn: ['starter', 'pro', 'enterprise'] },

  // SMS - Pro+
  '/sms': { feature: 'sms-campaigns', description: 'SMS campaigns', availableIn: ['pro', 'enterprise'] },
  '/sms/communications': { feature: 'sms-campaigns', description: 'SMS communications', availableIn: ['pro', 'enterprise'] },

  // Workflows - Starter+
  '/workflows': { feature: 'custom-workflows', description: 'Workflow automation', availableIn: ['starter', 'pro', 'enterprise'] },
  '/calendar-sync': { feature: 'calendar-sync', description: 'Calendar integration', availableIn: ['starter', 'pro', 'enterprise'] },

  // Candidate Experience - Pro+
  '/candidate-portal': { feature: 'white-label', description: 'Candidate portal', availableIn: ['pro', 'enterprise'] },
  '/onboarding': { feature: 'white-label', description: 'New hire onboarding', availableIn: ['pro', 'enterprise'] },

  // Analytics & Compliance - Pro+
  '/market-intelligence': { feature: 'advanced-analytics', description: 'Market intelligence', availableIn: ['pro', 'enterprise'] },
  '/diversity-metrics': { feature: 'advanced-analytics', description: 'Diversity metrics', availableIn: ['pro', 'enterprise'] },
  '/skills-assessments': { feature: 'advanced-analytics', description: 'Skills assessments', availableIn: ['pro', 'enterprise'] },
  '/eeo-data': { feature: 'advanced-analytics', description: 'EEO data tracking', availableIn: ['pro', 'enterprise'] },
  '/compliance': { feature: 'advanced-analytics', description: 'Compliance management', availableIn: ['pro', 'enterprise'] },

  // Administration - Basic in all, advanced in Pro+
  '/users': { feature: 'basic-ats', description: 'User management', availableIn: ['freemium', 'starter', 'pro', 'enterprise'] },
  '/settings': { feature: 'basic-ats', description: 'Settings', availableIn: ['freemium', 'starter', 'pro', 'enterprise'] },
  '/clients': { feature: 'basic-ats', description: 'Client management', availableIn: ['freemium', 'starter', 'pro', 'enterprise'] },
  '/vendors': { feature: 'basic-ats', description: 'Vendor management', availableIn: ['starter', 'pro', 'enterprise'] },
  '/billing': { feature: 'basic-ats', description: 'Billing & subscriptions', availableIn: ['freemium', 'starter', 'pro', 'enterprise'] },
  '/documents': { feature: 'basic-ats', description: 'Document management', availableIn: ['freemium', 'starter', 'pro', 'enterprise'] },
  '/audit-logs': { feature: 'api-access', description: 'Audit logs', availableIn: ['pro', 'enterprise'] },
  '/notifications': { feature: 'basic-ats', description: 'Notifications', availableIn: ['freemium', 'starter', 'pro', 'enterprise'] },

  // Configuration - Pro+
  '/jd-templates': { feature: 'ai-jd-generator', description: 'Job description templates', availableIn: ['freemium', 'starter', 'pro', 'enterprise'] },
  '/vendor-submittals': { feature: 'basic-ats', description: 'Vendor submittals', availableIn: ['starter', 'pro', 'enterprise'] },
  '/white-label': { feature: 'white-label', description: 'White label branding', availableIn: ['pro', 'enterprise'] },
  '/api-keys': { feature: 'api-access', description: 'API key management', availableIn: ['pro', 'enterprise'] },
  '/mobile-app-configs': { feature: 'white-label', description: 'Mobile app configuration', availableIn: ['pro', 'enterprise'] },

  // Sourcing - Starter+
  '/candidate-sourcings': { feature: 'advanced-search', description: 'Candidate sourcing', availableIn: ['starter', 'pro', 'enterprise'] },
  '/job-board-integration': { feature: 'api-access', description: 'Job board integration', availableIn: ['pro', 'enterprise'] },
  '/bookmarklet-captures': { feature: 'advanced-search', description: 'Bookmarklet captures', availableIn: ['starter', 'pro', 'enterprise'] },

  // Staffing & Operations Management - Pro+
  '/internal-chat': { feature: 'internal-chat', description: 'Team collaboration chat', availableIn: ['pro', 'enterprise'] },
  '/candidate-assignments': { feature: 'advanced-analytics', description: 'Candidate assignment tracking', availableIn: ['pro', 'enterprise'] },
  '/employee-timesheets': { feature: 'advanced-analytics', description: 'Employee timesheet management', availableIn: ['pro', 'enterprise'] },
  '/contractor-timesheets': { feature: 'advanced-analytics', description: 'Contractor timesheet tracking', availableIn: ['pro', 'enterprise'] },
  '/invoices': { feature: 'advanced-analytics', description: 'Invoice generation and tracking', availableIn: ['pro', 'enterprise'] },
};

/**
 * Get feature requirement for a given route
 */
export function getFeatureForRoute(path: string): FeatureRequirement | null {
  // Exact match first
  if (FEATURE_MAP[path]) {
    return FEATURE_MAP[path];
  }

  // Try to match parent paths (e.g., /candidates/123 -> /candidates)
  const segments = path.split('/').filter(Boolean);
  for (let i = segments.length; i > 0; i--) {
    const testPath = '/' + segments.slice(0, i).join('/');
    if (FEATURE_MAP[testPath]) {
      return FEATURE_MAP[testPath];
    }
  }

  // Default: allow access (basic-ats)
  return { feature: 'basic-ats', description: 'Basic access', availableIn: ['freemium', 'starter', 'pro', 'enterprise'] };
}

/**
 * Check if a feature is available in a given plan tier
 */
export function isFeatureAvailableInPlan(feature: string, planTier: string): boolean {
  const entry = Object.values(FEATURE_MAP).find(f => f.feature === feature);
  if (!entry) return true; // If not defined, allow access
  return entry.availableIn.includes(planTier);
}
