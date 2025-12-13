import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import type { Submission } from '../../types/submission';
import { candidateService } from '../../services/candidate.service';
import { jobService } from '../../services/job.service';
import { FormField } from '../common/FormField';

interface Props {
  submission: Submission | null;
  onSave: (submission: Partial<Submission>) => void;
  onClose: () => void;
}

const STATUSES = [
  'SUBMITTED',
  'SHORTLISTED',
  'INTERVIEW_SCHEDULED',
  'INTERVIEWED',
  'OFFERED',
  'REJECTED',
  'WITHDRAWN',
];

const RATE_CURRENCIES = ['USD', 'CAD', 'EUR', 'GBP', 'INR'];

export default function SubmissionModal({ submission, onSave, onClose }: Props) {
  const [formData, setFormData] = useState({
    candidateId: '',
    jobId: '',
    status: 'SUBMITTED' as Submission['status'],
    proposedRate: 0,
    rateCurrency: 'USD',
    interviewDate: '',
    interviewFeedback: '',
    rejectionReason: '',
    notes: '',
  });

  const candidatesQuery = useQuery({
    queryKey: ['candidates'],
    queryFn: () => candidateService.getAll(0, 1000)
  });

  const jobsQuery = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobService.getAll(0, 1000)
  });

  useEffect(() => {
    if (submission) {
      setFormData({
        candidateId: submission.candidateId,
        jobId: submission.jobId,
        status: submission.status,
        proposedRate: submission.proposedRate || 0,
        rateCurrency: submission.rateCurrency || 'USD',
        interviewDate: submission.interviewDate || '',
        interviewFeedback: submission.interviewFeedback || '',
        rejectionReason: submission.rejectionReason || '',
        notes: submission.notes || '',
      });
    }
  }, [submission]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCandidate = candidatesQuery.data?.find((c: any) => c.id === formData.candidateId);
    const selectedJob = jobsQuery.data?.find((j: any) => j.id === formData.jobId);

    const candidateDisplayName = selectedCandidate
      ? (selectedCandidate.fullName || `${selectedCandidate.firstName || ''} ${selectedCandidate.lastName || ''}`.trim() || selectedCandidate.email || '')
      : '';

    onSave({
      ...formData,
      candidateName: candidateDisplayName,
      jobTitle: selectedJob?.title || '',
      client: selectedJob?.client || '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
      <div className="card w-full max-w-3xl max-h-[90vh] overflow-hidden p-0">
        <div className="sticky top-0 flex items-center justify-between border-b border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface))] px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {submission ? 'Edit submission' : 'Create submission'}
            </p>
            <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">Pipeline update</h2>
          </div>
          <button onClick={onClose} type="button" className="rounded-lg border border-transparent p-2 text-muted transition hover:border-[rgba(var(--app-border-subtle))]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[calc(90vh-72px)] space-y-6 overflow-y-auto px-6 py-6">
          <section className="grid gap-4 md:grid-cols-2">
            <FormField label="Candidate" required>
              <select
                value={formData.candidateId}
                onChange={(event) => setFormData({ ...formData, candidateId: event.target.value })}
                className="input"
                required
                disabled={!!submission}
              >
                <option value="">Select candidate</option>
                {candidatesQuery.data?.map((candidate: any) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.fullName || `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || candidate.email}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Job" required>
              <select
                value={formData.jobId}
                onChange={(event) => setFormData({ ...formData, jobId: event.target.value })}
                className="input"
                required
                disabled={!!submission}
              >
                <option value="">Select job</option>
                {jobsQuery.data?.map((job: any) => (
                  <option key={job.id} value={job.id}>
                    {job.title} • {job.client}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Status" required>
              <select
                value={formData.status}
                onChange={(event) => setFormData({ ...formData, status: event.target.value as Submission['status'] })}
                className="input"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Proposed bill rate" description="Hourly" >
              <div className="grid grid-cols-[1fr_auto] gap-3">
                <input
                  type="number"
                  value={formData.proposedRate}
                  onChange={(event) => setFormData({ ...formData, proposedRate: parseFloat(event.target.value) || 0 })}
                  className="input"
                  min={0}
                  step={0.01}
                />
                <select
                  value={formData.rateCurrency}
                  onChange={(event) => setFormData({ ...formData, rateCurrency: event.target.value })}
                  className="input"
                >
                  {RATE_CURRENCIES.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>
            </FormField>

            <FormField label="Interview date">
              <input
                type="date"
                value={formData.interviewDate}
                onChange={(event) => setFormData({ ...formData, interviewDate: event.target.value })}
                className="input"
              />
            </FormField>

            <FormField label="Rejection reason" description="Only needed when status is rejected">
              <input
                type="text"
                value={formData.rejectionReason}
                onChange={(event) => setFormData({ ...formData, rejectionReason: event.target.value })}
                className="input"
                placeholder="Position on hold, budget, etc."
              />
            </FormField>
          </section>

          <FormField label="Interview feedback" description="Share interviewer notes or context for next steps" spacing="sm">
            <textarea
              value={formData.interviewFeedback}
              onChange={(event) => setFormData({ ...formData, interviewFeedback: event.target.value })}
              className="input min-h-[120px]"
              placeholder="Interview notes"
              rows={3}
            />
          </FormField>

          <FormField label="Internal notes" spacing="sm">
            <textarea
              value={formData.notes}
              onChange={(event) => setFormData({ ...formData, notes: event.target.value })}
              className="input min-h-[120px]"
              placeholder="Record hiring manager updates, follow-ups, or other context."
              rows={3}
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-muted">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {submission ? 'Update submission' : 'Create submission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
