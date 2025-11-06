import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interviewService } from '../services/interview.service';
import InterviewModal from '../components/interviews/InterviewModal';
import type { Interview } from '../types/interview';
import { useState } from 'react';
import { Plus, Calendar, Video, Phone, MapPin, Users, Edit, Trash2 } from 'lucide-react';

const MODE_ICONS = {
  VIDEO: <Video size={16} />,
  PHONE: <Phone size={16} />,
  ONSITE: <MapPin size={16} />,
  REMOTE: <Video size={16} />
};

const STATUS_COLORS = {
  SCHEDULED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
  RESCHEDULED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
};

export default function InterviewsPage() {
  const queryClient = useQueryClient();
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [showModal, setShowModal] = useState(false);

  const interviewsQuery = useQuery({
    queryKey: ['interviews'],
    queryFn: () => interviewService.getAll(0, 100).then(r => r.data.content || [])
  });

  const createInterview = useMutation({
    mutationFn: (interview: Partial<Interview>) => interviewService.create(interview),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      setShowModal(false);
    }
  });

  const updateInterview = useMutation({
    mutationFn: (interview: Partial<Interview>) => 
      interviewService.update(selectedInterview!.id!, interview),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      setShowModal(false);
      setSelectedInterview(null);
    }
  });

  const deleteInterview = useMutation({
    mutationFn: (id: string) => interviewService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interviews'] })
  });

  const handleSave = (interview: Partial<Interview>) => {
    if (selectedInterview) {
      updateInterview.mutate(interview);
    } else {
      createInterview.mutate(interview);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Interviews</h1>
          <p className="text-dark-600">Schedule and manage candidate interviews</p>
        </div>
        <button
          onClick={() => {
            setSelectedInterview(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded transition"
        >
          <Plus size={18} />
          Schedule Interview
        </button>
      </div>

      {interviewsQuery.isLoading && <p>Loading interviews...</p>}
      {interviewsQuery.error && <p className="text-red-500">Error loading interviews</p>}

      {interviewsQuery.data && interviewsQuery.data.length === 0 && (
        <div className="text-center py-12 bg-dark-100 rounded-lg border border-dark-200">
          <Calendar size={48} className="mx-auto mb-4 text-dark-600" />
          <p className="text-dark-600">No interviews scheduled yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded transition"
          >
            Schedule Your First Interview
          </button>
        </div>
      )}

      {interviewsQuery.data && interviewsQuery.data.length > 0 && (
        <div className="grid gap-4">
          {interviewsQuery.data.map((interview: Interview) => (
            <div
              key={interview.id}
              className="bg-dark-100 rounded-lg border border-dark-200 p-5 hover:border-primary-500 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">Interview</h3>
                    <span className={`px-3 py-1 text-xs rounded-full border ${STATUS_COLORS[interview.status || 'SCHEDULED']}`}>
                      {interview.status || 'SCHEDULED'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-dark-600">
                    <div className="flex items-center gap-2">
                      <Users size={14} />
                      <span>Candidate ID: {interview.candidateId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span>{new Date(interview.scheduledAt).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {MODE_ICONS[interview.mode]}
                      <span>{interview.mode}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">Job ID: {interview.jobId}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedInterview(interview);
                      setShowModal(true);
                    }}
                    className="p-2 bg-dark-200 hover:bg-dark-300 rounded transition"
                    title="Edit Interview"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this interview?')) {
                        deleteInterview.mutate(interview.id!);
                      }
                    }}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition"
                    title="Delete Interview"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {interview.panel && interview.panel.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold mb-2 text-dark-600">Interview Panel:</p>
                  <div className="flex flex-wrap gap-2">
                    {interview.panel.map((member, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1 bg-dark-200 rounded text-xs flex items-center gap-2"
                      >
                        <span className="font-medium">{member.name}</span>
                        <span className="text-dark-600">({member.role || 'Interviewer'})</span>
                        {member.isExternal && (
                          <span className="text-yellow-500 text-xs">External</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {interview.feedback && (
                <div className="mt-3 pt-3 border-t border-dark-300">
                  <p className="text-xs font-semibold mb-1 text-dark-600">Feedback:</p>
                  <p className="text-sm text-dark-500">{interview.feedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>
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
