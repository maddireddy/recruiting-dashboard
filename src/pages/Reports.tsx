import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportService } from '../services/report.service';
import type { Report } from '../types/report';
import { useState } from 'react';
import { Play, Download, Trash2, TrendingUp } from 'lucide-react';

const REPORT_TYPE_COLORS = {
  PLACEMENT: 'bg-green-500/20 text-green-400',
  REVENUE: 'bg-blue-500/20 text-blue-400',
  PIPELINE: 'bg-yellow-500/20 text-yellow-400',
  ACTIVITY: 'bg-purple-500/20 text-purple-400',
  CANDIDATE_SUMMARY: 'bg-pink-500/20 text-pink-400',
  CLIENT_SUMMARY: 'bg-indigo-500/20 text-indigo-400',
  CUSTOM: 'bg-gray-500/20 text-gray-400',
};

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const [executionResults, setExecutionResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const reportsQuery = useQuery({
    queryKey: ['reports'],
    queryFn: () => reportService.getAll(0, 100).then(r => r.data.content || [])
  });

  const executeReport = useMutation({
    mutationFn: (id: string) => reportService.execute(id),
    onSuccess: (data) => {
      setExecutionResults(data.data);
      setShowResults(true);
    }
  });

  const deleteReport = useMutation({
    mutationFn: (id: string) => reportService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports'] })
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-dark-600">Generate insights and export data</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => reportService.exportCandidatesCSV()}
            className="flex items-center gap-2 px-4 py-2 bg-dark-200 hover:bg-dark-300 rounded transition"
          >
            <Download size={18} />
            Export Candidates
          </button>
          <button
            onClick={() => reportService.exportJobsCSV()}
            className="flex items-center gap-2 px-4 py-2 bg-dark-200 hover:bg-dark-300 rounded transition"
          >
            <Download size={18} />
            Export Jobs
          </button>
          <button
            onClick={() => reportService.exportSubmissionsCSV()}
            className="flex items-center gap-2 px-4 py-2 bg-dark-200 hover:bg-dark-300 rounded transition"
          >
            <Download size={18} />
            Export Submissions
          </button>
        </div>
      </div>

      {reportsQuery.isLoading && <p>Loading reports...</p>}
      {reportsQuery.error && <p className="text-red-500">Error loading reports</p>}

      {reportsQuery.data && reportsQuery.data.length === 0 && (
        <div className="text-center py-12 bg-dark-100 rounded-lg border border-dark-200">
          <TrendingUp size={48} className="mx-auto mb-4 text-dark-600" />
          <p className="text-dark-600">No reports available yet</p>
        </div>
      )}

      {reportsQuery.data && reportsQuery.data.length > 0 && (
        <div className="grid gap-4 mb-8">
          {reportsQuery.data.map((report: Report) => (
            <div
              key={report.id}
              className="bg-dark-100 rounded-lg border border-dark-200 p-5 hover:border-primary-500 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{report.reportName}</h3>
                    <span className={`px-3 py-1 text-xs rounded ${REPORT_TYPE_COLORS[report.reportType]}`}>
                      {report.reportType.replace('_', ' ')}
                    </span>
                    {report.isPublic && (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                        Public
                      </span>
                    )}
                  </div>
                  {report.description && (
                    <p className="text-sm text-dark-600 mb-2">{report.description}</p>
                  )}
                  {report.lastRunAt && (
                    <p className="text-xs text-dark-500">
                      Last run: {new Date(report.lastRunAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => executeReport.mutate(report.id!)}
                    disabled={executeReport.status === 'pending'}
                    className="p-2 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 rounded transition disabled:opacity-50"
                    title="Run Report"
                  >
                    <Play size={16} />
                  </button>
                  <button
                    onClick={() => reportService.exportReportCSV(report.id!)}
                    className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded transition"
                    title="Export CSV"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this report?')) {
                        deleteReport.mutate(report.id!);
                      }
                    }}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showResults && executionResults.length > 0 && (
        <div className="bg-dark-100 rounded-lg border border-dark-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Report Results ({executionResults.length} rows)</h2>
            <button
              onClick={() => setShowResults(false)}
              className="text-sm text-dark-600 hover:text-white"
            >
              Close
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-dark-300">
              <thead className="bg-dark-200">
                <tr>
                  {Object.keys(executionResults[0]).map(key => (
                    <th key={key} className="px-4 py-3 text-left text-xs font-medium text-dark-600 uppercase tracking-wider">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-300">
                {executionResults.map((row, idx) => (
                  <tr key={idx} className="hover:bg-dark-200/50">
                    {Object.values(row).map((value: any, colIdx) => (
                      <td key={colIdx} className="px-4 py-3 text-sm whitespace-nowrap">
                        {value !== null && value !== undefined ? String(value) : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
