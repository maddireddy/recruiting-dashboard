import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Job } from '../../types/job';

interface Props {
  job: Job | null;
  onSave: (job: Partial<Job>) => void;
  onClose: () => void;
}

const JOB_TYPES = ['FULL_TIME', 'CONTRACT', 'CONTRACT_TO_HIRE'];
const STATUSES = ['OPEN', 'IN_PROGRESS', 'INTERVIEW', 'OFFERED', 'CLOSED'];

export default function JobModal({ job, onSave, onClose }: Props) {
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    location: '',
    jobType: 'CONTRACT' as Job['jobType'],
    status: 'OPEN' as Job['status'],
    description: '',
    requiredSkills: '',
    preferredSkills: '',
    minExperience: 0,
    maxExperience: 0,
    rateMin: 0,
    rateMax: 0,
    rateCurrency: 'USD',
    startDate: '',
    endDate: '',
    openings: 1,
  });

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || '',
        client: job.client || '',
        location: job.location || '',
        jobType: job.jobType || 'CONTRACT',
        status: job.status || 'OPEN',
        description: job.description || '',
        requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : '',
        preferredSkills: Array.isArray(job.preferredSkills) ? job.preferredSkills.join(', ') : '',
        minExperience: job.minExperience || 0,
        maxExperience: job.maxExperience || 0,
        rateMin: job.rateMin || 0,
        rateMax: job.rateMax || 0,
        rateCurrency: job.rateCurrency || 'USD',
        startDate: job.startDate || '',
        endDate: job.endDate || '',
        openings: job.openings || 1,
      });
    }
  }, [job]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
      preferredSkills: formData.preferredSkills.split(',').map(s => s.trim()).filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
      <div className="card w-full max-w-3xl max-h-[90vh] overflow-hidden p-0">
        <div className="sticky top-0 flex items-center justify-between border-b border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface))] px-6 py-4">
          <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">{job ? 'Edit Job' : 'Create Job'}</h2>
          <button onClick={onClose} type="button" className="rounded-lg border border-transparent p-2 text-muted transition hover:border-[rgba(var(--app-border-subtle))]">
            <X size={20} />
          </button>
        </div>

  <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto px-6 py-6 max-h-[calc(90vh-72px)]">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label="Job Title"
              required
              value={formData.title}
              onChange={(value) => setFormData({ ...formData, title: value })}
            />
            <Field
              label="Client"
              required
              value={formData.client}
              onChange={(value) => setFormData({ ...formData, client: value })}
            />

            <Field
              label="Location"
              required
              value={formData.location}
              onChange={(value) => setFormData({ ...formData, location: value })}
            />

            <SelectField
              label="Job Type"
              value={formData.jobType}
              onChange={(value) => setFormData({ ...formData, jobType: value as Job['jobType'] })}
              options={JOB_TYPES}
            />

            <SelectField
              label="Status"
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value as Job['status'] })}
              options={STATUSES}
            />

            <NumberField
              label="Openings"
              value={formData.openings}
              min={1}
              onChange={(value) => setFormData({ ...formData, openings: value || 1 })}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-[rgb(var(--app-text-primary))]">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="input min-h-[120px]"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label="Required Skills (comma-separated)"
              placeholder="Java, Spring Boot, React"
              value={formData.requiredSkills}
              onChange={(value) => setFormData({ ...formData, requiredSkills: value })}
            />

            <Field
              label="Preferred Skills (comma-separated)"
              placeholder="AWS, Kubernetes"
              value={formData.preferredSkills}
              onChange={(value) => setFormData({ ...formData, preferredSkills: value })}
            />

            <NumberField
              label="Min Experience (years)"
              value={formData.minExperience}
              onChange={(value) => setFormData({ ...formData, minExperience: value ?? 0 })}
            />

            <NumberField
              label="Max Experience (years)"
              value={formData.maxExperience}
              onChange={(value) => setFormData({ ...formData, maxExperience: value ?? 0 })}
            />

            <NumberField
              label="Rate Min ($)"
              value={formData.rateMin}
              onChange={(value) => setFormData({ ...formData, rateMin: value ?? 0 })}
              step="0.01"
            />

            <NumberField
              label="Rate Max ($)"
              value={formData.rateMax}
              onChange={(value) => setFormData({ ...formData, rateMax: value ?? 0 })}
              step="0.01"
            />

            <DateField
              label="Start Date"
              value={formData.startDate}
              onChange={(value) => setFormData({ ...formData, startDate: value })}
            />

            <DateField
              label="End Date"
              value={formData.endDate}
              onChange={(value) => setFormData({ ...formData, endDate: value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {job ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
};

function Field({ label, value, onChange, placeholder, required }: FieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold uppercase tracking-wide text-[rgb(var(--app-text-primary))]">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
};

function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold uppercase tracking-wide text-[rgb(var(--app-text-primary))]">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replace('_', ' ')}
          </option>
        ))}
      </select>
    </div>
  );
}

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (value: number | undefined) => void;
  min?: number;
  step?: string;
};

function NumberField({ label, value, onChange, min = 0, step }: NumberFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold uppercase tracking-wide text-[rgb(var(--app-text-primary))]">{label}</label>
      <input
        type="number"
        value={Number.isFinite(value) ? value : ''}
        onChange={(e) => {
          const next = e.target.value;
          onChange(next === '' ? undefined : Number(next));
        }}
        min={min}
        step={step}
        className="input"
      />
    </div>
  );
}

type DateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function DateField({ label, value, onChange }: DateFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold uppercase tracking-wide text-[rgb(var(--app-text-primary))]">{label}</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      />
    </div>
  );
}
