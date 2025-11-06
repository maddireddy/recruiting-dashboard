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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-100 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-dark-100 border-b border-dark-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{job ? 'Edit Job' : 'Create Job'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-dark-200 rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Job Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Client</label>
              <input
                type="text"
                value={formData.client}
                onChange={e => setFormData({ ...formData, client: e.target.value })}
                className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Job Type</label>
              <select
                value={formData.jobType}
                onChange={e => setFormData({ ...formData, jobType: e.target.value as Job['jobType'] })}
                className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
              >
                {JOB_TYPES.map(type => (
                  <option key={type} value={type}>{type.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as Job['status'] })}
                className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
              >
                {STATUSES.map(status => (
                  <option key={status} value={status}>{status.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Openings</label>
              <input
                type="number"
                value={formData.openings}
                onChange={e => setFormData({ ...formData, openings: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Required Skills (comma-separated)</label>
              <input
                type="text"
                value={formData.requiredSkills}
                onChange={e => setFormData({ ...formData, requiredSkills: e.target.value })}
                className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
                placeholder="Java, Spring Boot, React"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Preferred Skills (comma-separated)</label>
              <input
                type="text"
                value={formData.preferredSkills}
                onChange={e => setFormData({ ...formData, preferredSkills: e.target.value })}
                className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
                placeholder="AWS, Kubernetes"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Min Experience (years)</label>
              <input
                type="number"
                value={formData.minExperience}
                onChange={e => setFormData({ ...formData, minExperience: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Max Experience (years)</label>
              <input
                type="number"
                value={formData.maxExperience}
                onChange={e => setFormData({ ...formData, maxExperience: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Rate Min ($)</label>
              <input
                type="number"
                value={formData.rateMin}
                onChange={e => setFormData({ ...formData, rateMin: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Rate Max ($)</label>
              <input
                type="number"
                value={formData.rateMax}
                onChange={e => setFormData({ ...formData, rateMax: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
              />
            </div>
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
              {job ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
