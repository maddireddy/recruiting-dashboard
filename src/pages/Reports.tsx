import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Play, Download, Trash2, TrendingUp, FileText } from 'lucide-react';
import { reportService } from '../services/report.service';
import type { Report } from '../types/report';

const REPORT_TYPE_META: Record<Report['reportType'], { label: string; accent: string }> = {
  PLACEMENT: { label: 'Placement', accent: 'bg-[rgba(34,197,94,0.14)] text-[rgb(34,197,94)] border border-[rgba(34,197,94,0.35)]' },
  REVENUE: { label: 'Revenue', accent: 'bg-[rgba(59,130,246,0.16)] text-[rgb(59,130,246)] border border-[rgba(59,130,246,0.4)]' },
  PIPELINE: { label: 'Pipeline', accent: 'bg-[rgba(250,204,21,0.16)] text-[rgb(202,138,4)] border border-[rgba(250,204,21,0.45)]' },
  ACTIVITY: { label: 'Activity', accent: 'bg-[rgba(168,85,247,0.18)] text-[rgb(168,85,247)] border border-[rgba(168,85,247,0.4)]' },
  CANDIDATE_SUMMARY: { label: 'Candidate Summary', accent: 'bg-[rgba(236,72,153,0.18)] text-[rgb(236,72,153)] border border-[rgba(236,72,153,0.38)]' },
  CLIENT_SUMMARY: { label: 'Client Summary', accent: 'bg-[rgba(99,102,241,0.18)] text-[rgb(99,102,241)] border border-[rgba(99,102,241,0.38)]' },
  CUSTOM: { label: 'Custom', accent: 'bg-[rgba(148,163,184,0.18)] text-[rgb(148,163,184)] border border-[rgba(148,163,184,0.35)]' },
};

const EXPORT_ACTIONS = [
  { label: 'Export Candidates', handler: () => reportService.exportCandidatesCSV() },
  { label: 'Export Jobs', handler: () => reportService.exportJobsCSV() },
  { label: 'Export Submissions', handler: () => reportService.exportSubmissionsCSV() },
];

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const [executionResults, setExecutionResults] = useState<Record<string, unknown>[]>([]);
  const [showResults, setShowResults] = useState(false);

  const reportsQuery = useQuery({
    queryKey: ['reports'],
    queryFn: () => reportService.getAll(0, 100).then((r) => r.data.content || []),
  });

  const executeReport = useMutation({
    mutationFn: (id: string) => reportService.execute(id),
    onSuccess: (data) => {
      setExecutionResults(data.data);
      setShowResults(true);
    },
  });

  const deleteReport = useMutation({
    mutationFn: (id: string) => reportService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports'] }),
  });

  const tableColumns = useMemo(() => {
    if (!executionResults.length) return [];
    return Object.keys(executionResults[0]);
  }, [executionResults]);

  return (
    <div className="space-y-10 px-6 py-8">
      <header className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(var(--app-border-subtle))] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            <FileText size={14} />
            Analytics Suite
          </div>
          <h1 className="text-3xl font-semibold text-[rgb(var(--app-text-primary))]">Reports</h1>
          <p className="max-w-2xl text-sm text-muted">
            Generate curated insights, export data slices, and track the health of your recruiting pipeline across clients and roles.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {EXPORT_ACTIONS.map(({ label, handler }) => (
            <button key={label} onClick={handler} type="button" className="btn-muted w-full sm:w-auto sm:min-w-40 justify-center">
              <Download size={18} />
              {label}
            </button>
          ))}
        </div>
      </header>

      {reportsQuery.isLoading && (
        <div className="card space-y-3">
          <div className="h-4 w-48 animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
          <div className="h-4 w-full animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
        </div>
      )}

      {reportsQuery.error && (
        <div className="card border-red-400/40 bg-red-500/5 text-red-300">
          Unable to load reports right now. Please try again shortly.
        </div>
      )}

      {reportsQuery.data && reportsQuery.data.length === 0 && (
        <div className="card flex flex-col items-center justify-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-[rgba(var(--app-border-subtle))] text-muted">
            <TrendingUp size={28} />
          </div>
          <h3 className="text-lg font-semibold">No reports yet</h3>
          <p className="max-w-md text-sm text-muted">
            Kick off your analytics journey by creating a custom report or use the export actions above to pull quick data snapshots.
          </p>
        </div>
      )}

      {reportsQuery.data && reportsQuery.data.length > 0 && (
        <section className="grid gap-4">
          {reportsQuery.data.map((report: Report) => {
            const meta = REPORT_TYPE_META[report.reportType];
            return (
              <article key={report.id} className="card border-transparent transition hover:border-[rgba(var(--app-primary-from),0.45)]">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">{report.reportName}</h3>
                      <span className={`chip ${meta.accent}`}>{meta.label}</span>
                      {report.isPublic && <span className="chip chip-active text-[rgb(var(--app-primary-text))]">Public</span>}
                    </div>
                    {report.description && <p className="max-w-3xl text-sm text-muted">{report.description}</p>}
                    {report.lastRunAt && (
                      <p className="text-xs font-medium text-muted">
                        Last run {formatDateTime(report.lastRunAt)}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2 self-end md:self-start">
                    <button
                      onClick={() => executeReport.mutate(report.id!)}
                      disabled={executeReport.status === 'pending'}
                      title="Run report"
                      type="button"
                      className="btn-primary px-3 py-2 text-sm disabled:opacity-60"
                    >
                      <Play size={16} />
                      Run
                    </button>
                    <button
                      onClick={() => reportService.exportReportCSV(report.id!)}
                      type="button"
                      title="Export CSV"
                      className="btn-muted px-3 py-2 text-sm"
                    >
                      <Download size={16} />
                      CSV
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this report?')) {
                          deleteReport.mutate(report.id!);
                        }
                      }}
                      type="button"
                      title="Delete report"
                      className="btn-muted px-3 py-2 text-sm text-red-400 hover:border-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {showResults && executionResults.length > 0 && (
        <section className="card space-y-4">
          <div className="flex flex-col-reverse items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">Report Results</h2>
              <p className="text-xs text-muted">{executionResults.length} rows returned</p>
            </div>
            <button onClick={() => setShowResults(false)} type="button" className="btn-muted px-3 py-2 text-sm">
              Close
            </button>
          </div>
          <div className="overflow-hidden rounded-xl border border-[rgba(var(--app-border-subtle))]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[rgba(var(--app-border-subtle))]">
                <thead className="bg-[rgb(var(--app-surface-muted))]">
                  <tr>
                    {tableColumns.map((column) => (
                      <th key={column} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em] text-muted">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(var(--app-border-subtle))]">
                  {executionResults.map((row, idx) => (
                    <tr key={idx} className="transition hover:bg-[rgba(var(--app-primary-from),0.08)]">
                      {tableColumns.map((column) => (
                        <td key={column} className="px-4 py-3 text-sm text-[rgb(var(--app-text-primary))]">
                          {formatCellValue(row[column])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const numberFormatter = new Intl.NumberFormat();

function formatDateTime(value: string | number | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return dateTimeFormatter.format(date);
}

function formatCellValue(value: unknown) {
  if (value === null || value === undefined) {
    return '-';
  }

  if (typeof value === 'number') {
    return numberFormatter.format(value);
  }

  if (value instanceof Date || (typeof value === 'string' && !Number.isNaN(Date.parse(value)))) {
    return formatDateTime(value as string | Date);
  }

  return String(value);
}
