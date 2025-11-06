import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import type { Submission } from '../../types/submission';
import { candidateService } from '../../services/candidate.service';
import { jobService } from '../../services/job.service';

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
  'WITHDRAWN'
];

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
    queryFn: () => candidateService.getAll(0, 1000).then(r => r.data.content || [])
  });

  const jobsQuery = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobService.getAll(0, 1000).then(r => r.data.content || [])
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
    const selectedCandidate = candidatesQuery.data?.find(c => c.id === formData.candidateId);
    const selectedJob = jobsQuery.data?.find(j => j.id === formData.jobId);

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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-100 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-dark-100 border-b border-dark-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{submission ? 'Edit Submission' : 'Create Submission'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-dark-200 rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Candidate</label>
              <select
                value={formData.candidateId}
                onChange={e => setFormData({ ...formData, candidateId: e.target.value })}
                className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
                required
                disabled={!!submission}
              >
                <option value="">Select Candidate</option>
                {candidatesQuery.data?.map(candidate => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.fullName || `${candidate.firstName} ${candidate.lastName}` || candidate.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Job</label>
              <select
                value={formData.jobId}
                onChange={e => setFormData({ ...formData, jobId: e.target.value })}
                className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
                required
                disabled={!!submission}
              >
                <option value="">Select Job</option>
                {jobsQuery.data?.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.title} - {job.client}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as Submission['status'] })}
                className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
              >
                {STATUSES.map(status => (
                  <option key={status} value={status}>{status.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Proposed Rate ($)</label>
              <input
                type="number"
                value={formData.proposedRate}
                onChange={e => setFormData({ ...formData, proposedRate: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Interview Date</label>
              <input
                type="date"
                value={formData.interviewDate}
                onChange={e => setFormData({ ...formData, interviewDate: e.target.value })}
                className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Rejection Reason</label>
              <input
                type="text"
                value={formData.rejectionReason}
                onChange={e => setFormData({ ...formData, rejectionReason: e.target.value })}
                className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
                placeholder="Only if rejected"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Interview Feedback</label>
            <textarea
              value={formData.interviewFeedback}
              onChange={e => setFormData({ ...formData, interviewFeedback: e.target.value })}
              className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
              rows={2}
              placeholder="Interview notes"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-dark-200 hover:bg-dark-300 rounded transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded transition"
            >
              {submission ? 'Update' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
