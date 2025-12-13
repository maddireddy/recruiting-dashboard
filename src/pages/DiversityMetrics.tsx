import { useMemo } from 'react';
import { useList } from '../services/hooks';
import { diversityMetricsService } from '../services/diversityMetrics.service';
import type { DiversityBreakdown, DiversitySummary } from '../types/diversityMetrics';

export default function DiversityMetricsPage() {
  const tenantId = localStorage.getItem('tenantId') || undefined;
  const summaryQ = useList<DiversitySummary>('diversity-summary', diversityMetricsService.getSummary, tenantId);
  const breakdownsQ = useList<DiversityBreakdown[]>('diversity-breakdowns', diversityMetricsService.getBreakdowns, tenantId);

  const summary = useMemo(() => summaryQ.data, [summaryQ.data]);
  const breakdowns = useMemo(() => breakdownsQ.data || [], [breakdownsQ.data]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Diversity Metrics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <h2 className="font-semibold mb-2">Summary</h2>
          {summaryQ.isLoading && <div>Loading…</div>}
          {summaryQ.error && <div className="text-red-500">Failed to load summary</div>}
          {summary && (
            <ul className="text-sm space-y-1">
              <li><strong>Total Candidates:</strong> {summary.totalCandidates ?? '-'}</li>
              <li><strong>Hires (30d):</strong> {summary.last30DaysHires ?? '-'}</li>
              <li><strong>Underrepresented:</strong> {summary.underrepresentedPercent ? `${summary.underrepresentedPercent}%` : '-'}</li>
              <li><strong>Updated:</strong> {summary.updatedAt ? new Date(summary.updatedAt).toLocaleString() : '-'}</li>
            </ul>
          )}
        </div>

        <div className="md:col-span-2 space-y-6">
          {breakdownsQ.isLoading && <div className="card p-4">Loading breakdowns…</div>}
          {breakdownsQ.error && <div className="card p-4 text-red-500">Failed to load breakdowns</div>}
          {breakdowns.map((b) => (
            <div key={b.id} className="card p-4">
              <h3 className="text-sm font-semibold mb-2">{b.category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {b.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div
                      className="h-3 rounded bg-emerald-500"
                      style={{ width: `${b.type === 'percentage' ? item.value : Math.min(100, item.value)}%` }}
                    />
                    <div className="text-sm">
                      {item.label} — {item.value}{b.type === 'percentage' ? '%' : ''}
                    </div>
                  </div>
                ))}
              </div>
              {b.updatedAt && (
                <p className="text-xs text-muted mt-2">Updated {new Date(b.updatedAt).toLocaleString()}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
