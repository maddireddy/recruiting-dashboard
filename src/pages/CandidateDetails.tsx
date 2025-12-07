import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Briefcase, Calendar, DollarSign, User, Mail, Phone, Award, Clock, Sparkles } from 'lucide-react';
import Timeline, { type TimelineItem } from '../components/common/Timeline';
import CandidateDocuments from '../components/candidates/CandidateDocuments';
import { candidateService } from '../services/candidate.service';
import { submissionService } from '../services/submission.service';
import type { Candidate as CandidateType } from '../types/candidate';

export default function CandidateDetails() {
  const { id } = useParams<{ id: string }>();

  const candidateQuery = useQuery({
    queryKey: ['candidate', id],
    enabled: !!id,
    queryFn: () => candidateService.getById(id!).then(r => r.data),
  });

  const submissionsQuery = useQuery({
    queryKey: ['submissions', 'candidate', id],
    enabled: !!id,
    queryFn: () => submissionService.getByCandidate(id!).then(r => r.data),
  });

  if (candidateQuery.isLoading) {
    return (
      <div className="px-6 py-8">
        <div className="card space-y-3">
          <div className="h-4 w-40 animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
          <div className="h-4 w-2/3 animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
        </div>
      </div>
    );
  }

  if (candidateQuery.error) {
    return (
      <div className="px-6 py-8">
        <div className="card border-red-400/40 bg-red-500/5 text-red-300">Failed to load candidate.</div>
      </div>
    );
  }

  const c = candidateQuery.data as CandidateType;
  const timelineItems: TimelineItem[] = (submissionsQuery.data || []).flatMap((s) => {
    const items: TimelineItem[] = [];
    if (s.submittedDate) {
      items.push({
        id: `${s.id}-submitted`,
        date: s.submittedDate,
        title: `Submitted to ${s.client}`,
        subtitle: s.jobTitle,
        chip: 'SUBMITTED',
        statusColor: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
        href: `/jobs/${s.jobId}`,
      });
    }
    if (s.interviewDate) {
      items.push({
        id: `${s.id}-interview`,
        date: s.interviewDate,
        title: `Interview Scheduled at ${s.client}`,
        subtitle: s.jobTitle,
        chip: 'INTERVIEW',
        statusColor: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
        href: `/jobs/${s.jobId}`,
      });
    }
    // Final status point (if offered/rejected/withdrawn/interviewed)
    if (['OFFERED', 'REJECTED', 'WITHDRAWN', 'INTERVIEWED'].includes(s.status)) {
      items.push({
        id: `${s.id}-final`,
        date: s.updatedAt || s.createdAt,
        title: `${s.status.replace('_', ' ')}`,
        subtitle: `${s.client} • ${s.jobTitle}`,
        chip: s.status,
        statusColor:
          s.status === 'OFFERED'
            ? 'bg-green-500/20 border-green-500/40 text-green-300'
            : s.status === 'REJECTED'
            ? 'bg-red-500/20 border-red-500/40 text-red-300'
            : 'bg-dark-200 border-dark-300 text-dark-400',
        href: `/jobs/${s.jobId}`,
      });
    }
    return items;
  });

  const experienceLabel = `${c.totalExperience ?? 0} yrs experience`;
  const locationLabel = (() => {
    if (!c.currentLocation) return 'Not provided';
    if (typeof c.currentLocation === 'string') return c.currentLocation;
    const { city, state, country } = c.currentLocation as { city?: string; state?: string; country?: string };
    return [city, state, country].filter(Boolean).join(', ') || 'Not provided';
  })();
  const notes = (c as { notes?: string | null }).notes;
  const submissions = submissionsQuery.data || [];

  return (
    <div className="space-y-8 px-6 py-8">
      <header className="flex flex-col gap-4">
        <Link to="/candidates" className="btn-muted w-fit">
          <ArrowLeft size={16} />
          Back to candidates
        </Link>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-[rgb(var(--app-text-primary))]">{c.fullName}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
              <span className="chip surface-muted text-xs">{c.visaStatus || 'Visa unknown'}</span>
              <span className="chip surface-muted text-xs">{experienceLabel}</span>
              <span className="chip chip-active text-xs">{c.status || 'Active'}</span>
            </div>
          </div>
        </div>
      </header>

      <section className="card grid gap-6 md:grid-cols-3">
        <div className="space-y-3 text-sm text-muted">
          <div className="flex items-center gap-2 text-[rgb(var(--app-text-primary))]">
            <Mail size={14} />
            <a href={`mailto:${c.email}`} className="underline-offset-2 hover:underline">{c.email}</a>
          </div>
          {c.phone && (
            <div className="flex items-center gap-2 text-[rgb(var(--app-text-primary))]">
              <Phone size={14} />
              <a href={`tel:${c.phone}`} className="underline-offset-2 hover:underline">{c.phone}</a>
            </div>
          )}
          <div>
            <span className="font-semibold text-[rgb(var(--app-text-primary))]">Availability:</span>
            <span className="ml-1 text-muted">{c.availability || 'Unknown'}</span>
          </div>
          <div>
            <span className="font-semibold text-[rgb(var(--app-text-primary))]">Location:</span>
            <span className="ml-1 text-muted">{locationLabel}</span>
          </div>
        </div>
        <div className="md:col-span-2 space-y-3 text-sm text-muted">
          <div>
            <span className="font-semibold text-[rgb(var(--app-text-primary))]">Primary skills:</span>
            <span className="ml-1">{(c.primarySkills || []).join(', ') || '—'}</span>
          </div>
          {c.secondarySkills && c.secondarySkills.length > 0 && (
            <div>
              <span className="font-semibold text-[rgb(var(--app-text-primary))]">Secondary skills:</span>
              <span className="ml-1">{c.secondarySkills.join(', ')}</span>
            </div>
          )}
          {notes && (
            <div className="rounded-2xl border border-dashed border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] p-3 text-sm text-muted">
              {notes}
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-primary-400" />
          <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">Timeline</h2>
        </div>
        <Timeline title="" items={timelineItems} />
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Calendar size={18} className="text-primary-400" />
          <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">Submissions</h2>
        </div>
        {submissionsQuery.isLoading && <div className="card">Loading submissions...</div>}
        {submissionsQuery.error && (
          <div className="card border-red-400/40 bg-red-500/5 text-red-300">Failed to load submissions.</div>
        )}
        {!submissionsQuery.isLoading && !submissionsQuery.error && submissions.length === 0 && (
          <div className="card flex items-center gap-3 text-sm text-muted">
            <Clock size={16} />
            No submissions yet.
          </div>
        )}
        {submissions.length > 0 && (
          <div className="grid gap-3">
            {submissions.map((submission) => (
              <div key={submission.id} className="card flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
                  <span className="inline-flex items-center gap-2">
                    <Briefcase size={14} />
                    {submission.jobTitle}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <User size={14} />
                    {submission.client}
                  </span>
                  {submission.proposedRate && (
                    <span className="inline-flex items-center gap-2">
                      <DollarSign size={14} />
                      ${submission.proposedRate}/hr
                    </span>
                  )}
                  {submission.submittedDate && (
                    <span className="inline-flex items-center gap-2">
                      <Calendar size={14} />
                      {new Date(submission.submittedDate).toLocaleDateString()}
                    </span>
                  )}
                  <span className="chip surface-muted text-xs">{submission.status.replace('_', ' ')}</span>
                </div>
                <Link to={`/jobs/${submission.jobId}`} className="btn-muted px-3 py-2 text-sm">
                  View job
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Award size={18} className="text-primary-400" />
          <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">Documents</h2>
        </div>
        <CandidateDocuments candidateId={id!} />
      </section>
    </div>
  );
}
