import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  Bell,
  Settings,
  Menu,
  Sparkles,
  ChevronRight,
  Command,
} from 'lucide-react';
import ExportMenu from './ExportMenu';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onMenuClick?: () => void;
}

const routeLabels: Record<string, string> = {
  '': 'Dashboard',
  dashboard: 'Dashboard',
  candidates: 'Candidates',
  jobs: 'Jobs',
  submissions: 'Submissions',
  interviews: 'Interviews',
  clients: 'Clients',
  documents: 'Documents',
  reports: 'Reports',
  'email-templates': 'Email Templates',
  'email-logs': 'Email Logs',
  login: 'Login',
};

export default function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation();
  const userEmail = localStorage.getItem('userId') || 'User';
  const initials = userEmail
    .split('@')[0]
    .split('.')
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2) || 'U';

  const breadcrumbs = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments.length === 0) {
      return [{ label: 'Dashboard', href: '/' }];
    }

    const crumbs = segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join('/')}`;
      const isIdSegment = /^(\d+|[a-fA-F0-9-]{6,})$/.test(segment);
      const label = isIdSegment
        ? index === segments.length - 1
          ? 'Details'
          : 'Item'
        : routeLabels[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      return { label, href };
    });

    return [{ label: 'Dashboard', href: '/' }, ...crumbs];
  }, [location.pathname]);

  const pageTitle = breadcrumbs[breadcrumbs.length - 1]?.label ?? 'Overview';

  return (
    <header className="header-shell sticky top-0 z-40 border-b">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] transition lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>

          <div className="lg:hidden">
            <h2 className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">{pageTitle}</h2>
          </div>

          <div className="hidden lg:flex lg:flex-col">
            <nav className="flex items-center gap-2 text-xs font-medium text-muted">
              {breadcrumbs.map((crumb, index) => (
                <span key={crumb.href} className="flex items-center gap-2">
                  {index !== 0 && <ChevronRight size={12} className="text-muted" />}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-[rgb(var(--app-text-primary))]">{crumb.label}</span>
                  ) : (
                    <Link to={crumb.href} className="transition hover:text-[rgb(var(--app-primary-from))]">
                      {crumb.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
            <h2 className="text-lg font-semibold text-[rgb(var(--app-text-primary))] sm:text-xl">{pageTitle}</h2>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="hidden sm:flex sm:flex-1">
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--app-text-secondary))]" size={18} />
              <input
                type="text"
                placeholder="Search across candidates, jobs, clients..."
                className="input pl-11 pr-12"
              />
              <div className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] px-2 py-1 text-[11px] font-semibold uppercase tracking-widest text-muted sm:flex">
                <Command size={12} />
                <span>K</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] transition"
              aria-label="Open command menu"
            >
              <Sparkles size={18} />
            </button>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] transition"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] transition"
              aria-label="Global settings"
            >
              <Settings size={18} />
            </button>
            <ThemeToggle />
            <ExportMenu />
            <div className="ml-1 flex items-center gap-3 rounded-2xl border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] px-3 py-1.5 text-sm text-[rgb(var(--app-text-primary))]">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/30 to-emerald-500/30 text-[rgb(var(--app-primary-from))]">
                {initials}
              </div>
              <div className="hidden sm:flex sm:flex-col">
                <span className="text-xs font-semibold text-muted">Welcome back</span>
                <span className="text-sm font-medium">{userEmail}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
