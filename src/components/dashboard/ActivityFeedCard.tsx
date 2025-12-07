import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../../lib/utils';

export type ActivityItem = {
  id: string;
  title: string;
  description?: string;
  timeAgo: string;
  icon: LucideIcon;
  tone?: 'info' | 'success' | 'warning';
};

const toneColors: Record<NonNullable<ActivityItem['tone']>, string> = {
  info: 'bg-sky-400/10 text-sky-300',
  success: 'bg-emerald-400/10 text-emerald-300',
  warning: 'bg-amber-400/10 text-amber-300',
};

export function ActivityFeedCard({ items }: { items: ActivityItem[] }) {
  return (
    <Card className="flex h-full flex-col justify-between">
      <CardHeader>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Activity</p>
        <CardTitle className="text-lg">Latest movement</CardTitle>
        <CardDescription>Track what&apos;s changed across candidates and jobs today.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <span
                className={cn(
                  'mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted),0.7)] text-[rgb(var(--app-text-primary))]',
                  item.tone ? toneColors[item.tone] : null
                )}
              >
                <item.icon size={18} />
              </span>
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-[rgb(var(--app-text-primary))]">{item.title}</span>
                  <span className="text-xs text-muted">{item.timeAgo}</span>
                </div>
                {item.description && <p className="text-sm text-muted">{item.description}</p>}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
