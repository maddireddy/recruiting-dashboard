import { useMemo, useState } from 'react';
import { Plus, Video, Clock, Edit, Trash2, Play, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { InterviewRecording } from '../types/interviewRecording';
import { listInterviewRecordings, createInterviewRecording, updateInterviewRecording, deleteInterviewRecording } from '../services/interviewRecording.service';
import { useList, useCreate, useUpdate, useDelete } from '../services/hooks';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import { z } from 'zod';

const recordingSchema = z.object({
  candidateId: z.string().min(1, 'Candidate ID is required'),
  candidateName: z.string().optional(),
  interviewId: z.string().min(1, 'Interview ID is required'),
  url: z.string().url('Must be a valid URL'),
  durationSeconds: z.number().optional(),
});

export default function InterviewRecordings() {
  const tenantId = useMemo(() => localStorage.getItem('tenantId') || undefined, []);
  const [selected, setSelected] = useState<InterviewRecording | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<InterviewRecording>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, isLoading, refetch } = useList<InterviewRecording[]>('interviewRecordings', () => listInterviewRecordings(tenantId), tenantId);
  const { mutateAsync: create } = useCreate('interviewRecordings', (payload: Partial<InterviewRecording>) => createInterviewRecording(payload as any, tenantId), tenantId);
  const { mutateAsync: update } = useUpdate('interviewRecordings', (id: string, payload: Partial<InterviewRecording>) => updateInterviewRecording({ id, ...payload }, tenantId), tenantId);
  const { mutateAsync: remove } = useDelete('interviewRecordings', (id: string) => deleteInterviewRecording(id, tenantId), tenantId);

  const handleSubmit = async () => {
    try {
      recordingSchema.parse(form);
      setErrors({});
      if (selected) {
        await update({ id: selected.id, data: form });
        toast.success('Recording updated successfully');
      } else {
        await create(form);
        toast.success('Recording created successfully');
      }
      setShowModal(false);
      setSelected(null);
      setForm({});
      refetch();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          fieldErrors[err.path.join('.')] = err.message;
        });
        setErrors(fieldErrors);
        toast.error('Please fix the errors in the form');
      } else {
        toast.error('Failed to save recording');
      }
    }
  };

  const handleDelete = async (id: string, candidateName?: string) => {
    if (!window.confirm(`Are you sure you want to delete this recording${candidateName ? ` for ${candidateName}` : ''}? This action cannot be undone.`)) {
      return;
    }
    try {
      await remove(id);
      toast.success('Recording deleted successfully');
      refetch();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete recording');
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const recordings = data || [];

  return (
    <div className="space-y-10 px-6 py-8">
      <PageHeader
        title="Interview Recordings"
        subtitle="Manage video and audio recordings of candidate interviews for review, compliance, and training purposes"
        actions={
          <Button variant="primary" size="md" onClick={() => { setSelected(null); setForm({}); setShowModal(true); }}>
            <Plus size={16} />
            <span className="ml-2">Add Recording</span>
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15">
              <Video className="text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Total Recordings</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">{recordings.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/15">
              <Clock className="text-purple-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Total Duration</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">
                {formatDuration(recordings.reduce((sum, r) => sum + (r.durationSeconds || 0), 0))}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/15">
              <Play className="text-green-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Avg Duration</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">
                {recordings.length > 0 ? formatDuration(Math.floor(recordings.reduce((sum, r) => sum + (r.durationSeconds || 0), 0) / recordings.length)) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="card space-y-3">
          <div className="h-4 w-40 animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
          <div className="h-4 w-full animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
          <div className="h-4 w-3/4 animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && recordings.length === 0 && (
        <div className="card flex flex-col items-center justify-center gap-4 text-center py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-[rgba(var(--app-border-subtle))] text-muted">
            <Video size={28} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No recordings yet</h3>
            <p className="max-w-sm text-sm text-muted">
              Add interview recordings to review candidate performance and maintain compliance records.
            </p>
          </div>
          <button onClick={() => { setSelected(null); setForm({}); setShowModal(true); }} type="button" className="btn-primary">
            <Plus size={16} />
            Add your first recording
          </button>
        </div>
      )}

      {/* Recordings List */}
      {!isLoading && recordings.length > 0 && (
        <div className="grid gap-4">
          {recordings.map((recording: InterviewRecording) => (
            <article key={recording.id} className="card border-transparent transition hover:border-[rgba(var(--app-primary-from),0.45)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-[rgba(var(--app-primary-from),0.15)]">
                    <Video className="text-[rgb(var(--app-primary-from))]" size={24} />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">
                      {recording.candidateName || `Candidate #${recording.candidateId}`}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>Duration: {formatDuration(recording.durationSeconds)}</span>
                      </div>
                      <div>Interview #{recording.interviewId}</div>
                      {recording.createdAt && (
                        <div>Recorded: {new Date(recording.createdAt).toLocaleDateString()}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={recording.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-elevated))] px-3 py-1.5 text-sm text-[rgb(var(--app-text-primary))] transition hover:border-[rgba(var(--app-primary-from),0.4)]"
                      >
                        <ExternalLink size={14} />
                        View Recording
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex flex-shrink-0 items-center gap-2">
                  <button
                    onClick={() => {
                      setSelected(recording);
                      setForm(recording);
                      setShowModal(true);
                    }}
                    type="button"
                    className="btn-muted px-3 py-2 text-sm"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(recording.id, recording.candidateName)}
                    type="button"
                    className="rounded-lg border border-transparent px-3 py-2 text-sm text-red-400 transition hover:border-red-400/40 hover:bg-red-500/10"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
          <div className="card w-full max-w-2xl max-h-[90vh] overflow-hidden p-0">
            <div className="sticky top-0 flex items-center justify-between border-b border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface))] px-6 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {selected ? 'Edit Recording' : 'Add Recording'}
                </p>
                <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">Interview Recording</h2>
              </div>
              <button onClick={() => { setShowModal(false); setSelected(null); setForm({}); setErrors({}); }} type="button" className="rounded-lg border border-transparent p-2 text-muted transition hover:border-[rgba(var(--app-border-subtle))]">
                <Plus className="rotate-45" size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-4" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-1">
                  Candidate ID <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.candidateId || ''}
                  onChange={(e) => setForm({ ...form, candidateId: e.target.value })}
                  className="input w-full"
                  placeholder="e.g., 12345"
                />
                {errors.candidateId && <p className="mt-1 text-sm text-red-400">{errors.candidateId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-1">
                  Candidate Name
                </label>
                <input
                  type="text"
                  value={form.candidateName || ''}
                  onChange={(e) => setForm({ ...form, candidateName: e.target.value })}
                  className="input w-full"
                  placeholder="e.g., John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-1">
                  Interview ID <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.interviewId || ''}
                  onChange={(e) => setForm({ ...form, interviewId: e.target.value })}
                  className="input w-full"
                  placeholder="e.g., 67890"
                />
                {errors.interviewId && <p className="mt-1 text-sm text-red-400">{errors.interviewId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-1">
                  Recording URL <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  value={form.url || ''}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  className="input w-full"
                  placeholder="https://example.com/recordings/..."
                />
                {errors.url && <p className="mt-1 text-sm text-red-400">{errors.url}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-1">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  value={form.durationSeconds || ''}
                  onChange={(e) => setForm({ ...form, durationSeconds: parseInt(e.target.value) || undefined })}
                  className="input w-full"
                  placeholder="e.g., 3600"
                  min="0"
                />
              </div>
            </div>

            <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface))] px-6 py-4">
              <button onClick={() => { setShowModal(false); setSelected(null); setForm({}); setErrors({}); }} type="button" className="btn-muted">
                Cancel
              </button>
              <button onClick={handleSubmit} type="button" className="btn-primary">
                {selected ? 'Update Recording' : 'Add Recording'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
