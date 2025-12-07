import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Briefcase, User, Calendar, DollarSign, Download, KanbanSquare, Award } from 'lucide-react';
import SubmissionModal from '../components/submissions/SubmissionModal';
import StatsCard from '../components/dashboard/StatsCard';
import { submissionService } from '../services/submission.service';
import { reportService } from '../services/report.service';
import type { Submission } from '../types/submission';

const STATUS_META: Record<string, { label: string; tone: string }> = {
  SUBMITTED: { label: 'Submitted', tone: 'surface-muted' },
  SHORTLISTED: { label: 'Shortlisted', tone: 'surface-muted' },
  INTERVIEW_SCHEDULED: { label: 'Interview Scheduled', tone: 'chip-active' },
  INTERVIEWED: { label: 'Interviewed', tone: 'surface-muted' },
  OFFERED: { label: 'Offer Extended', tone: 'chip-active' },
  REJECTED: { label: 'Rejected', tone: 'surface-muted' },
  WITHDRAWN: { label: 'Withdrawn', tone: 'surface-muted' },
};

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
});

export default function SubmissionsPage() {
  const queryClient = useQueryClient();
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showModal, setShowModal] = useState(false);

  const submissionsQuery = useQuery({
    queryKey: ['submissions'],
    queryFn: () => submissionService.getAll(0, 100).then(r => r.data.content || [])
  });

  const createSubmission = useMutation({
    mutationFn: (submission: Partial<Submission>) => submissionService.create(submission),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      setShowModal(false);
      toast.success('Submission added');
    }
  });

  const updateSubmission = useMutation({
    mutationFn: (submission: Partial<Submission>) => submissionService.update(selectedSubmission!.id, submission),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      setShowModal(false);
      setSelectedSubmission(null);
      toast.success('Submission updated');
    }
  });

  const deleteSubmission = useMutation({
    mutationFn: (id: string) => submissionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      toast.success('Submission removed');
    }
  });

  const handleSave = (submission: Partial<Submission>) => {
    if (selectedSubmission) {
      updateSubmission.mutate(submission);
    } else {
      createSubmission.mutate(submission);
    }
  };

  const submissions = useMemo(() => submissionsQuery.data || [], [submissionsQuery.data]);
  const totalSubmissions = submissions.length;
  const offers = submissions.filter((sub) => (sub.status || '').toUpperCase() === 'OFFERED').length;
  const interviews = submissions.filter((sub) => (sub.status || '').toUpperCase().includes('INTERVIEW')).length;

  const summaryCards = useMemo(
    () => [
      {
        title: 'Total Submissions',
        value: totalSubmissions,
  icon: <KanbanSquare size={18} className="text-primary-400" />,
      },
      {
        title: 'Interviews in Motion',
        value: interviews,
        icon: <Briefcase size={18} className="text-amber-400" />,
      },
      {
        title: 'Offers Extended',
        value: offers,
        icon: <Award size={18} className="text-green-400" />,
      },
    ],
    [interviews, offers, totalSubmissions]
  );

  return (
    <div className="space-y-10 px-6 py-8">
      <header className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(var(--app-border-subtle))] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            <KanbanSquare size={14} />
            Submission Funnel
          </div>
          <h1 className="text-3xl font-semibold text-[rgb(var(--app-text-primary))]">Submissions</h1>
          <p className="max-w-2xl text-sm text-muted">
            Monitor every candidate routed to clients, keep interview loops moving, and surface offers the moment they happen.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              // Prefetch candidates and jobs to speed up modal open
              queryClient.prefetchQuery({
                queryKey: ['candidates'],
                queryFn: () => import('../services/candidate.service').then(m => m.candidateService.getAll(0, 1000)).then(r => r.data.content || []),
                staleTime: 60_000,
              });
              queryClient.prefetchQuery({
                queryKey: ['jobs'],
                queryFn: () => import('../services/job.service').then(m => m.jobService.getAll(0, 1000)).then(r => r.data.content || []),
                staleTime: 60_000,
              });
              setSelectedSubmission(null);
              setShowModal(true);
            }}
            type="button"
            className="btn-primary"
          >
            <Plus size={18} />
            New submission
          </button>

          <button
            onClick={() => reportService.exportSubmissionsCSV()}
            title="Export submissions CSV"
            type="button"
            className="btn-muted"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <StatsCard key={card.title} {...card} />
        ))}
      </section>

      {submissionsQuery.isLoading && (
        <div className="card space-y-3">
          <div className="h-4 w-48 animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
          <div className="h-4 w-full animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
        </div>
      )}

      {!submissionsQuery.isLoading && submissionsQuery.error && (
        <div className="card border-red-400/40 bg-red-500/5 text-red-300">
          Error loading submissions. Please refresh or try again shortly.
        </div>
      )}

      {!submissionsQuery.isLoading && !submissionsQuery.error && submissions.length === 0 && (
        <div className="card flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-[rgba(var(--app-border-subtle))] text-muted">
            <Briefcase size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">No submissions yet</h3>
            <p className="max-w-sm text-sm text-muted">Create your first submission to start tracking interviews, offers, and client feedback.</p>
          </div>
          <button onClick={() => setShowModal(true)} type="button" className="btn-primary">
            <Plus size={16} />
            Add your first submission
          </button>
        </div>
      )}

      {submissions.length > 0 && (
        <section className="grid gap-4">
          {submissions.map((submission) => {
            const statusKey = (submission.status || 'SUBMITTED').toUpperCase();
            const status = STATUS_META[statusKey] ?? STATUS_META.SUBMITTED;
            return (
              <article
                key={submission.id}
                className="card flex flex-col gap-4 border-transparent transition hover:border-[rgba(var(--app-primary-from),0.45)]"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">{submission.candidateName}</h3>
                      <span className={`chip ${status.tone}`}>{status.label}</span>
                      <span className="chip surface-muted text-xs">{submission.jobTitle}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
                      <span className="inline-flex items-center gap-2">
                        <User size={14} />
                        {submission.client}
                      </span>
                      {submission.proposedRate ? (
                        <span className="inline-flex items-center gap-2">
                          <DollarSign size={14} />
                          {currencyFormatter.format(Number(submission.proposedRate))}/hr
                        </span>
                      ) : null}
                      {submission.submittedDate && (
                        <span className="inline-flex items-center gap-2">
                          <Calendar size={14} />
                          {new Date(submission.submittedDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {submission.notes && (
                      <div className="rounded-2xl border border-dashed border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] p-3 text-sm text-muted">
                        {submission.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <button
                      onClick={() => {
                        queryClient.prefetchQuery({
                          queryKey: ['candidates'],
                          queryFn: () => import('../services/candidate.service').then((m) => m.candidateService.getAll(0, 1000)).then((r) => r.data.content || []),
                          staleTime: 60_000,
                        });
                        queryClient.prefetchQuery({
                          queryKey: ['jobs'],
                          queryFn: () => import('../services/job.service').then((m) => m.jobService.getAll(0, 1000)).then((r) => r.data.content || []),
                          staleTime: 60_000,
                        });
                        setSelectedSubmission(submission);
                        setShowModal(true);
                      }}
                      type="button"
                      className="btn-muted px-3 py-2 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this submission?')) {
                          deleteSubmission.mutate(submission.id);
                        }
                      }}
                      type="button"
                      className="btn-muted px-3 py-2 text-sm text-red-400 hover:border-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {showModal && (
        <SubmissionModal
          submission={selectedSubmission}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setSelectedSubmission(null);
          }}
        />
      )}
    </div>
  );
}
