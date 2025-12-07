import { useMemo } from 'react';
import type { TooltipProps } from 'recharts';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../../lib/utils';

type Point = {
  period?: string;
  month?: string;
  submissions?: number;
  interviews?: number;
  offers?: number;
  hires?: number;
};

export default function TrendLineChart({ data, className }: { data: Point[]; className?: string }) {
  const safeData = useMemo(() => (Array.isArray(data) ? data : []).map((point) => ({
    ...point,
    submissions: Number(point.submissions ?? 0),
    interviews: Number(point.interviews ?? 0),
    offers: Number(point.offers ?? 0),
    hires: Number(point.hires ?? 0),
  })), [data]);

  const xKey = safeData.length > 0 ? (safeData[0].month !== undefined ? 'month' : 'period') : 'period';

  return (
    <Card className={cn('flex flex-col justify-between', className)} aria-label="Monthly pipeline trend chart">
      <CardHeader className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Trend</p>
          <CardTitle className="text-lg">Monthly pipeline</CardTitle>
          <CardDescription>Monitor momentum across key hiring stages.</CardDescription>
        </div>
        <span className="chip surface-muted text-xs">Rolling 12 months</span>
      </CardHeader>
      <CardContent className="h-[300px] pb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={safeData} margin={{ top: 20, right: 16, left: 4, bottom: 12 }}>
          <defs>
            <linearGradient id="lineSubmissions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.38} />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="lineInterviews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.38} />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="lineOffers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.38} />
              <stop offset="100%" stopColor="#34d399" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="lineHires" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.38} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--app-border-subtle))" />
          <XAxis
            dataKey={xKey}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'rgb(var(--app-text-secondary))', fontSize: 12 }}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'rgb(var(--app-text-secondary))', fontSize: 12 }}
          />
          <Tooltip content={<TrendTooltip />} />
          <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 12 }} iconType="circle" />
          <Line type="monotone" dataKey="submissions" stroke="#60a5fa" strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="interviews" stroke="#a78bfa" strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="offers" stroke="#34d399" strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="hires" stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

type TrendPayloadEntry = {
  value?: ValueType;
  color?: string;
  name?: string;
  dataKey?: string | number;
};

type TrendTooltipProps = TooltipProps<ValueType, NameType> & {
  payload?: TrendPayloadEntry[];
  label?: string | number;
};

function TrendTooltip({ active, payload, label }: TrendTooltipProps) {
  if (!active || !payload?.length) return null;
  const numericPayload = payload.filter((entry): entry is TrendPayloadEntry & { value: number } => typeof entry.value === 'number');
  return (
    <div className="space-y-2 rounded-xl border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface))] px-4 py-3 shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{label}</p>
      <ul className="space-y-1 text-sm text-[rgb(var(--app-text-primary))]">
        {numericPayload.map((series) => (
          <li key={String(series.dataKey)} className="flex items-center justify-between gap-8">
            <span className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: series.color }} />
              {series.name}
            </span>
            <span className="font-semibold">
              {series.value.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
