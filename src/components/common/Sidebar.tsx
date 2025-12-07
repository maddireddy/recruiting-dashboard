import { Link, useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import { useMemo } from 'react';
import clsx from 'clsx';
import { authService } from '../../services/auth.service';

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
    ],
  },
  {
    title: 'Talent',
    items: [
      { path: '/candidates', icon: Users, label: 'Candidates' },
      { path: '/jobs', icon: Briefcase, label: 'Jobs' },
      { path: '/interviews', icon: Calendar, label: 'Interviews' },
      { path: '/submissions', icon: FolderKanban, label: 'Submissions' },
    ],
  },
  {
    title: 'Relationships',
    items: [
      { path: '/clients', icon: ShieldCheck, label: 'Clients' },
      { path: '/documents', icon: FileText, label: 'Documents' },
    ],
  },
  {
    title: 'Communications',
    items: [
      { path: '/email-templates', icon: Mail, label: 'Email Templates' },
      { path: '/email-logs', icon: Sparkles, label: 'Email Logs' },
    ],
  },
];

export default function Sidebar({ variant = 'desktop', open = false, onClose, onNavigate }: SidebarProps) {
  const location = useLocation();

  const renderNav = useMemo(
    () => (
      <div className="flex h-full flex-col sidebar-shell">
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
          {navigationSections.map((section) => (
            <div key={section.title} className="space-y-3">
              <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-muted">{section.title}</p>
              <div className="space-y-1.5">
                {section.items.map((item) => {
                  const isActive =
                    location.pathname === item.path ||
                    (item.path !== '/' && location.pathname.startsWith(item.path));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => {
                        onNavigate?.();
                        if (variant === 'mobile') {
                          onClose?.();
                        }
                      }}
                      className={clsx(
                        'group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all',
                        isActive
                          ? 'bg-[rgb(var(--app-surface-muted))] text-[rgb(var(--app-text-primary))] shadow-[inset_0_0_0_1px_rgba(var(--app-border-subtle))]'
                          : 'text-muted hover:bg-[rgb(var(--app-surface-muted))] hover:text-[rgb(var(--app-text-primary))]'
                      )}
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface))] text-muted transition group-hover:border-[rgba(var(--app-primary-from),0.4)] group-hover:text-[rgb(var(--app-text-primary))]">
                        <Icon size={18} />
                      </span>
                      <span>{item.label}</span>
                      {isActive && <span className="ml-auto h-2 w-2 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500" aria-hidden="true" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
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
    [onClose, onNavigate, variant, location.pathname]
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
    <aside className="hidden h-full w-full lg:flex">
      {renderNav}
    </aside>
  );
}
