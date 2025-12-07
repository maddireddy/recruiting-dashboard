import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  Briefcase,
  Calendar,
  CalendarClock,
  ClipboardList,
  Clock,
  DollarSign,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Target,
  User,
} from 'lucide-react';

import Timeline, { type TimelineItem } from '../components/common/Timeline';
import CandidateDocuments from '../components/candidates/CandidateDocuments';
import { candidateService } from '../services/candidate.service';
import { submissionService } from '../services/submission.service';
import type { Candidate } from '../types/candidate';
import type { Submission } from '../types/submission';

type BadgeToken = {
  key: string;
  label: string;
  className: string;
};

const prettify = (value?: string | null) => {
  if (!value) return 'Unknown';
  return value
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const availabilityBadge = (availability?: string | null): BadgeToken | null => {
  if (!availability) return null;

  const normalized = availability.toUpperCase();
  const mapping: Record<string, BadgeToken> = {
    IMMEDIATE: {
      key: 'IMMEDIATE',
      label: 'Immediate start',
      className: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200',
    },
    TWO_WEEKS: {
      key: 'TWO_WEEKS',
      label: 'Two weeks notice',
      className: 'border-amber-400/40 bg-amber-500/15 text-amber-200',
    },
    NOTICE_PERIOD: {
      key: 'NOTICE_PERIOD',
      label: 'On notice period',
      className: 'border-blue-400/40 bg-blue-500/15 text-blue-200',
    },
    CONTRACTING: {
      key: 'CONTRACTING',
      label: 'Contracting',
      className: 'border-purple-400/40 bg-purple-500/15 text-purple-200',
    },
  };

  return (
    mapping[normalized] || {
      key: normalized,
      label: prettify(availability),
      className: 'border-slate-500/40 bg-slate-600/20 text-slate-200',
    }
  );
};

const statusBadge = (status?: string | null, fallback?: BadgeToken | null): BadgeToken => {
  if (!status) {
    return (
      fallback || {
        key: 'ACTIVE',
        label: 'Active',
        className: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200',
      }
    );
  }

  const normalized = status.toUpperCase();
  const mapping: Record<string, string> = {
    ACTIVE: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200',
    PROSPECT: 'border-blue-400/40 bg-blue-500/15 text-blue-200',
    INTERVIEWING: 'border-purple-400/40 bg-purple-500/15 text-purple-200',
    HIRED: 'border-sky-400/40 bg-sky-500/15 text-sky-200',
    ARCHIVED: 'border-slate-500/40 bg-slate-600/25 text-slate-200',
  };

  return {
    key: normalized,
    label: prettify(status),
    className: mapping[normalized] || 'border-slate-500/40 bg-slate-600/25 text-slate-200',
  };
};

const getLocationLabel = (candidate: Candidate): string => {
  const location = candidate.currentLocation;
  if (!location || location === 'UNKNOWN') {
    if (candidate.preferredLocations && candidate.preferredLocations.length > 0) {
      return candidate.preferredLocations.join(', ');
    }
    return 'Not provided';
  }

  if (typeof location === 'string') {
    return location;
  }

  if (typeof location === 'object') {
    const { city, state, country } = location as Record<string, string | undefined>;
    const formatted = [city, state, country].filter(Boolean).join(', ');
    return formatted || 'Not provided';
  }

  return 'Not provided';
};

const buildTimelineItems = (submissions: Submission[]): TimelineItem[] =>
  submissions.flatMap((submission) => {
    const items: TimelineItem[] = [];

    if (submission.submittedDate) {
      items.push({
        id: `${submission.id}-submitted`,
        date: submission.submittedDate,
        title: `Submitted to ${submission.client}`,
        subtitle: submission.jobTitle,
        chip: 'Submitted',
        statusColor: 'bg-sky-500/15 border-sky-400/40 text-sky-200',
        href: `/jobs/${submission.jobId}`,
      });
    }

    if (submission.interviewDate) {
      items.push({
        id: `${submission.id}-interview`,
        date: submission.interviewDate,
        title: `Interview scheduled with ${submission.client}`,
        subtitle: submission.jobTitle,
        chip: 'Interview',
        statusColor: 'bg-purple-500/15 border-purple-400/40 text-purple-200',
        href: `/jobs/${submission.jobId}`,
      });
    }

    if (['OFFERED', 'REJECTED', 'WITHDRAWN', 'INTERVIEWED'].includes(submission.status)) {
      const statusLabel = prettify(submission.status);
      items.push({
        id: `${submission.id}-final`,
        date: submission.updatedAt || submission.createdAt,
        title: statusLabel,
        subtitle: `${submission.client} • ${submission.jobTitle}`,
        chip: statusLabel,
        statusColor:
          submission.status === 'OFFERED'
            ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200'
            : submission.status === 'REJECTED'
            ? 'bg-rose-500/15 border-rose-400/40 text-rose-200'
            : 'bg-slate-600/25 border-slate-500/40 text-slate-200',
        href: `/jobs/${submission.jobId}`,
      });
    }

    return items;
  });

const CandidateDetails = () => {
  const { id } = useParams<{ id: string }>();

  const candidateQuery = useQuery<Candidate>({
    queryKey: ['candidate', id],
    queryFn: async (): Promise<Candidate> => {
      if (!id) throw new Error('Candidate id missing');
      const response = await candidateService.getById(id);
      return response.data as unknown as Candidate;
    },
    enabled: Boolean(id),
  });

  const submissionsQuery = useQuery<Submission[]>({
    queryKey: ['candidate-submissions', id],
    queryFn: async (): Promise<Submission[]> => {
      if (!id) return [] as Submission[];
      const response = await submissionService.getByCandidate(id);
      return response.data ?? [];
    },
    enabled: Boolean(id),
  });

  if (!id) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-12 text-center text-muted">
        <ShieldCheck className="h-8 w-8 text-[rgb(var(--app-primary-from))]" />
        <p className="text-sm font-medium">Candidate identifier not provided.</p>
      </div>
    );
  }

  if (candidateQuery.isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-12 text-muted">
        <Loader2 className="h-6 w-6 animate-spin text-[rgb(var(--app-primary-from))]" />
        <span className="text-sm">Loading candidate profile…</span>
      </div>
    );
  }

  if (candidateQuery.error || !candidateQuery.data) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-12 text-center">
        <ShieldCheck className="h-8 w-8 text-rose-300" />
        <div className="space-y-1">
          <p className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">Unable to load candidate</p>
          <p className="text-sm text-muted">Please refresh the page or try again later.</p>
        </div>
      </div>
    );
  }

  const candidate = candidateQuery.data;
  const submissions = submissionsQuery.data ?? [];
  const availabilityToken = availabilityBadge(candidate.availability);
  const primaryStatus = statusBadge(candidate.status, availabilityToken);
  const secondaryStatus =
    availabilityToken && availabilityToken.key !== primaryStatus.key ? availabilityToken : null;
  const locationLabel = getLocationLabel(candidate);
  const notes = (candidate.notes || '').trim();
  const availableFromLabel = candidate.availableFrom
    ? new Date(candidate.availableFrom).toLocaleDateString()
    : null;
  const timelineItems = buildTimelineItems(submissions);

  const insightTiles = [
    {
      key: 'experience',
      label: 'Experience',
      value: `${candidate.totalExperience ?? 0} yrs`,
      helper: candidate.relevantExperience ? `${candidate.relevantExperience} yrs relevant` : null,
      icon: <Target size={18} className="text-[rgb(var(--app-primary-from))]" />,
    },
    {
      key: 'availability',
      label: 'Availability',
      value: candidate.availability ? prettify(candidate.availability) : 'Unknown',
      helper: availableFromLabel ? `From ${availableFromLabel}` : null,
      icon: <CalendarClock size={18} className="text-emerald-300" />,
    },
    {
      key: 'visa',
      label: 'Visa status',
      value: candidate.visaStatus || 'Not provided',
      helper: candidate.needsSponsorship ? 'Requires sponsorship' : null,
      icon: <ShieldCheck size={18} className="text-sky-300" />,
    },
    {
      key: 'submissions',
      label: 'Submissions',
      value: submissions.length,
      helper:
        submissions.length > 0
          ? `${submissions.filter((s) => s.status === 'SUBMITTED').length} active`
          : 'No activity yet',
      icon: <ClipboardList size={18} className="text-amber-300" />,
    },
  ];

  return (
    <div className="space-y-10 px-6 pb-16 pt-8">
      <Link to="/candidates" className="btn-muted w-fit gap-2">
        <ArrowLeft size={16} />
        Back to candidates
      </Link>

      <section className="relative overflow-hidden rounded-3xl border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-elevated))] p-8 shadow-[0_50px_120px_-60px_rgba(15,23,42,0.45)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(var(--app-primary-from),0.22),_rgba(var(--app-surface),0))]" />
        <div className="relative flex flex-col gap-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(var(--app-primary-from),0.35)] bg-[rgba(var(--app-primary-from),0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--app-primary-from))]">
                <Sparkles size={14} />
                Candidate profile
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold text-[rgb(var(--app-text-primary))]">
                  {candidate.fullName || 'Unnamed candidate'}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${primaryStatus.className}`}
                  >
                    {primaryStatus.label}
                  </span>
                  {secondaryStatus && (
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${secondaryStatus.className}`}
                    >
                      {secondaryStatus.label}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(var(--app-border-subtle))] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                    {candidate.visaStatus || 'Visa unknown'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row lg:w-auto lg:flex-col">
              {candidate.email && (
                <a href={`mailto:${candidate.email}`} className="btn-primary w-full justify-center gap-2">
                  <Mail size={18} />
                  Email
                </a>
              )}
              {candidate.phone && (
                <a href={`tel:${candidate.phone}`} className="btn-muted w-full justify-center gap-2">
                  <Phone size={18} />
                  Call
                </a>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="flex items-start gap-3 rounded-2xl border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted))] p-4">
              <Mail size={18} className="mt-1 text-muted" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Email</p>
                <a
                  href={candidate.email ? `mailto:${candidate.email}` : undefined}
                  className="truncate text-sm text-[rgb(var(--app-text-primary))] underline-offset-2 hover:underline"
                >
                  {candidate.email || 'Not provided'}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted))] p-4">
              <Phone size={18} className="mt-1 text-muted" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Phone</p>
                {candidate.phone ? (
                  <a
                    href={`tel:${candidate.phone}`}
                    className="text-sm text-[rgb(var(--app-text-primary))] underline-offset-2 hover:underline"
                  >
                    {candidate.phone}
                  </a>
                ) : (
                  <span className="text-sm text-muted">Not provided</span>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted))] p-4">
              <CalendarClock size={18} className="mt-1 text-muted" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Availability</p>
                <p className="text-sm text-[rgb(var(--app-text-primary))]">
                  {candidate.availability ? prettify(candidate.availability) : 'Unknown'}
                </p>
                {availableFromLabel && <p className="text-xs text-muted">Available from {availableFromLabel}</p>}
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted))] p-4">
              <MapPin size={18} className="mt-1 text-muted" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Location</p>
                <p className="text-sm text-[rgb(var(--app-text-primary))]">{locationLabel}</p>
              </div>
            </div>
          </div>

          {notes && (
            <div className="rounded-2xl border border-dashed border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted))] p-4 text-sm text-muted">
              {notes}
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {insightTiles.map((tile) => (
          <div
            key={tile.key}
            className="rounded-2xl border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-elevated))] p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-[rgba(var(--app-surface-muted))] p-2">{tile.icon}</div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{tile.label}</p>
                <p className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">
                  {typeof tile.value === 'number' ? tile.value.toLocaleString() : tile.value}
                </p>
                {tile.helper && <p className="text-xs text-muted">{tile.helper}</p>}
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-primary-400" />
              <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">Timeline</h2>
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-muted">
              {timelineItems.length} milestones
            </span>
          </div>
          <Timeline
            title=""
            items={timelineItems}
            emptyLabel="No activity yet. Submissions will appear here."
          />
        </div>

        <div className="rounded-3xl border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-elevated))] p-6">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">Primary skills</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {(candidate.primarySkills ?? []).length > 0 ? (
              (candidate.primarySkills ?? []).map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted))] px-3 py-1 text-xs font-medium text-[rgb(var(--app-text-primary))]"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-xs text-muted">No primary skills listed.</p>
            )}
          </div>
          {candidate.secondarySkills && candidate.secondarySkills.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">Secondary skills</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {candidate.secondarySkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted))] px-3 py-1 text-xs font-medium text-[rgb(var(--app-text-primary))]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          {candidate.rateExpectation?.hourly && (
            <div className="mt-6 rounded-2xl border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted))] px-4 py-3 text-sm">
              <p className="font-semibold text-[rgb(var(--app-text-primary))]">Rate expectation</p>
              <p className="text-muted">
                ${candidate.rateExpectation.hourly}/{candidate.rateExpectation.currency || 'hr'}{' '}
                {candidate.rateExpectation.negotiable ? '(Negotiable)' : ''}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Calendar size={18} className="text-primary-400" />
          <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">Submissions</h2>
        </div>
        {submissionsQuery.isLoading && (
          <div className="rounded-3xl border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-elevated))] p-6 text-sm text-muted">
            Loading submissions…
          </div>
        )}
        {submissionsQuery.error && (
          <div className="rounded-3xl border border-rose-400/40 bg-rose-500/5 p-6 text-rose-200">
            Failed to load submissions.
          </div>
        )}
        {!submissionsQuery.isLoading && !submissionsQuery.error && submissions.length === 0 && (
          <div className="rounded-3xl border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-elevated))] p-6 text-sm text-muted">
            <div className="flex items-center gap-3">
              <Clock size={16} />
              No submissions yet.
            </div>
          </div>
        )}
        {submissions.length > 0 && (
          <div className="grid gap-3">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="rounded-3xl border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-elevated))] p-5 shadow-sm transition hover:border-[rgba(var(--app-primary-from),0.4)]"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
                    <span className="inline-flex items-center gap-2 text-[rgb(var(--app-text-primary))]">
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
                    <span className="rounded-full border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted))] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                      {prettify(submission.status)}
                    </span>
                  </div>
                  <Link
                    to={`/jobs/${submission.jobId}`}
                    className="btn-muted w-full justify-center px-3 py-2 text-sm md:w-auto"
                  >
                    View job
                  </Link>
                </div>
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
        <div className="rounded-3xl border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-elevated))] p-6">
          <CandidateDocuments candidateId={id!} />
        </div>
      </section>
    </div>
  );
};

export default CandidateDetails;
