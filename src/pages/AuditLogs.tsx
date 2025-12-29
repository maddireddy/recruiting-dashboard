import { useState, useMemo } from 'react';
import { Shield, Search, Download, Eye, User, FileText, Trash2, Edit, Plus } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';

type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'LOGIN' | 'LOGOUT' | 'EXPORT';
type AuditEntity = 'CANDIDATE' | 'JOB' | 'INTERVIEW' | 'OFFER' | 'USER' | 'DOCUMENT' | 'EMAIL';

interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

const ACTION_ICONS: Record<AuditAction, React.ReactElement> = {
  CREATE: <Plus size={16} className="text-green-400" />,
  UPDATE: <Edit size={16} className="text-blue-400" />,
  DELETE: <Trash2 size={16} className="text-red-400" />,
  VIEW: <Eye size={16} className="text-purple-400" />,
  LOGIN: <User size={16} className="text-indigo-400" />,
  LOGOUT: <User size={16} className="text-gray-400" />,
  EXPORT: <Download size={16} className="text-amber-400" />,
};

const ACTION_COLORS = {
  CREATE: 'bg-green-500/15 text-green-300 border-green-500/30',
  UPDATE: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  DELETE: 'bg-red-500/15 text-red-300 border-red-500/30',
  VIEW: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  LOGIN: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  LOGOUT: 'bg-gray-500/15 text-gray-300 border-gray-500/30',
  EXPORT: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
};

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo] = useState('');

  // Mock data - replace with actual API call
  const [logs] = useState<AuditLog[]>([
    {
      id: '1',
      userId: 'user123',
      userEmail: 'admin@acme.com',
      action: 'CREATE',
      entity: 'CANDIDATE',
      entityId: 'cand456',
      details: 'Created candidate "John Doe"',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '2',
      userId: 'user456',
      userEmail: 'recruiter@acme.com',
      action: 'UPDATE',
      entity: 'JOB',
      entityId: 'job789',
      details: 'Updated job "Senior React Developer" status to OPEN',
      ipAddress: '192.168.1.2',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: '3',
      userId: 'user123',
      userEmail: 'admin@acme.com',
      action: 'DELETE',
      entity: 'CANDIDATE',
      entityId: 'cand999',
      details: 'Deleted candidate "Jane Smith"',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '4',
      userId: 'user789',
      userEmail: 'manager@acme.com',
      action: 'EXPORT',
      entity: 'CANDIDATE',
      details: 'Exported 150 candidates to CSV',
      ipAddress: '192.168.1.3',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
    },
  ]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = !searchTerm ||
        log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAction = !selectedAction || log.action === selectedAction;
      const matchesEntity = !selectedEntity || log.entity === selectedEntity;
      const matchesDateFrom = !dateFrom || new Date(log.timestamp) >= new Date(dateFrom);
      const matchesDateTo = !dateTo || new Date(log.timestamp) <= new Date(dateTo);
      return matchesSearch && matchesAction && matchesEntity && matchesDateFrom && matchesDateTo;
    });
  }, [logs, searchTerm, selectedAction, selectedEntity, dateFrom, dateTo]);

  const stats = useMemo(() => {
    const last24h = logs.filter(log => new Date(log.timestamp) > new Date(Date.now() - 86400000));
    const creates = logs.filter(log => log.action === 'CREATE');
    const deletes = logs.filter(log => log.action === 'DELETE');
    const exports = logs.filter(log => log.action === 'EXPORT');

    return {
      total: logs.length,
      last24h: last24h.length,
      creates: creates.length,
      deletes: deletes.length,
      exports: exports.length,
    };
  }, [logs]);

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Entity', 'Details', 'IP Address'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.userEmail,
        log.action,
        log.entity,
        `"${log.details}"`,
        log.ipAddress,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Audit Logs"
        subtitle="Immutable activity trail for security monitoring and compliance auditing"
        actions={
          <Button variant="primary" size="md" onClick={exportLogs}>
            <Download size={16} />
            <span className="ml-2">Export Logs</span>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/15">
              <Shield className="text-indigo-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Total Logs</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15">
              <FileText className="text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Last 24h</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">{stats.last24h}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/15">
              <Plus className="text-green-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Creates</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">{stats.creates}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/15">
              <Trash2 className="text-red-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Deletes</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">{stats.deletes}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15">
              <Download className="text-amber-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Exports</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">{stats.exports}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
            <input
              type="text"
              placeholder="Search by user or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full pl-12"
            />
          </div>
          <select value={selectedAction} onChange={(e) => setSelectedAction(e.target.value)} className="input">
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="VIEW">View</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
            <option value="EXPORT">Export</option>
          </select>
          <select value={selectedEntity} onChange={(e) => setSelectedEntity(e.target.value)} className="input">
            <option value="">All Entities</option>
            <option value="CANDIDATE">Candidate</option>
            <option value="JOB">Job</option>
            <option value="INTERVIEW">Interview</option>
            <option value="OFFER">Offer</option>
            <option value="USER">User</option>
            <option value="DOCUMENT">Document</option>
          </select>
          <div className="flex gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input flex-1"
              placeholder="From"
            />
          </div>
        </div>

        {filteredLogs.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-[rgba(var(--app-border-subtle))] text-muted">
              <Shield size={28} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No audit logs found</h3>
              <p className="mt-1 text-sm text-muted">Try adjusting your filters</p>
            </div>
          </div>
        )}

        {filteredLogs.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-[rgba(var(--app-border-subtle))]">
            <table className="w-full">
              <thead className="bg-[rgb(var(--app-surface-muted))] text-left text-xs font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(var(--app-border-subtle))]">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-[rgba(var(--app-surface-muted),0.4)]">
                    <td className="px-4 py-3 text-sm text-muted">{formatTimestamp(log.timestamp)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-muted" />
                        <span className="text-sm font-medium text-[rgb(var(--app-text-primary))]">{log.userEmail}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`chip flex items-center gap-2 ${ACTION_COLORS[log.action]}`}>
                        {ACTION_ICONS[log.action]}
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="chip surface-muted">{log.entity}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[rgb(var(--app-text-primary))]">{log.details}</td>
                    <td className="px-4 py-3 text-sm text-muted font-mono">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
