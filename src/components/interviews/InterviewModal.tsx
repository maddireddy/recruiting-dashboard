import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Interview, PanelMember } from '../../types/interview';
import { candidateService } from '../../services/candidate.service';
import { jobService } from '../../services/job.service';
import { submissionService } from '../../services/submission.service';

interface Props {
  interview: Interview | null;
  onSave: (interview: Partial<Interview>) => void;
  onClose: () => void;
}

const MODES = ['ONSITE', 'REMOTE', 'PHONE', 'VIDEO'];
const STATUSES = ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'];

export default function InterviewModal({ interview, onSave, onClose }: Props) {
  const [formData, setFormData] = useState<Partial<Interview>>({
    jobId: '',
    candidateId: '',
    submissionId: '',
    scheduledAt: '',
    mode: 'REMOTE',
    panel: [],
    feedback: '',
    status: 'SCHEDULED'
  });

  const candidatesQuery = useQuery({
    queryKey: ['candidates'],
    queryFn: () => candidateService.getAll(0, 1000).then(r => {
      if (r.data && 'content' in r.data) return r.data.content || [];
      return r.data || [];
    })
  });

  const jobsQuery = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobService.getAll(0, 1000).then(r => {
      if (r.data && 'content' in r.data) return r.data.content || [];
      return r.data || [];
    })
  });

  const submissionsQuery = useQuery({
    queryKey: ['submissions'],
    queryFn: () => submissionService.getAll(0, 1000).then(r => {
      if (r.data && 'content' in r.data) return r.data.content || [];
      return r.data || [];
    })
  });

  useEffect(() => {
    if (interview) {
      setFormData({
        ...interview,
        scheduledAt: interview.scheduledAt ? new Date(interview.scheduledAt).toISOString().slice(0, 16) : '',
        panel: interview.panel || []
      });
    }
  }, [interview]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPanelMember = () => {
    setFormData(prev => ({
      ...prev,
      panel: [...(prev.panel || []), { name: '', email: '', role: '', isExternal: false }]
    }));
  };

  const handleRemovePanelMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      panel: prev.panel?.filter((_, i) => i !== index) || []
    }));
  };

  const handlePanelMemberChange = (index: number, field: keyof PanelMember, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      panel: prev.panel?.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      ) || []
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : ''
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-100 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-dark-100 border-b border-dark-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{interview ? 'Edit Interview' : 'Schedule Interview'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-dark-200 rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Candidate *</label>
              <select
                name="candidateId"
                value={formData.candidateId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
                required
                disabled={!!interview}
              >
                <option value="">Select Candidate</option>
                {candidatesQuery.data?.map((candidate: any) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name} - {candidate.primarySkill}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Job *</label>
              <select
                name="jobId"
                value={formData.jobId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
                required
                disabled={!!interview}
              >
                <option value="">Select Job</option>
                {jobsQuery.data?.map((job: any) => (
                  <option key={job.id} value={job.id}>
                    {job.title} - {job.client}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Submission (Optional)</label>
              <select
                name="submissionId"
                value={formData.submissionId || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
              >
                <option value="">Select Submission</option>
                {submissionsQuery.data?.map((submission: any) => (
                  <option key={submission.id} value={submission.id}>
                    {submission.candidateName} → {submission.jobTitle}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Scheduled Date & Time *</label>
              <input
                type="datetime-local"
                name="scheduledAt"
                value={formData.scheduledAt}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mode *</label>
              <select
                name="mode"
                value={formData.mode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
                required
              >
                {MODES.map(mode => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
              >
                {STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Interview Panel</label>
              <button
                type="button"
                onClick={handleAddPanelMember}
                className="flex items-center gap-1 text-primary-500 hover:text-primary-400 text-sm"
              >
                <Plus size={16} /> Add Panel Member
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.panel?.map((member, index) => (
                <div key={index} className="bg-dark-200 p-3 rounded border border-dark-300">
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <input
                      type="text"
                      placeholder="Name *"
                      value={member.name}
                      onChange={e => handlePanelMemberChange(index, 'name', e.target.value)}
                      className="px-3 py-2 bg-dark-300 border border-dark-400 rounded focus:border-primary-500 focus:outline-none"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email *"
                      value={member.email}
                      onChange={e => handlePanelMemberChange(index, 'email', e.target.value)}
                      className="px-3 py-2 bg-dark-300 border border-dark-400 rounded focus:border-primary-500 focus:outline-none"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Role"
                      value={member.role || ''}
                      onChange={e => handlePanelMemberChange(index, 'role', e.target.value)}
                      className="px-3 py-2 bg-dark-300 border border-dark-400 rounded focus:border-primary-500 focus:outline-none"
                    />
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={member.isExternal || false}
                          onChange={e => handlePanelMemberChange(index, 'isExternal', e.target.checked)}
                          className="rounded"
                        />
                        External Interviewer
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemovePanelMember(index)}
                        className="ml-auto p-1 text-red-500 hover:bg-red-500/20 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Feedback / Notes</label>
            <textarea
              name="feedback"
              value={formData.feedback || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
              rows={4}
              placeholder="Interview feedback, notes, or instructions..."
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
              {interview ? 'Update Interview' : 'Schedule Interview'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
