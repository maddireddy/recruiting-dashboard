import { Link } from 'react-router-dom';
import { CalendarClock, Clock } from 'lucide-react';

export interface TimelineItem {
  id: string;
  date: string; // ISO
  title: string;
  subtitle?: string;
  statusColor?: string; // tailwind color classes
  href?: string;
  chip?: string;
}

interface TimelineProps {
  title?: string;
  items: TimelineItem[];
  emptyLabel?: string;
}

const badgeFallback = 'border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted))] text-muted';

const formatDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function Timeline({ title, items, emptyLabel }: TimelineProps) {
  const sorted = [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (!sorted.length) {
    return (
      <div className="rounded-3xl border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted))] p-6 text-sm text-muted">
        <div className="flex items-center gap-3">
          <Clock size={16} />
          {emptyLabel || 'No timeline entries yet.'}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-elevated))] p-6">
      {title && (
        <div className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          <CalendarClock size={16} />
          {title}
        </div>
      )}
      <ol className="relative space-y-6">
        {sorted.map((item, index) => {
          const chipClass = item.statusColor || badgeFallback;
          return (
            <li key={`${item.id}-${index}`} className="relative pl-8">
              {index < sorted.length - 1 && (
                <span className="absolute left-1.5 top-4 h-full w-px bg-[rgba(var(--app-border-subtle))]" aria-hidden />
              )}
              <span className="absolute left-0 top-3 flex h-5 w-5 items-center justify-center">
                <span className="h-3 w-3 rounded-full border-2 border-[rgb(var(--app-surface-elevated))] bg-[rgb(var(--app-primary-from))]" />
              </span>
              <div className="rounded-2xl border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted))] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                    {formatDate(item.date)}
                  </span>
                  <span className="text-sm font-semibold text-[rgb(var(--app-text-primary))]">
                    {item.title}
                  </span>
                  {item.chip && (
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${chipClass}`}>
                      {item.chip}
                    </span>
                  )}
                  {item.href && (
                    <Link
                      to={item.href}
                      className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--app-primary-from))] hover:underline"
                    >
                      View
                    </Link>
                  )}
                </div>
                {item.subtitle && (
                  <p className="mt-2 text-sm text-muted">{item.subtitle}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
