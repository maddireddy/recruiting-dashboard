import { useState, type ReactNode } from 'react';
import { useList, useCreate, useUpdate, useDelete } from '../services/hooks';
import { Plus, Calendar, Video, Phone, MapPin, Users, Edit, Trash2, Briefcase, Clock } from 'lucide-react';
import { interviewService } from '../services/interview.service';
import InterviewModal from '../components/interviews/InterviewModal';
import type { Interview } from '../types/interview';

const MODE_META: Record<NonNullable<Interview['mode']>, { label: string; icon: ReactNode }> = {
  VIDEO: { label: 'Video', icon: <Video size={16} /> },
  PHONE: { label: 'Phone', icon: <Phone size={16} /> },
  ONSITE: { label: 'Onsite', icon: <MapPin size={16} /> },
  REMOTE: { label: 'Remote', icon: <Video size={16} /> },
};

const STATUS_META: Record<NonNullable<Interview['status']>, { label: string; accent: string }> = {
  SCHEDULED: { label: 'Scheduled', accent: 'chip bg-[rgba(59,130,246,0.16)] text-[rgb(96,165,250)] border border-[rgba(59,130,246,0.4)]' },
  COMPLETED: { label: 'Completed', accent: 'chip bg-[rgba(34,197,94,0.16)] text-[rgb(34,197,94)] border border-[rgba(34,197,94,0.4)]' },
  CANCELLED: { label: 'Cancelled', accent: 'chip bg-[rgba(248,113,113,0.18)] text-[rgb(248,113,113)] border border-[rgba(248,113,113,0.4)]' },
  RESCHEDULED: { label: 'Rescheduled', accent: 'chip bg-[rgba(250,204,21,0.18)] text-[rgb(202,138,4)] border border-[rgba(250,204,21,0.45)]' },
};

export default function InterviewsPage() {
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Get tenant ID from localStorage
  const tenantId = localStorage.getItem('tenantId') || undefined;

  // Use standardized hooks
  const interviewsQ = useList<Interview[]>('interviews', (tid) => interviewService.getAll(0, 100, tid), tenantId);
  const createM = useCreate('interviews', interviewService.create, tenantId);
  const updateM = useUpdate<Partial<Interview>, Interview>('interviews', (id, data, tid) => interviewService.update(id, data, tid), tenantId);
  const deleteM = useDelete('interviews', interviewService.delete, tenantId);

  const handleSave = async (interview: Partial<Interview>) => {
    try {
      if (selectedInterview) {
        await updateM.mutateAsync({ id: selectedInterview.id!, data: interview });
      } else {
        await createM.mutateAsync(interview);
      }
      setShowModal(false);
      setSelectedInterview(null);
    } catch (error) {
      console.error('Failed to save interview:', error);
    }
  };

  return (
    <div className="space-y-10 px-6 py-8">
      <header className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(var(--app-border-subtle))] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            <Clock size={14} />
            Interview Ops
          </div>
          <h1 className="text-3xl font-semibold text-[rgb(var(--app-text-primary))]">Interviews</h1>
          <p className="max-w-2xl text-sm text-muted">Coordinate candidate conversations, capture feedback, and keep hiring teams aligned without leaving your workspace.</p>
        </div>
        <button
          onClick={() => {
            setSelectedInterview(null);
            setShowModal(true);
          }}
          className="btn-primary"
          type="button"
        >
          <Plus size={18} />
          Schedule Interview
        </button>
      </header>

      {interviewsQ.isLoading && (
        <div className="card space-y-3">
          <div className="h-4 w-40 animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
          <div className="h-4 w-full animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
          <div className="h-4 w-3/4 animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
        </div>
      )}

      {interviewsQ.error && (
        <div className="card border-red-400/40 bg-red-500/5 text-red-300">
          Unable to load interviews right now. Please try again shortly.
        </div>
      )}

      {interviewsQ.data && interviewsQ.data.length === 0 && (
        <div className="card flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-[rgba(var(--app-border-subtle))] text-muted">
            <Calendar size={28} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No interviews on the calendar</h3>
            <p className="max-w-sm text-sm text-muted">Get ahead of hiring by scheduling your first conversation with top candidates.</p>
          </div>
          <button onClick={() => setShowModal(true)} type="button" className="btn-primary">
            <Plus size={16} />
            Schedule your first interview
          </button>
        </div>
      )}

      {interviewsQ.data && interviewsQ.data.length > 0 && (
        <section className="grid gap-4">
          {interviewsQ.data.map((interview: Interview) => {
            const statusKey = (interview.status || 'SCHEDULED') as NonNullable<Interview['status']>;
            const statusMeta = STATUS_META[statusKey];
            const modeMeta = interview.mode ? MODE_META[interview.mode] : null;

            return (
              <article key={interview.id} className="card border-transparent transition hover:border-[rgba(var(--app-primary-from),0.45)]">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">Interview</h3>
                      <span className={statusMeta.accent}>{statusMeta.label}</span>
                      <span className="chip surface-muted flex items-center gap-2"><Briefcase size={14} />Job {interview.jobId}</span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 text-sm text-muted">
                      <div className="flex items-center gap-2">
                        <Users size={14} />
                        <span>Candidate #{interview.candidateId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>{new Date(interview.scheduledAt).toLocaleString()}</span>
                      </div>
                      {modeMeta && (
                        <div className="flex items-center gap-2">
                          {modeMeta.icon}
                          <span>{modeMeta.label}</span>
                        </div>
                      )}
                      {interview.panel && interview.panel.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Users size={14} />
                          <span>{interview.panel.length} panel member{interview.panel.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-shrink-0 items-center gap-2 self-end md:self-start">
                    <button
                      onClick={() => {
                        setSelectedInterview(interview);
                        setShowModal(true);
                      }}
                      type="button"
                      className="btn-muted px-3 py-2 text-sm"
                      title="Edit interview"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this interview?')) {
                          deleteM.mutateAsync(interview.id!).catch((error) => {
                            console.error('Failed to delete interview:', error);
                          });
                        }
                      }}
                      type="button"
                      className="btn-muted px-3 py-2 text-sm text-red-400 hover:border-red-400 hover:text-red-300"
                      title="Delete interview"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {interview.panel && interview.panel.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Interview panel</p>
                    <div className="flex flex-wrap gap-2">
                      {interview.panel.map((member, idx) => (
                        <span key={idx} className="chip flex items-center gap-2">
                          <span className="font-semibold text-[rgb(var(--app-text-primary))]">{member.name}</span>
                          <span className="text-muted">{member.role || 'Interviewer'}</span>
                          {member.isExternal && <span className="chip-active px-3 py-1 text-xs uppercase tracking-wide">External</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {interview.feedback && (
                  <div className="mt-6 space-y-2 border-t border-[rgba(var(--app-border-subtle))] pt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Feedback</p>
                    <p className="text-sm text-[rgb(var(--app-text-primary))]">{interview.feedback}</p>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}

      {showModal && (
        <InterviewModal
          interview={selectedInterview}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setSelectedInterview(null);
          }}
        />
      )}
    </div>
  );
}
