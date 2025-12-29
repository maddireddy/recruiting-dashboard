import { useState } from 'react';
import { Globe, TrendingUp, DollarSign, Eye } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';

export default function JobBoardIntegrationPage() {
  const [boards] = useState([
    { id: '1', name: 'LinkedIn', status: 'CONNECTED', jobsPosted: 12, applications: 45, cost: 299 },
    { id: '2', name: 'Indeed', status: 'CONNECTED', jobsPosted: 18, applications: 78, cost: 199 },
    { id: '3', name: 'Glassdoor', status: 'DISCONNECTED', jobsPosted: 0, applications: 0, cost: 0 },
    { id: '4', name: 'ZipRecruiter', status: 'CONNECTED', jobsPosted: 8, applications: 34, cost: 149 },
  ]);

  const STATUS_COLORS = {
    CONNECTED: 'bg-green-500/15 text-green-300 border-green-500/30',
    DISCONNECTED: 'bg-gray-500/15 text-gray-300 border-gray-500/30',
    PENDING: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  };

  const totalStats = {
    jobsPosted: boards.reduce((sum, b) => sum + b.jobsPosted, 0),
    applications: boards.reduce((sum, b) => sum + b.applications, 0),
    cost: boards.reduce((sum, b) => sum + b.cost, 0),
    connected: boards.filter(b => b.status === 'CONNECTED').length,
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Job Board Integration"
        subtitle="Multi-post to Indeed, LinkedIn, Glassdoor with one-click distribution and application auto-import"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/15">
              <Globe className="text-indigo-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Connected Boards</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">{totalStats.connected}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15">
              <TrendingUp className="text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Jobs Posted</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">{totalStats.jobsPosted}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/15">
              <Eye className="text-green-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Applications</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">{totalStats.applications}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15">
              <DollarSign className="text-amber-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Monthly Cost</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">${totalStats.cost}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {boards.map(board => (
          <div key={board.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">{board.name}</h3>
                <span className={`chip mt-2 ${STATUS_COLORS[board.status as keyof typeof STATUS_COLORS]}`}>
                  {board.status}
                </span>
              </div>
              {board.status === 'CONNECTED' ? (
                <Button variant="subtle" size="sm">Configure</Button>
              ) : (
                <Button variant="primary" size="sm">Connect</Button>
              )}
            </div>
            {board.status === 'CONNECTED' && (
              <div className="mt-4 grid grid-cols-3 gap-4 border-t border-[rgba(var(--app-border-subtle))] pt-4">
                <div>
                  <p className="text-xs text-muted">Jobs Posted</p>
                  <p className="mt-1 text-lg font-semibold text-[rgb(var(--app-text-primary))]">{board.jobsPosted}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Applications</p>
                  <p className="mt-1 text-lg font-semibold text-[rgb(var(--app-text-primary))]">{board.applications}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Cost/Month</p>
                  <p className="mt-1 text-lg font-semibold text-[rgb(var(--app-text-primary))]">${board.cost}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
