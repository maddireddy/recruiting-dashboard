import { useState } from 'react';
import { Users, CheckCircle, Clock, Plus } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';

const STATUS_COLORS = {
  PENDING: 'bg-amber-500/15 text-amber-300',
  IN_PROGRESS: 'bg-blue-500/15 text-blue-300',
  COMPLETED: 'bg-green-500/15 text-green-300',
};

export default function OnboardingPage() {
  const [onboarding] = useState([
    { id: '1', candidateName: 'Alice Johnson', role: 'Senior Developer', status: 'IN_PROGRESS', progress: 60, startDate: '2025-01-15' },
    { id: '2', candidateName: 'Bob Smith', role: 'Product Manager', status: 'COMPLETED', progress: 100, startDate: '2025-01-10' },
    { id: '3', candidateName: 'Carol Davis', role: 'UX Designer', status: 'PENDING', progress: 0, startDate: '2025-01-20' },
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="New Hire Onboarding"
        subtitle="Digital onboarding workflows with document collection, task checklists, and e-signatures"
        actions={
          <Button variant="primary" size="md">
            <Plus size={16} />
            <span className="ml-2">New Onboarding</span>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15">
              <Users className="text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Total</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">{onboarding.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15">
              <Clock className="text-amber-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">In Progress</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">
                {onboarding.filter(o => o.status === 'IN_PROGRESS').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/15">
              <CheckCircle className="text-green-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Completed</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">
                {onboarding.filter(o => o.status === 'COMPLETED').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-[rgb(var(--app-surface-muted))] text-left text-xs font-semibold uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3">Candidate</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Start Date</th>
              <th className="px-4 py-3">Progress</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(var(--app-border-subtle))]">
            {onboarding.map(item => (
              <tr key={item.id} className="hover:bg-[rgba(var(--app-surface-muted),0.4)]">
                <td className="px-4 py-3 font-medium text-[rgb(var(--app-text-primary))]">{item.candidateName}</td>
                <td className="px-4 py-3 text-sm text-muted">{item.role}</td>
                <td className="px-4 py-3 text-sm text-muted">{item.startDate}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-[rgba(var(--app-border-subtle))]">
                      <div className="h-full bg-indigo-500" style={{ width: `${item.progress}%` }} />
                    </div>
                    <span className="text-sm text-muted">{item.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`chip ${STATUS_COLORS[item.status as keyof typeof STATUS_COLORS]}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
