import { useMemo, useState } from 'react';
import { useList } from '../services/hooks';
import { Mail, CheckCircle, XCircle, Clock, BarChart3 } from 'lucide-react';
import EmailLogModal from '../components/email/EmailLogModal';
import StatsCard from '../components/dashboard/StatsCard';
import { emailService } from '../services/email.service';
import type { EmailLog } from '../types/email';

const STATUS_COLORS = {
  SENT: 'bg-green-500/20 text-green-400 border-green-500/30',
  FAILED: 'bg-red-500/20 text-red-400 border-red-500/30',
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  QUEUED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  BOUNCED: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const STATUS_ICONS = {
  SENT: <CheckCircle size={16} />,
  FAILED: <XCircle size={16} />,
  PENDING: <Clock size={16} />,
  QUEUED: <Clock size={16} />,
  BOUNCED: <XCircle size={16} />,
};

export default function EmailLogsPage() {
  const tenantId = localStorage.getItem('tenantId') || undefined;
  const logsQuery = useList<EmailLog[]>('email-logs', () => emailService.getEmailLogs(0, 100), tenantId);
  const statsQuery = useList<{ sent: number; failed: number; pending: number }>('email-stats', () => emailService.getEmailStats(), tenantId);

  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);

  const logs = useMemo(() => logsQuery.data || [], [logsQuery.data]);

  return (
    <div className="space-y-8 px-6 py-8">
      <header className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(var(--app-border-subtle))] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          <BarChart3 size={14} />
          Delivery Insights
        </div>
        <h1 className="text-3xl font-semibold text-[rgb(var(--app-text-primary))]">Email Logs</h1>
        <p className="max-w-2xl text-sm text-muted">
          Track delivery across campaigns, triage failures quickly, and keep a record of every template used.
        </p>
      </header>

      {statsQuery.data && (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatsCard title="Sent successfully" value={statsQuery.data.sent} icon={<CheckCircle size={18} className="text-green-400" />} />
          <StatsCard title="Failed deliveries" value={statsQuery.data.failed} icon={<XCircle size={18} className="text-red-400" />} />
          <StatsCard title="Pending queue" value={statsQuery.data.pending} icon={<Clock size={18} className="text-amber-400" />} />
        </section>
      )}

      {logsQuery.isLoading && (
        <div className="card space-y-3">
          <div className="h-4 w-48 animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
          <div className="h-4 w-full animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
          <div className="h-4 w-2/3 animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
        </div>
      )}

      {!logsQuery.isLoading && logsQuery.error && (
        <div className="card border-red-400/40 bg-red-500/5 text-red-300">
          Error loading email logs. Refresh and try again.
        </div>
      )}

      {!logsQuery.isLoading && !logsQuery.error && logs.length === 0 && (
        <div className="card flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-[rgba(var(--app-border-subtle))] text-muted">
            <Mail size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">No emails sent yet</h3>
            <p className="max-w-sm text-sm text-muted">Emails triggered from templates and automations will appear here for auditing.</p>
          </div>
        </div>
      )}

      {logs.length > 0 && (
        <section className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] text-xs uppercase tracking-[0.18em] text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">To</th>
                  <th className="px-4 py-3 font-semibold">Subject</th>
                  <th className="px-4 py-3 font-semibold">Template</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: EmailLog) => {
                  const statusKey = (log.status || 'PENDING').toUpperCase() as keyof typeof STATUS_COLORS;
                  const statusClasses = STATUS_COLORS[statusKey] ?? STATUS_COLORS.PENDING;
                  const statusIcon = STATUS_ICONS[statusKey] ?? STATUS_ICONS.PENDING;
                  return (
                  <tr
                    key={log.id}
                    className="cursor-pointer border-b border-[rgba(var(--app-border-subtle))] text-[rgb(var(--app-text-primary))] transition hover:bg-[rgba(var(--app-surface-muted),0.6)]"
                    onClick={() => setSelectedLog(log)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-muted">
                        <Mail size={16} />
                        <span className="text-[rgb(var(--app-text-primary))]">{log.toEmail}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-[260px] truncate text-sm">{log.subject}</td>
                    <td className="px-4 py-3 text-xs">
                      {log.templateUsed ? (
                        <span className="chip surface-muted">{log.templateUsed}</span>
                      ) : (
                        <span className="text-muted">Custom</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`chip ${statusClasses} inline-flex items-center gap-2`}>{statusIcon}<span className="font-medium">{statusKey}</span></span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">
                      {log.sentAt ? new Date(log.sentAt).toLocaleString() : new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {selectedLog && (
        <EmailLogModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
}
