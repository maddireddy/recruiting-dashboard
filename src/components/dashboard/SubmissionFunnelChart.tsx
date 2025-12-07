import { useMemo } from 'react';
import type { TooltipProps } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, CartesianGrid } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../../lib/utils';

interface FunnelData {
  status: string;
  count: number;
}

export function SubmissionFunnelChart({ data, className }: { data: FunnelData[]; className?: string }) {
  const chartData = useMemo(() => (Array.isArray(data) ? data : []).map((item) => ({
    ...item,
    count: Number.isFinite(item.count) ? item.count : 0,
  })), [data]);

  return (
    <Card className={cn('flex flex-col justify-between', className)} aria-label="Submissions pipeline chart">
      <CardHeader className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Pipeline</p>
          <CardTitle className="text-lg">Submissions funnel</CardTitle>
          <CardDescription>Track the health of your submission stages.</CardDescription>
        </div>
        <span className="chip surface-muted text-xs">Updated live</span>
      </CardHeader>
      <CardContent className="h-[260px] pb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 12, left: 12, bottom: 12 }}
          >
            <defs>
              <linearGradient id="funnelGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgb(var(--app-primary-from))" stopOpacity={0.9} />
                <stop offset="100%" stopColor="rgb(var(--app-primary-to))" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--app-border-subtle))" horizontal vertical={false} />
            <XAxis
              dataKey="status"
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
            <Tooltip content={<PipelineTooltip />} cursor={{ fill: 'rgba(var(--app-border-subtle))' }} />
            <Bar dataKey="count" fill="url(#funnelGradient)" radius={[12, 12, 12, 12]} maxBarSize={52}>
              <LabelList
                dataKey="count"
                position="top"
                content={({ x, y, value }) => {
                  if (x == null || y == null || value == null) return null;
                  const xPos = typeof x === 'number' ? x : Number(x);
                  const yPos = typeof y === 'number' ? y : Number(y);
                  if (!Number.isFinite(xPos) || !Number.isFinite(yPos)) return null;
                  const displayValue = typeof value === 'number' ? value.toLocaleString() : value;
                  return (
                    <text
                      x={xPos}
                      y={yPos - 8}
                      textAnchor="middle"
                      fill="rgb(var(--app-text-primary))"
                      className="text-xs font-semibold"
                    >
                      {displayValue}
                    </text>
                  );
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default SubmissionFunnelChart;

type FunnelTooltipProps = TooltipProps<ValueType, NameType> & {
  payload?: Array<{ value?: ValueType }>;
  label?: string | number;
};

function PipelineTooltip({ active, payload, label }: FunnelTooltipProps) {
  if (!active || !payload?.length) return null;
  const value = Number(payload[0].value) || 0;
  return (
    <div className="rounded-xl border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface))] px-4 py-3 shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">{value.toLocaleString()}</p>
      <p className="text-xs text-muted">candidates at this stage</p>
    </div>
  );
}