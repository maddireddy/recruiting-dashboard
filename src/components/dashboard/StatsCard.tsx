import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../../lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  accentClassName?: string;
}

export default function StatsCard({ title, value, icon, accentClassName }: StatsCardProps) {
  const displayValue = typeof value === 'number' ? value.toLocaleString() : value;
  const numericValue = typeof value === 'number' ? value : 0;
  
  return (
    <Card
      className={cn(
        'h-fit border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-elevated))] shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--app-primary-from),0.35)] focus-visible:ring-offset-2',
        accentClassName
      )}
      role="status"
      aria-live="polite"
      tabIndex={0}
    >
      <CardHeader className="gap-2 pb-3">
        <CardDescription className="flex items-center gap-2 text-sm">
          {icon}
          <span>{title}</span>
        </CardDescription>
        <CardTitle className="text-2xl">{displayValue}</CardTitle>
      </CardHeader>
      {numericValue > 0 && (
        <CardContent className="pb-4 pt-0">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[rgba(var(--app-border-subtle))]">
            <div className="h-full w-full origin-left scale-x-100 rounded-full bg-gradient-to-r from-[rgb(var(--app-primary-from))] to-[rgb(var(--app-primary-to))] opacity-40" />
          </div>
        </CardContent>
      )}
    </Card>
  );
}