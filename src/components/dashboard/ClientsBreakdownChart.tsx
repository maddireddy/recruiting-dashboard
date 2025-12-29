import { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../../lib/utils';

export interface ClientDatum {
  client: string;
  submissions?: number;
  interviews?: number;
  hires?: number;
}

export default function ClientsBreakdownChart({ data, className }: { data: ClientDatum[] | { clients: ClientDatum[] }; className?: string }) {
  // accept either an array or an object like { clients: [...] }
  const safeData: ClientDatum[] = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && 'clients' in data) {
      return Array.isArray((data as { clients: ClientDatum[] }).clients) ? (data as { clients: ClientDatum[] }).clients : [];
    }
    return [];
  }, [data]);

  const chartData = useMemo(
    () =>
      safeData.slice(0, 10).map((item) => ({
        client: item.client,
        submissions: Number.isFinite(item.submissions) ? (item.submissions as number) : 0,
        interviews: Number.isFinite(item.interviews) ? (item.interviews as number) : 0,
        hires: Number.isFinite(item.hires) ? (item.hires as number) : 0,
      })),
    [safeData]
  );

  const series: Array<{ key: keyof ClientDatum; label: string; color: string }> = [
    { key: 'submissions', label: 'Submissions', color: '#60a5fa' },
    { key: 'interviews', label: 'Interviews', color: '#a78bfa' },
    { key: 'hires', label: 'Hires', color: '#34d399' },
  ];

  return (
    <Card className={cn('flex flex-col justify-between', className)} aria-label="Top clients breakdown chart">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Clients</p>
          <CardTitle className="text-lg">Pipeline performance</CardTitle>
          <CardDescription>Compare submissions, interviews, and hires for key accounts.</CardDescription>
        </div>
        <span className="chip surface-muted text-xs">Top 10</span>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
        {series.map((item) => (
          <span
            key={item.key}
            className="chip surface-subtle text-xs"
            style={{ borderColor: item.color, color: item.color }}
          >
            <span
              className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </span>
        ))}
      </div>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 12, right: 24, left: 12, bottom: 32 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(var(--app-border-subtle))" />
              <XAxis
                dataKey="client"
                interval={0}
                angle={-20}
                textAnchor="end"
                height={70}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgb(var(--app-text-secondary))', fontSize: 11 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgb(var(--app-text-secondary))', fontSize: 12 }}
              />
              <Tooltip cursor={{ fill: 'rgba(var(--app-border-subtle))' }} content={<ClientsBreakdownTooltip series={series} />} />
              <Bar dataKey="submissions" stackId="a" fill={series[0].color} radius={[0, 0, 0, 0]} />
              <Bar dataKey="interviews" stackId="a" fill={series[1].color} radius={[0, 0, 0, 0]} />
              <Bar dataKey="hires" stackId="a" fill={series[2].color} radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

type TooltipItem = {
  dataKey?: string | number;
  value?: ValueType;
};

type ClientsTooltipProps = {
  active?: boolean;
  label?: NameType;
  payload?: TooltipItem[];
  series: Array<{ key: keyof ClientDatum; label: string; color: string }>;
};

function ClientsBreakdownTooltip({ active, payload, label, series }: ClientsTooltipProps) {
  if (!active || !payload?.length) return null;

  const rows = series
    .map((serie) => {
      const match = payload.find((item) => item.dataKey === serie.key);
      const numeric = typeof match?.value === 'number' ? match.value : Number(match?.value ?? 0);
      return {
        ...serie,
        value: Number.isFinite(numeric) ? numeric : 0,
      };
    })
    .filter((item) => item.value > 0);

  const total = rows.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="min-w-44 space-y-2 rounded-xl border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface))] px-4 py-3 shadow-lg">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{label}</p>
        <p className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">{total.toLocaleString()} total</p>
      </div>
      <ul className="space-y-1 text-sm">
        {rows.map((item) => (
          <li key={item.key} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-[rgb(var(--app-text-secondary))]">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
            <span className="font-medium text-[rgb(var(--app-text-primary))]">{item.value.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
