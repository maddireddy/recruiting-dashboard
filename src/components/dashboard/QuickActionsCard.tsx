import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../../lib/utils';

export type QuickAction = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  to: string;
  tone?: 'default' | 'primary' | 'success';
};

const toneStyles: Record<NonNullable<QuickAction['tone']>, string> = {
  default: 'bg-[rgba(var(--app-surface-muted))] text-[rgb(var(--app-text-primary))]',
  primary: 'bg-gradient-to-br from-[rgba(var(--app-primary-from),0.18)] to-[rgba(var(--app-primary-to),0.18)] text-[rgb(var(--app-primary-from))]',
  success: 'bg-gradient-to-br from-emerald-400/10 to-emerald-500/10 text-emerald-400',
};

const getToneClasses = (tone: QuickAction['tone']) => toneStyles[tone ?? 'default'];

export function QuickActionsCard({ actions }: { actions: QuickAction[] }) {
  return (
    <Card className="flex h-full flex-col justify-between">
      <CardHeader>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Actions</p>
        <CardTitle className="text-lg">Move work forward</CardTitle>
        <CardDescription>One-tap shortcuts for the things you do most.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {actions.map((action) => (
          <Link
            key={action.id}
            to={action.to}
            className="group flex items-center justify-between gap-4 rounded-2xl border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted),0.65)] p-4 transition hover:-translate-y-1 hover:border-[rgba(var(--app-primary-from),0.4)] hover:shadow-lg"
          >
            <div className="flex items-center gap-3">
              <span className={cn('flex h-12 w-12 items-center justify-center rounded-xl', getToneClasses(action.tone))}>
                <action.icon size={18} />
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[rgb(var(--app-text-primary))]">{action.label}</span>
                <span className="text-xs text-muted">{action.description}</span>
              </div>
            </div>
            <ArrowUpRight className="text-muted transition group-hover:text-[rgb(var(--app-primary-from))]" size={18} />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
