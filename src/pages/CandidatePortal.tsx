import { useState } from 'react';
import { Briefcase, Calendar, FileText, CheckCircle } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';

export default function CandidatePortalPage() {
  const [applications] = useState([
    { id: '1', jobTitle: 'Senior React Developer', company: 'Acme Corp', status: 'INTERVIEWING', appliedDate: '2025-01-10', nextStep: 'Technical Interview on Jan 25' },
    { id: '2', jobTitle: 'Frontend Engineer', company: 'Tech Inc', status: 'OFFER', appliedDate: '2024-12-15', nextStep: 'Review offer letter' },
    { id: '3', jobTitle: 'Full Stack Developer', company: 'StartupXYZ', status: 'REJECTED', appliedDate: '2024-12-01', nextStep: null },
  ]);

  const STATUS_COLORS = {
    APPLIED: 'bg-blue-500/15 text-blue-300',
    INTERVIEWING: 'bg-purple-500/15 text-purple-300',
    OFFER: 'bg-green-500/15 text-green-300',
    REJECTED: 'bg-red-500/15 text-red-300',
    ACCEPTED: 'bg-indigo-500/15 text-indigo-300',
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Candidate Self-Service Portal"
        subtitle="Candidates can track application status, update profiles, and schedule interviews"
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15">
              <Briefcase className="text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Active Applications</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">
                {applications.filter(a => a.status !== 'REJECTED' && a.status !== 'ACCEPTED').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/15">
              <Calendar className="text-purple-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Interviews</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">
                {applications.filter(a => a.status === 'INTERVIEWING').length}
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
              <p className="text-sm text-muted">Offers</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">
                {applications.filter(a => a.status === 'OFFER').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/15">
              <FileText className="text-indigo-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Total</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">{applications.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-4 text-lg font-semibold text-[rgb(var(--app-text-primary))]">My Applications</h2>
        <div className="space-y-3">
          {applications.map(app => (
            <div key={app.id} className="flex flex-col gap-3 rounded-lg border border-[rgba(var(--app-border-subtle))] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-[rgb(var(--app-text-primary))]">{app.jobTitle}</h3>
                <p className="mt-1 text-sm text-muted">{app.company}</p>
                <p className="mt-1 text-xs text-muted">Applied on {app.appliedDate}</p>
                {app.nextStep && (
                  <p className="mt-2 text-sm text-indigo-400">→ {app.nextStep}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`chip ${STATUS_COLORS[app.status as keyof typeof STATUS_COLORS]}`}>
                  {app.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
