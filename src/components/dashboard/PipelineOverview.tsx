import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../../lib/utils';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

export type PipelineStage = {
  status: string;
  count: number;
  conversionRate: number;
  delta?: number;
  color: string;
};

export const PipelineOverview = React.memo(function PipelineOverview({ stages }: { stages: PipelineStage[] }) {
  const maxCount = Math.max(...stages.map((stage) => stage.count), 1);
  const totalStages = stages.length;

  return (
    <Card className="flex h-full flex-col justify-between">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Pipeline</p>
          <CardTitle className="text-lg">Stage health</CardTitle>
          <CardDescription>Visualize throughput and conversion across your funnel.</CardDescription>
        </div>
        <span className="chip surface-muted text-xs">Live sync</span>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Funnel Visualization */}
        <div className="flex flex-col items-center gap-3">
          {stages.map((stage, index) => {
            const width = Math.max((stage.count / maxCount) * 100, 8);
            const conversion = Math.round(stage.conversionRate * 100);
            const delta = stage.delta ?? 0;
            const healthColor =
              delta === 0 ? 'from-yellow-500/50 to-yellow-500/30' :
              delta > 0 ? 'from-emerald-500/50 to-emerald-500/30' :
              'from-rose-500/50 to-rose-500/30';
            const healthLabel =
              delta === 0 ? 'Stable' :
              delta > 0 ? 'Growing' :
              'At risk';
            const healthBadgeColor =
              delta === 0 ? 'bg-yellow-500/20 text-yellow-400' :
              delta > 0 ? 'bg-emerald-500/20 text-emerald-400' :
              'bg-rose-500/20 text-rose-400';

            return (
              <div key={stage.status} className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="text-sm font-semibold">{stage.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[rgb(var(--app-text-primary))]">
                      {stage.count.toLocaleString()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${healthBadgeColor}`}>
                      {healthLabel}
                    </span>
                  </div>
                </div>
                <div className={cn(
                  'h-10 rounded-lg flex items-center justify-center relative overflow-hidden bg-gradient-to-r',
                  healthColor
                )} style={{ width: `${width}%` }}>
                  <span className="text-xs font-semibold text-white mix-blend-screen">
                    {conversion}%
                  </span>
                </div>
                {index < stages.length - 1 && (
                  <div className="flex justify-center py-2">
                    <div className="text-muted text-xs font-medium">
                      {delta === 0 && <Minus size={14} />}
                      {delta > 0 && <TrendingUp size={14} className="text-emerald-400" />}
                      {delta < 0 && <TrendingDown size={14} className="text-rose-400" />}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="border-t border-[rgba(var(--app-border-subtle))] pt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted">Total Pipeline</p>
            <p className="text-lg font-semibold">{stages.reduce((sum, s) => sum + s.count, 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Avg Conversion</p>
            <p className="text-lg font-semibold">
              {totalStages > 0 ? Math.round((stages.reduce((sum, s) => sum + s.conversionRate, 0) / totalStages) * 100) : 0}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
