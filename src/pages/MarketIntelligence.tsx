import { useMemo, useState } from 'react';
import { useList } from '../services/hooks';
import { marketIntelligenceService } from '../services/marketIntelligence.service';
import type { MarketTrend, MarketSummary } from '../types/marketIntelligence';

export default function MarketIntelligencePage() {
  const tenantId = localStorage.getItem('tenantId') || undefined;
  const [region, setRegion] = useState<string>('');
  const [role, setRole] = useState<string>('');

  const summaryQ = useList<MarketSummary>('market-summary', () => marketIntelligenceService.getSummary({ region, role }, tenantId), tenantId);

  const trendsQ = useList<MarketTrend[]>('market-trends', () => marketIntelligenceService.getTrends({ region, role }, tenantId), tenantId);

  const summary = useMemo(() => summaryQ.data, [summaryQ.data]);
  const trends = useMemo(() => trendsQ.data || [], [trendsQ.data]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-end gap-3">
        <div>
          <label className="block text-sm mb-1">Region</label>
          <input value={region} onChange={(e) => setRegion(e.target.value)} className="border rounded px-3 py-2" placeholder="e.g., US-East" />
        </div>
        <div>
          <label className="block text-sm mb-1">Role</label>
          <input value={role} onChange={(e) => setRole(e.target.value)} className="border rounded px-3 py-2" placeholder="e.g., Frontend Engineer" />
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            summaryQ.refetch();
            trendsQ.refetch();
          }}
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <h2 className="font-semibold mb-2">Summary</h2>
          {summaryQ.isLoading && <div>Loading…</div>}
          {summaryQ.error && <div className="text-red-500">Failed to load summary</div>}
          {summary && (
            <ul className="text-sm space-y-1">
              <li><strong>Region:</strong> {summary.region || '-'}</li>
              <li><strong>Role:</strong> {summary.role || '-'}</li>
              <li><strong>Avg Salary:</strong> {summary.avgSalary ? `$${summary.avgSalary.toLocaleString()}` : '-'}</li>
              <li><strong>Openings:</strong> {summary.openings ?? '-'}</li>
              <li><strong>Time to Hire:</strong> {summary.timeToHireDays ? `${summary.timeToHireDays} days` : '-'}</li>
              <li><strong>Updated:</strong> {summary.updatedAt ? new Date(summary.updatedAt).toLocaleString() : '-'}</li>
            </ul>
          )}
        </div>

        <div className="md:col-span-2 card p-4">
          <h2 className="font-semibold mb-2">Trends</h2>
          {trendsQ.isLoading && <div>Loading…</div>}
          {trendsQ.error && <div className="text-red-500">Failed to load trends</div>}
          <div className="space-y-6">
            {trends.map((trend) => (
              <div key={trend.id}>
                <h3 className="text-sm font-semibold mb-2">{trend.name}</h3>
                <div className="h-32 w-full bg-gray-50 border rounded flex items-end gap-1 p-2">
                  {trend.series.map((pt, idx) => (
                    <div
                      key={idx}
                      title={`${pt.date}: ${pt.value}`}
                      className="bg-blue-400"
                      style={{ height: Math.max(4, Math.min(100, pt.value)), width: 8 }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
