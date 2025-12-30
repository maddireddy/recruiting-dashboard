import { useLocation, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  LogOut,
  Calendar,
  FileText,
  Mail,
  TrendingUp,
  FolderKanban,
  ShieldCheck,
  Sparkles,
  X,
  Bell,
  Settings,
  FileCheck,
  ClipboardCheck,
  UserCheck,
  UserSquare,
  Globe,
  Search,
  Target,
  Award,
  Zap,
  DollarSign,
  Building2,
  MessageSquare,
  Clock,
  Receipt,
} from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import clsx from 'clsx';
import { authService } from '../../services/auth.service';
import { useOrganizationStore } from '../../store/organizationStore';
import { getFeatureForRoute } from '../../config/featureMap';

type SidebarVariant = 'desktop' | 'mobile';

interface SidebarProps {
  variant?: SidebarVariant;
  open?: boolean;
  onClose?: () => void;
  onNavigate?: () => void;
}

const navigationSections = [
  {
    title: 'Overview',
    items: [
      { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/reports', icon: TrendingUp, label: 'Reports' },
      { path: '/notifications', icon: Bell, label: 'Notifications' },
    ],
  },
  {
    title: 'Talent Management',
    items: [
      { path: '/candidates', icon: Users, label: 'Candidates' },
      { path: '/jobs', icon: Briefcase, label: 'Jobs' },
      { path: '/interviews', icon: Calendar, label: 'Interviews' },
      { path: '/submissions', icon: FolderKanban, label: 'Submissions' },
      { path: '/offers', icon: Award, label: 'Offers' },
      { path: '/talent-pools', icon: Users, label: 'Talent Pools' },
    ],
  },
  {
    title: 'Sourcing & Search',
    items: [
      { path: '/advanced-search', icon: Search, label: 'Advanced Search' },
      { path: '/saved-searches', icon: FileCheck, label: 'Saved Searches' },
      { path: '/boolean-search-templates', icon: FileText, label: 'Boolean Templates' },
      { path: '/candidate-sourcings', icon: Target, label: 'Candidate Sourcings' },
      { path: '/job-board-integration', icon: Globe, label: 'Job Board Integration' },
      { path: '/bookmarklet-captures', icon: Target, label: 'Bookmarklet Captures' },
    ],
  },
  {
    title: 'AI Tools',
    items: [
      { path: '/ai', icon: Sparkles, label: 'AI Lab' },
      { path: '/ai/semantic-search', icon: Sparkles, label: 'Semantic Search' },
      { path: '/ai/resume-parser', icon: Sparkles, label: 'Resume Parser' },
      { path: '/ai/jd-generator', icon: Sparkles, label: 'JD Generator' },
      { path: '/ai/rediscovery', icon: Sparkles, label: 'Rediscovery' },
      { path: '/ai/talent-pool-matching', icon: Sparkles, label: 'Pool Matching' },
      { path: '/ai/interview-intelligence', icon: Sparkles, label: 'Interview Intelligence' },
    ],
  },
  {
    title: 'Interview Management',
    items: [
      { path: '/interview-guides', icon: FileText, label: 'Interview Guides' },
      { path: '/interview-recordings', icon: FileText, label: 'Recordings' },
      { path: '/scorecards', icon: ClipboardCheck, label: 'Scorecards' },
      { path: '/scheduling', icon: Calendar, label: 'Scheduling' },
    ],
  },
  {
    title: 'Communication',
    items: [
      { path: '/email-templates', icon: Mail, label: 'Email Templates' },
      { path: '/email-logs', icon: Mail, label: 'Email Logs' },
      { path: '/sms', icon: Mail, label: 'SMS Campaigns' },
      { path: '/sms/communications', icon: Mail, label: 'SMS Communications' },
    ],
  },
  {
    title: 'Automation & Workflows',
    items: [
      { path: '/workflows', icon: Zap, label: 'Workflows' },
      { path: '/calendar-sync', icon: Calendar, label: 'Calendar Sync' },
    ],
  },
  {
    title: 'Candidate Experience',
    items: [
      { path: '/candidate-portal', icon: UserSquare, label: 'Candidate Portal' },
      { path: '/onboarding', icon: UserCheck, label: 'New Hire Onboarding' },
    ],
  },
  {
    title: 'Staffing Operations',
    items: [
      { path: '/internal-chat', icon: MessageSquare, label: 'Internal Chat' },
      { path: '/candidate-assignments', icon: Users, label: 'Candidate Assignments' },
      { path: '/employee-timesheets', icon: Clock, label: 'Employee Timesheets' },
      { path: '/contractor-timesheets', icon: Clock, label: 'Contractor Timesheets' },
      { path: '/invoices', icon: Receipt, label: 'Invoices' },
    ],
  },
  {
    title: 'Workflow & Automation',
    items: [
      { path: '/workflow-management', icon: Zap, label: 'Workflow Management' },
      { path: '/workflows', icon: FolderKanban, label: 'Custom Workflows' },
    ],
  },
  {
    title: 'Analytics & Compliance',
    items: [
      { path: '/market-intelligence', icon: TrendingUp, label: 'Market Intelligence' },
      { path: '/diversity-metrics', icon: ShieldCheck, label: 'Diversity Metrics' },
      { path: '/skills-assessments', icon: Award, label: 'Skills Assessments' },
      { path: '/silver-medalists', icon: Award, label: 'Silver Medalists' },
      { path: '/eeo-data', icon: ShieldCheck, label: 'EEO Data' },
      { path: '/custom-reports', icon: TrendingUp, label: 'Custom Reports' },
      { path: '/compliance', icon: ShieldCheck, label: 'Compliance' },
    ],
  },
  {
    title: 'Administration',
    items: [
      { path: '/users', icon: Users, label: 'User Management' },
      { path: '/settings', icon: Settings, label: 'Settings' },
      { path: '/clients', icon: Building2, label: 'Clients' },
      { path: '/vendors', icon: Building2, label: 'Vendors' },
      { path: '/billing', icon: DollarSign, label: 'Billing' },
      { path: '/documents', icon: FileText, label: 'Documents' },
      { path: '/audit-logs', icon: FileCheck, label: 'Audit Logs' },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { path: '/jd-templates', icon: FileText, label: 'JD Templates' },
      { path: '/vendor-submittals', icon: FileText, label: 'Vendor Submittals' },
      { path: '/white-label', icon: Settings, label: 'White Label' },
      { path: '/api-keys', icon: FileCheck, label: 'API Keys' },
      { path: '/mobile-app-configs', icon: Settings, label: 'Mobile App Configs' },
    ],
  },
];

export default function Sidebar({ variant = 'desktop', open = false, onClose, onNavigate }: SidebarProps) {
  const location = useLocation();
  const { organization, hasFeature } = useOrganizationStore();
  const currentPlan = organization?.planTier || 'freemium';

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem('sidebar.openGroups');
      if (raw) return JSON.parse(raw);
      // Default: open key sections for better UX
      return {
        'Overview': true,
        'Talent Management': true,
        'AI Tools': true,
        'Administration': true,
      };
    } catch {
      return {
        'Overview': true,
        'Talent Management': true,
        'AI Tools': true,
        'Administration': true,
      };
    }
  });
  const toggleGroup = (key: string) => {
    setOpenGroups((s) => ({ ...s, [key]: !s[key] }));
  };

  // Persist group state
  useEffect(() => {
    try {
      localStorage.setItem('sidebar.openGroups', JSON.stringify(openGroups));
    } catch {}
  }, [openGroups]);

  const renderNav = useMemo(
    () => (
      <div className="flex h-full flex-col sidebar-shell bg-[rgb(var(--app-surface-muted))] text-[rgb(var(--app-text-primary))]">
        <div className="relative flex items-center justify-between px-6 py-6 border-b border-[rgba(var(--app-sidebar-border))]">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-muted">BenchSales</p>
            <h1 className="mt-1 text-xl font-semibold">Recruiting OS</h1>
          </div>
          {variant === 'mobile' && (
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] text-[rgb(var(--app-text-primary))] transition hover:border-[rgba(var(--app-primary-from),0.4)] hover:text-[rgb(var(--app-text-primary))]"
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-4 pb-8">
          {navigationSections.map((section) => {
            // Filter items based on feature access
            const accessibleItems = section.items.filter((item) => {
              const featureReq = getFeatureForRoute(item.path);
              if (!featureReq) return true; // Default: allow
              return hasFeature(featureReq.feature);
            });

            // Hide entire section if no accessible items
            if (accessibleItems.length === 0) return null;

            return (
              <div key={section.title} className="mt-4">
                <button
                  type="button"
                  onClick={() => toggleGroup(section.title)}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs uppercase tracking-wide text-[rgb(var(--app-text-secondary))] hover:text-[rgb(var(--app-text-primary))] transition"
                >
                  <span>{section.title}</span>
                  <span className={`transition-transform ${openGroups[section.title] ? 'rotate-90' : ''}`}>▸</span>
                </button>
                {openGroups[section.title] && (
                  <nav className="mt-3 space-y-1">
                    {accessibleItems.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => {
                          if (variant === 'mobile') {
                            onClose?.();
                          }
                        }}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition relative ${
                            isActive
                              ? 'bg-[rgba(var(--app-primary-from),0.15)] text-[rgb(var(--app-text-primary))] font-medium before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-[rgb(var(--app-primary-from))] before:rounded-r-md'
                              : 'text-[rgb(var(--app-text-secondary))] hover:text-[rgb(var(--app-text-primary))] hover:bg-[rgba(var(--app-primary-from),0.08)]'
                          }`
                        }
                      >
                        <item.icon className="h-4 w-4 opacity-80" />
                        <span>{item.label}</span>
                      </NavLink>
                    ))}
                  </nav>
                )}
              </div>
            );
          })}

          {/* Plan Badge */}
          <div className="px-4 py-3 mx-4 rounded-xl border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-primary-from),0.05)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted">Current Plan</p>
                <p className="text-sm font-semibold text-[rgb(var(--app-text-primary))] capitalize">{currentPlan}</p>
              </div>
              {currentPlan !== 'pro' && currentPlan !== 'enterprise' && (
                <NavLink
                  to="/billing"
                  className="text-xs font-medium text-[rgb(var(--app-primary-from))] hover:underline"
                >
                  Upgrade
                </NavLink>
              )}
            </div>
          </div>
        </nav>

        <div className="border-t border-[rgba(var(--app-sidebar-border))] px-6 py-6">
          <button
            type="button"
            onClick={() => {
              authService.logout();
              onClose?.();
            }}
            className="flex w-full items-center gap-3 rounded-xl border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] px-4 py-3 text-sm font-medium text-muted transition hover:border-[rgba(var(--app-primary-from),0.4)] hover:text-[rgb(var(--app-text-primary))]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
              <LogOut size={18} />
            </span>
            Logout
          </button>
        </div>
      </div>
    ),
    [onClose, onNavigate, variant, location.pathname, openGroups]
  );

  if (variant === 'mobile') {
    return (
      <div
        className={clsx(
          'fixed inset-0 z-50 bg-[rgba(15,23,42,0.55)] backdrop-blur-md transition-opacity duration-200 lg:hidden',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div className="absolute inset-0" onClick={onClose} />
        <div
          className={clsx(
            'relative h-full w-full max-w-xs translate-x-0 transition-transform duration-200',
            open ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {renderNav}
        </div>
      </div>
    );
  }

  return (
    <aside className="hidden h-full w-full lg:flex bg-[rgb(var(--app-surface-muted))]">
      {renderNav}
    </aside>
  );
}
