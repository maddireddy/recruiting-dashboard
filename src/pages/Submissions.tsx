import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { submissionService } from '../services/submission.service';
import SubmissionModal from '../components/submissions/SubmissionModal';
import type { Submission } from '../types/submission';
import { useState } from 'react';
import { Plus, Briefcase, User, Calendar, DollarSign } from 'lucide-react';

const STATUS_COLORS = {
  SUBMITTED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  SHORTLISTED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  INTERVIEW_SCHEDULED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  INTERVIEWED: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  OFFERED: 'bg-green-500/20 text-green-400 border-green-500/30',
  REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
  WITHDRAWN: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

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
    }
  });

  const updateSubmission = useMutation({
    mutationFn: (submission: Partial<Submission>) => submissionService.update(selectedSubmission!.id, submission),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      setShowModal(false);
      setSelectedSubmission(null);
    }
  });

  const deleteSubmission = useMutation({
    mutationFn: (id: string) => submissionService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['submissions'] })
  });

  const handleSave = (submission: Partial<Submission>) => {
    if (selectedSubmission) {
      updateSubmission.mutate(submission);
    } else {
      createSubmission.mutate(submission);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Submissions</h1>
          <p className="text-dark-600">Track candidate submissions to jobs</p>
        </div>
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
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded transition"
        >
          <Plus size={18} />
          Add Submission
        </button>
      </div>

      {submissionsQuery.isLoading && <p>Loading submissions...</p>}
      {submissionsQuery.error && <p className="text-red-500">Error loading submissions</p>}

      {submissionsQuery.data && (
        <div className="grid gap-4">
          {submissionsQuery.data.map(submission => (
            <div
              key={submission.id}
              className="bg-dark-100 rounded-lg border border-dark-200 p-4 hover:border-primary-500 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{submission.candidateName}</h3>
                    <span className={`px-3 py-1 text-xs rounded-full border ${STATUS_COLORS[submission.status]}`}>
                      {submission.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-dark-600">
                    <div className="flex items-center gap-2">
                      <Briefcase size={14} />
                      <span>{submission.jobTitle}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={14} />
                      <span>{submission.client}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign size={14} />
                      <span>${submission.proposedRate}/hr</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span>{new Date(submission.submittedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Prefetch for edit as well
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
                      setSelectedSubmission(submission);
                      setShowModal(true);
                    }}
                    className="px-3 py-1 text-sm bg-dark-200 hover:bg-dark-300 rounded transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this submission?')) deleteSubmission.mutate(submission.id);
                    }}
                    className="px-3 py-1 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {submission.notes && (
                <p className="text-sm text-dark-600 mt-2 pl-4 border-l-2 border-dark-300">{submission.notes}</p>
              )}
            </div>
          ))}
        </div>
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
