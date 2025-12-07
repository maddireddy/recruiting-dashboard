import { Users, Briefcase, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export interface TalentMetrics {
  totalCandidates?: number;
  benchCandidates?: number;
  placedCandidates?: number;
  openJobs?: number;
  closedJobs?: number;
  totalSubmissions?: number;
}

const highlights = [
  {
    id: 'bench-to-role',
    label: 'Bench-to-role pairing',
    description: 'Focus on matching bench talent to the top 3 urgent roles this week.',
  },
  {
    id: 'interview-experience',
    label: 'Interview experience',
    description: 'Collaborate with hiring managers to reduce feedback turnaround below 24 hours.',
  },
  {
    id: 'offer-readiness',
    label: 'Offer readiness',
    description: 'Pre-brief candidates on compensation bands ahead of final conversations.',
  },
];

export function TalentFocusCard({ metrics }: { metrics: TalentMetrics }) {
  const totalCandidates = metrics.totalCandidates ?? 0;
  const placedCandidates = metrics.placedCandidates ?? 0;
  const benchCandidates = metrics.benchCandidates ?? 0;
  const openJobs = metrics.openJobs ?? 0;
  const closedJobs = metrics.closedJobs ?? 0;
  const totalSubmissions = metrics.totalSubmissions ?? 0;

  const fillRate = totalCandidates ? Math.round((placedCandidates / totalCandidates) * 100) : 0;
  const benchUtilization = totalSubmissions ? Math.round((totalSubmissions / Math.max(benchCandidates, 1)) * 10) : 0;
  const closureRate = openJobs + closedJobs ? Math.round((closedJobs / (openJobs + closedJobs)) * 100) : 0;

  const summaryMetrics = [
    {
      id: 'fill-rate',
      label: 'Fill rate',
      value: `${Number.isFinite(fillRate) ? fillRate : 0}%`,
      icon: Users,
      trend: '+4.6% vs last week',
    },
    {
      id: 'bench-util',
      label: 'Bench leverage',
      value: `${Number.isFinite(benchUtilization) ? benchUtilization : 0}%`,
      icon: Target,
      trend: 'Goal: 12%+',
    },
    {
      id: 'closure-rate',
      label: 'Job closure rate',
      value: `${Number.isFinite(closureRate) ? closureRate : 0}%`,
      icon: Briefcase,
      trend: 'Across past 30 days',
    },
  ];

  return (
    <Card className="flex h-full flex-col justify-between">
      <CardHeader>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Talent ops</p>
        <CardTitle className="text-lg">Where to focus next</CardTitle>
        <CardDescription>Guidance derived from current pipeline momentum.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          {summaryMetrics.map((metric) => (
            <div
              key={metric.id}
              className="flex flex-col gap-2 rounded-2xl border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted),0.65)] p-4"
            >
              <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted">
                <metric.icon size={14} />
                {metric.label}
              </span>
              <span className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">{metric.value}</span>
              <span className="text-xs text-muted">{metric.trend}</span>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Plays for this week</p>
          <ul className="space-y-3">
            {highlights.map((highlight) => (
              <li
                key={highlight.id}
                className="flex items-center gap-3 rounded-2xl border border-transparent bg-[rgba(var(--app-surface-muted),0.5)] p-4 transition hover:border-[rgba(var(--app-primary-from),0.35)]"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[rgba(var(--app-primary-from),0.75)] to-[rgba(var(--app-primary-to),0.75)]" aria-hidden />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[rgb(var(--app-text-primary))]">{highlight.label}</span>
                  <span className="text-xs text-muted">{highlight.description}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
