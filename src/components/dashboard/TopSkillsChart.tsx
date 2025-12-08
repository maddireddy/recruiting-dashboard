import { useMemo } from 'react';
import type { TooltipProps } from 'recharts';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, CartesianGrid } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../../lib/utils';

export interface SkillDatum {
  name: string;
  count: number;
}

export default function TopSkillsChart({ data, className }: { data: SkillDatum[] | { skills: SkillDatum[] }; className?: string }) {
  // backend may return either an array or an object like { skills: [...] }
  const safeData: SkillDatum[] = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && 'skills' in data) {
      return Array.isArray((data as { skills: SkillDatum[] }).skills) ? (data as { skills: SkillDatum[] }).skills : [];
    }
    return [];
  }, [data]);

  const top = useMemo(() => safeData.slice(0, 12), [safeData]);

  return (
    <Card className={cn('flex flex-col justify-between', className)} aria-label="Top skills chart">
      <CardHeader className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Skills</p>
          <CardTitle className="text-lg">Most requested skills</CardTitle>
          <CardDescription>Understand which capabilities clients need most.</CardDescription>
        </div>
        <span className="chip surface-muted text-xs">Top 12</span>
      </CardHeader>
      <CardContent className="h-[300px] pb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={top} layout="vertical" margin={{ top: 12, left: 32, right: 24, bottom: 12 }}>
          <defs>
            <linearGradient id="skillsGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.9} />
            </linearGradient>
          </defs>
          <CartesianGrid horizontal strokeDasharray="3 3" stroke="rgba(var(--app-border-subtle))" />
          <XAxis
            type="number"
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'rgb(var(--app-text-secondary))', fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={140}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'rgb(var(--app-text-primary))', fontSize: 12 }}
          />
          <Tooltip content={<SkillsTooltip />} cursor={{ fill: 'rgba(var(--app-border-subtle))' }} />
          <Bar dataKey="count" fill="url(#skillsGradient)" radius={[12, 12, 12, 12]} barSize={18}>
            <LabelList
              dataKey="count"
              position="right"
              formatter={(value: unknown) => {
                if (typeof value === 'number') return value.toLocaleString();
                if (typeof value === 'string') {
                  const parsed = Number(value);
                  if (Number.isFinite(parsed)) return parsed.toLocaleString();
                  return value;
                }
                return value != null ? String(value) : '';
              }}
              fill="rgb(var(--app-text-primary))"
            />
          </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

type SkillsTooltipProps = TooltipProps<ValueType, NameType> & {
  payload?: Array<{ value?: ValueType; name?: string }>;
  label?: string | number;
};

function SkillsTooltip({ active, payload, label }: SkillsTooltipProps) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value;
  const total = typeof value === 'number' ? value.toLocaleString() : value;
  return (
    <div className="rounded-xl border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface))] px-4 py-3 shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">{total}</p>
      <p className="text-xs text-muted">candidates with this skill</p>
    </div>
  );
}
