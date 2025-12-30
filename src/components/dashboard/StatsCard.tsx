import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../../lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  accentClassName?: string;
}

const StatsCard = React.memo(function StatsCard({ title, value, icon, accentClassName }: StatsCardProps) {
  const displayValue = typeof value === 'number' ? value.toLocaleString() : value;
  const numericValue = typeof value === 'number' ? value : 0;
  
  return (
    <Card
      className={cn(
        'h-fit border border-[#E2E8F0] bg-white shadow-sm hover:shadow-md transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3498db] focus-visible:ring-offset-2',
        accentClassName
      )}
      role="status"
      aria-live="polite"
      tabIndex={0}
    >
      <CardHeader className="gap-2 pb-3">
        <CardDescription className="flex items-center gap-2 text-sm text-[#64748B]">
          {icon}
          <span>{title}</span>
        </CardDescription>
        <CardTitle className="text-2xl text-[#0F172A]">{displayValue}</CardTitle>
      </CardHeader>
      {numericValue > 0 && (
        <CardContent className="pb-4 pt-0">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
            <div className="h-full w-full origin-left scale-x-100 rounded-full bg-gradient-to-r from-[#3498db] to-[#2980b9]" />
          </div>
        </CardContent>
      )}
    </Card>
  );
});

export default StatsCard;