import { ReactNode } from 'react';
import { Lock, Crown } from 'lucide-react';
import { useOrganizationStore } from '../../store/organizationStore';
import Button from '../ui/Button';

interface FeatureGuardProps {
  feature: string;
  fallback?: ReactNode;
  children: ReactNode;
  showUpgrade?: boolean;
  mode?: 'hide' | 'lock' | 'custom';
}

/**
 * FeatureGuard - Controls access to features based on subscription tier
 *
 * Usage:
 * <FeatureGuard feature="ai-resume-parser" mode="lock">
 *   <Button>Parse Resume</Button>
 * </FeatureGuard>
 *
 * Modes:
 * - hide: Don't render children at all
 * - lock: Show children but disabled with lock icon
 * - custom: Show custom fallback UI
 */
export default function FeatureGuard({
  feature,
  fallback,
  children,
  showUpgrade = true,
  mode = 'hide',
}: FeatureGuardProps) {
  const { hasFeature, organization } = useOrganizationStore();

  const hasAccess = hasFeature(feature);

  // If has access, render children normally
  if (hasAccess) {
    return <>{children}</>;
  }

  // Mode: hide - don't render anything
  if (mode === 'hide') {
    return null;
  }

  // Mode: custom - render custom fallback
  if (mode === 'custom' && fallback) {
    return <>{fallback}</>;
  }

  // Mode: lock - show locked version
  if (mode === 'lock') {
    return (
      <div className="relative">
        <div className="opacity-50 pointer-events-none">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <LockedFeatureTooltip feature={feature} showUpgrade={showUpgrade} />
        </div>
      </div>
    );
  }

  return null;
}

function LockedFeatureTooltip({ feature, showUpgrade }: { feature: string; showUpgrade: boolean }) {
  const { organization } = useOrganizationStore();

  return (
    <div className="bg-black/80 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm">
      <Lock size={20} className="text-[rgb(var(--app-warning))]" />
      <div className="flex-1">
        <p className="text-sm font-medium">Premium Feature</p>
        <p className="text-xs text-gray-300 mt-1">
          Upgrade to {organization?.planTier === 'freemium' ? 'Starter' : 'Pro'} to unlock this feature
        </p>
      </div>
      {showUpgrade && (
        <Button variant="primary" size="sm" onClick={() => window.location.href = '/billing'}>
          <Crown size={14} className="mr-1" />
          Upgrade
        </Button>
      )}
    </div>
  );
}

/**
 * UsageLimitGuard - Check if usage limit is reached
 */
interface UsageLimitGuardProps {
  limitType: 'users' | 'candidates' | 'jobs' | 'activeJobs';
  currentCount: number;
  children: ReactNode;
  fallback?: ReactNode;
}

export function UsageLimitGuard({ limitType, currentCount, children, fallback }: UsageLimitGuardProps) {
  const { organization } = useOrganizationStore();

  if (!organization) return null;

  const limitMap = {
    users: organization.planLimits.maxUsers,
    candidates: organization.planLimits.maxCandidates,
    jobs: organization.planLimits.maxJobs,
    activeJobs: organization.planLimits.maxActiveJobs,
  };

  const limit = limitMap[limitType];
  const isUnlimited = limit === -1;
  const hasReachedLimit = !isUnlimited && currentCount >= limit;

  if (hasReachedLimit) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="card p-6 text-center">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-[rgba(var(--app-warning),0.1)]">
          <Lock size={32} className="text-[rgb(var(--app-warning))]" />
        </div>
        <h3 className="text-lg font-semibold text-[rgb(var(--app-text-primary))] mb-2">
          {limitType.charAt(0).toUpperCase() + limitType.slice(1)} Limit Reached
        </h3>
        <p className="text-muted mb-4">
          You've reached your plan limit of {limit} {limitType}. Upgrade to add more.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="subtle" onClick={() => window.history.back()}>
            Go Back
          </Button>
          <Button variant="primary" onClick={() => window.location.href = '/billing'}>
            <Crown size={16} className="mr-2" />
            Upgrade Plan
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
