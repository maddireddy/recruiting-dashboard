import { useQuery } from '@tanstack/react-query';
import { emailService } from '../services/email.service';
import type { EmailLog } from '../types/email';
import { Mail, CheckCircle, XCircle, Clock } from 'lucide-react';

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
  const logsQuery = useQuery({
    queryKey: ['email-logs'],
    queryFn: () => emailService.getEmailLogs(0, 100).then(r => r.data.content || [])
  });

  const statsQuery = useQuery({
    queryKey: ['email-stats'],
    queryFn: () => emailService.getEmailStats().then(r => r.data)
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Email Logs</h1>
        <p className="text-dark-600">Track all sent emails and their delivery status</p>
      </div>

      {/* Stats Cards */}
      {statsQuery.data && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-dark-100 rounded-lg border border-dark-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <CheckCircle size={24} className="text-green-400" />
              </div>
              <div>
                <p className="text-sm text-dark-600">Sent Successfully</p>
                <p className="text-2xl font-bold">{statsQuery.data.sent}</p>
              </div>
            </div>
          </div>

          <div className="bg-dark-100 rounded-lg border border-dark-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <XCircle size={24} className="text-red-400" />
              </div>
              <div>
                <p className="text-sm text-dark-600">Failed</p>
                <p className="text-2xl font-bold">{statsQuery.data.failed}</p>
              </div>
            </div>
          </div>

          <div className="bg-dark-100 rounded-lg border border-dark-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Clock size={24} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-dark-600">Pending</p>
                <p className="text-2xl font-bold">{statsQuery.data.pending}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Logs Table */}
      {logsQuery.isLoading && <p>Loading email logs...</p>}
      {logsQuery.error && <p className="text-red-500">Error loading logs</p>}

      {logsQuery.data && logsQuery.data.length === 0 && (
        <div className="text-center py-12 bg-dark-100 rounded-lg border border-dark-200">
          <Mail size={48} className="mx-auto mb-4 text-dark-600" />
          <p className="text-dark-600">No emails sent yet</p>
        </div>
      )}

      {logsQuery.data && logsQuery.data.length > 0 && (
        <div className="bg-dark-100 rounded-lg border border-dark-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-dark-300">
              <thead className="bg-dark-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-dark-600 uppercase tracking-wider">
                    To
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-dark-600 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-dark-600 uppercase tracking-wider">
                    Template
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-dark-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-dark-600 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-300">
                {logsQuery.data.map((log: EmailLog) => (
                  <tr key={log.id} className="hover:bg-dark-200/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-dark-600" />
                        <span className="text-sm">{log.toEmail}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium truncate max-w-xs">{log.subject}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {log.templateUsed ? (
                        <span className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded">
                          {log.templateUsed}
                        </span>
                      ) : (
                        <span className="text-xs text-dark-600">Custom</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border inline-flex ${STATUS_COLORS[log.status]}`}>
                        {STATUS_ICONS[log.status]}
                        <span className="text-xs font-medium">{log.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-dark-600">
                      {log.sentAt 
                        ? new Date(log.sentAt).toLocaleString()
                        : new Date(log.createdAt).toLocaleString()
                      }
                    </td>
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
