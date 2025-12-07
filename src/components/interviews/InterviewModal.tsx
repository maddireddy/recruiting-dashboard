import { useState, useEffect, type ChangeEvent } from 'react';
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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
      <div className="card w-full max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="sticky top-0 flex items-center justify-between border-b border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface))] px-6 py-4">
          <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">{interview ? 'Edit Interview' : 'Schedule Interview'}</h2>
          <button onClick={onClose} type="button" className="rounded-lg border border-transparent p-2 text-muted transition hover:border-[rgba(var(--app-border-subtle))]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto px-6 py-6 max-h-[calc(90vh-72px)]">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SelectField
              label="Candidate"
              name="candidateId"
              value={formData.candidateId ?? ''}
              onChange={handleInputChange}
              disabled={!!interview}
              required
              options={candidatesQuery.data?.map((candidate) => ({
                value: candidate.id,
                label: `${candidate.fullName}${candidate.primarySkills?.[0] ? ` • ${candidate.primarySkills[0]}` : ''}`,
              })) ?? []}
            />
            <SelectField
              label="Job"
              name="jobId"
              value={formData.jobId ?? ''}
              onChange={handleInputChange}
              disabled={!!interview}
              required
              options={jobsQuery.data?.map((job) => ({
                value: job.id,
                label: `${job.title} • ${job.client}`,
              })) ?? []}
            />

            <SelectField
              label="Submission (Optional)"
              name="submissionId"
              value={formData.submissionId ?? ''}
              onChange={handleInputChange}
              options={submissionsQuery.data?.map((submission) => ({
                value: submission.id,
                label: `${submission.candidateName} → ${submission.jobTitle}`,
              })) ?? []}
              placeholder="Select submission"
            />

            <Field
              label="Scheduled Date & Time"
              name="scheduledAt"
              type="datetime-local"
              value={formData.scheduledAt ?? ''}
              onChange={handleInputChange}
              required
            />

            <SelectField
              label="Mode"
              name="mode"
              value={formData.mode ?? ''}
              onChange={handleInputChange}
              required
              options={MODES.map((mode) => ({ value: mode, label: mode }))}
            />

            <SelectField
              label="Status"
              name="status"
              value={formData.status ?? ''}
              onChange={handleInputChange}
              options={STATUSES.map((status) => ({ value: status, label: status }))}
            />
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="text-sm font-semibold uppercase tracking-[0.18em] text-[rgb(var(--app-text-primary))]">Interview Panel</label>
              <button
                type="button"
                onClick={handleAddPanelMember}
                className="btn-muted px-3 py-2 text-sm"
              >
                <Plus size={16} />
                Add panel member
              </button>
            </div>

            <div className="space-y-3">
              {formData.panel?.map((member, index) => (
                <div key={index} className="rounded-2xl border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] p-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <input
                      type="text"
                      placeholder="Name *"
                      value={member.name ?? ''}
                      onChange={(e) => handlePanelMemberChange(index, 'name', e.target.value)}
                      className="input"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email *"
                      value={member.email ?? ''}
                      onChange={(e) => handlePanelMemberChange(index, 'email', e.target.value)}
                      className="input"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Role"
                      value={member.role || ''}
                      onChange={(e) => handlePanelMemberChange(index, 'role', e.target.value)}
                      className="input"
                    />
                    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-[rgba(var(--app-border-subtle))] px-4 py-3">
                      <label className="flex items-center gap-2 text-sm text-muted">
                        <input
                          type="checkbox"
                          checked={member.isExternal || false}
                          onChange={(e) => handlePanelMemberChange(index, 'isExternal', e.target.checked)}
                          className="h-4 w-4 rounded border-[rgba(var(--app-border-subtle))] accent-[rgb(var(--app-primary-from))]"
                        />
                        External interviewer
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemovePanelMember(index)}
                        className="ml-auto flex items-center gap-1 rounded-lg border border-transparent px-2 py-1 text-sm text-red-400 transition hover:border-red-400"
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {!(formData.panel && formData.panel.length) && (
                <p className="text-xs text-muted">Add interviewers to keep everyone in the loop with calendar invites and debriefs.</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold uppercase tracking-[0.18em] text-[rgb(var(--app-text-primary))]">Feedback / Notes</label>
            <textarea
              name="feedback"
              value={formData.feedback || ''}
              onChange={handleInputChange}
              className="input min-h-[140px]"
              placeholder="Interview feedback, notes, or instructions..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-muted">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {interview ? 'Update Interview' : 'Schedule Interview'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
};

function Field({ label, name, type = 'text', value, onChange, required, disabled }: FieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold uppercase tracking-[0.18em] text-[rgb(var(--app-text-primary))]">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="input"
      />
    </div>
  );
}

type SelectFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
};

function SelectField({ label, name, value, onChange, options, required, disabled, placeholder }: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold uppercase tracking-[0.18em] text-[rgb(var(--app-text-primary))]">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="input"
      >
        <option value="">{placeholder ?? `Select ${label.toLowerCase()}`}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
