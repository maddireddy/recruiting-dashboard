import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../../lib/utils';

export type PipelineStage = {
  status: string;
  count: number;
  conversionRate: number;
  delta?: number;
  color: string;
};

export function PipelineOverview({ stages }: { stages: PipelineStage[] }) {
  const maxCount = Math.max(...stages.map((stage) => stage.count), 1);

  return (
    <Card className="flex h-full flex-col justify-between">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Pipeline</p>
          <CardTitle className="text-lg">Stage health</CardTitle>
          <CardDescription>Monitor throughput and drop-off across your funnel.</CardDescription>
        </div>
        <span className="chip surface-muted text-xs">Live sync</span>
      </CardHeader>
      <CardContent className="space-y-5">
        {stages.map((stage) => {
          const width = Math.max((stage.count / maxCount) * 100, 4);
          const conversion = Math.round(stage.conversionRate * 100);
          const delta = stage.delta ?? 0;
          const deltaLabel = `${delta >= 0 ? '+' : '−'}${Math.abs(delta).toFixed(0)}%`;
          const deltaClass = cn(
            'text-xs font-medium',
            delta === 0 ? 'text-muted' : delta > 0 ? 'text-emerald-400' : 'text-rose-400'
          );

          return (
            <div key={stage.status} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span>{stage.status}</span>
                </div>
                <span className="text-sm font-semibold text-[rgb(var(--app-text-primary))]">
                  {stage.count.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Conversion {conversion}%</span>
                <span className={deltaClass}>{delta === 0 ? 'Stable' : `${deltaLabel} vs last stage`}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(var(--app-border-subtle))]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${width}%`,
                    backgroundImage: `linear-gradient(90deg, ${stage.color}, rgba(255,255,255,0.1))`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
