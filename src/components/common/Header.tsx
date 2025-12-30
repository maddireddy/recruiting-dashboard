import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Settings, Menu, Sparkles, ChevronRight, Command } from 'lucide-react';
import ExportMenu from './ExportMenu';
import { ThemeToggle } from './ThemeToggle';
import GlobalSearchBar from './GlobalSearchBar';

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
    <header className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#1E293B] transition hover:bg-[#F8FAFC] hover:border-[#3498db]"
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>

          <div className="lg:hidden">
            <h2 className="text-lg font-semibold text-[#0F172A]">{pageTitle}</h2>
          </div>

          <div className="hidden lg:flex lg:flex-col">
            <nav className="flex items-center gap-2 text-xs font-medium text-[#64748B]">
              {breadcrumbs.map((crumb, index) => (
                <span key={crumb.href} className="flex items-center gap-2">
                  {index !== 0 && <ChevronRight size={12} className="text-[#94A3B8]" />}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-[#0F172A] font-semibold">{crumb.label}</span>
                  ) : (
                    <Link to={crumb.href} className="transition hover:text-[#3498db]">
                      {crumb.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
            <h2 className="text-lg font-semibold text-[#0F172A] sm:text-xl">{pageTitle}</h2>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="hidden sm:flex sm:flex-1">
            <GlobalSearchBar />
            <div className="ml-2 hidden items-center gap-1 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#64748B] sm:flex">
              <Command size={12} />
              <span>K</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] transition hover:bg-gradient-to-br hover:from-[#3498db]/10 hover:to-[#2980b9]/10 hover:text-[#3498db] hover:border-[#3498db]"
              aria-label="Open command menu"
            >
              <Sparkles size={18} />
            </button>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] transition hover:bg-[#F8FAFC] hover:text-[#0F172A] hover:border-[#CBD5E1]"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] transition hover:bg-[#F8FAFC] hover:text-[#0F172A] hover:border-[#CBD5E1]"
              aria-label="Global settings"
            >
              <Settings size={18} />
            </button>
            <ThemeToggle />
            <ExportMenu />
            <div className="ml-1 flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-3 py-1.5 text-sm shadow-sm hover:shadow-md transition">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#3498db] to-[#2980b9] text-white font-semibold">
                {initials}
              </div>
              <div className="hidden sm:flex sm:flex-col">
                <span className="text-xs font-semibold text-[#64748B]">Welcome back</span>
                <span className="text-sm font-medium text-[#0F172A]">{userEmail}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
