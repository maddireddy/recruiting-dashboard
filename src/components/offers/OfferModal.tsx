import { useState } from 'react';
import { z } from 'zod';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import Field from '../ui/Field';

interface Offer {
  id?: string;
  candidateId: string;
  jobId: string;
  status?: string;
  compStartDate?: string;
  compEndDate?: string;
  compRate?: number;
  notes?: string;
}

interface OfferModalProps {
  offer?: Offer | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Offer>) => Promise<void>;
}

const offerSchema = z.object({
  candidateId: z.string().min(1, 'Candidate is required'),
  jobId: z.string().min(1, 'Job is required'),
  status: z.enum(['DRAFT', 'PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED']).default('DRAFT'),
  compStartDate: z.string().optional(),
  compEndDate: z.string().optional(),
  compRate: z.number().positive('Rate must be greater than 0').optional(),
  notes: z.string().optional(),
}).refine(
  (data) => {
    if (data.compStartDate && data.compEndDate) {
      return new Date(data.compStartDate) <= new Date(data.compEndDate);
    }
    return true;
  },
  { message: 'End date must be after or equal to start date', path: ['compEndDate'] }
);

type OfferFormData = z.infer<typeof offerSchema>;

export default function OfferModal({ offer, isOpen, onClose, onSave }: OfferModalProps) {
  const [formData, setFormData] = useState<Partial<OfferFormData>>(() => {
    if (offer) {
      const { status, ...rest } = offer;
      return {
        ...rest,
        status: (status as any) === 'DRAFT' || (status as any) === 'PENDING' || (status as any) === 'ACCEPTED' || (status as any) === 'REJECTED' || (status as any) === 'EXPIRED'
          ? (status as any)
          : 'DRAFT',
      };
    }
    return { status: 'DRAFT' };
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof OfferFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const result = offerSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        errors[path] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(result.data);
      onClose();
      setFormData({ status: 'DRAFT' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save offer';
      setFieldErrors({ submit: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full mx-4 max-w-md rounded-2xl border border-app-border-subtle bg-app-surface-elevated shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 text-app-text-secondary hover:text-app-text-primary transition"
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-app-text-primary">
            {offer ? 'Edit Offer' : 'New Offer'}
          </h2>
        </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        {fieldErrors.submit && (
          <div className="rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-300">
            {fieldErrors.submit}
          </div>
        )}

        <Field
          htmlFor="candidateId"
          label="Candidate"
          error={fieldErrors.candidateId}
        >
          <input
            id="candidateId"
            type="text"
            value={formData.candidateId || ''}
            onChange={(e) => handleChange('candidateId', e.target.value)}
            placeholder="Enter candidate ID"
            className="input"
            aria-invalid={!!fieldErrors.candidateId}
            aria-describedby={fieldErrors.candidateId ? 'candidateId-error' : undefined}
          />
        </Field>

        <Field
          htmlFor="jobId"
          label="Job"
          error={fieldErrors.jobId}
        >
          <input
            id="jobId"
            type="text"
            value={formData.jobId || ''}
            onChange={(e) => handleChange('jobId', e.target.value)}
            placeholder="Enter job ID"
            className="input"
            aria-invalid={!!fieldErrors.jobId}
            aria-describedby={fieldErrors.jobId ? 'jobId-error' : undefined}
          />
        </Field>

        <Field
          htmlFor="status"
          label="Status"
        >
          <select
            id="status"
            value={formData.status || 'DRAFT'}
            onChange={(e) => handleChange('status', e.target.value)}
            className="input"
          >
            <option value="DRAFT">Draft</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </Field>

        <Field
          htmlFor="compStartDate"
          label="Start Date"
        >
          <input
            id="compStartDate"
            type="date"
            value={formData.compStartDate || ''}
            onChange={(e) => handleChange('compStartDate', e.target.value)}
            className="input"
          />
        </Field>

        <Field
          htmlFor="compEndDate"
          label="End Date"
          error={fieldErrors.compEndDate}
        >
          <input
            id="compEndDate"
            type="date"
            value={formData.compEndDate || ''}
            onChange={(e) => handleChange('compEndDate', e.target.value)}
            className="input"
            aria-invalid={!!fieldErrors.compEndDate}
            aria-describedby={fieldErrors.compEndDate ? 'compEndDate-error' : undefined}
          />
        </Field>

        <Field
          htmlFor="compRate"
          label="Rate (Optional)"
          hint="Hourly or daily rate"
        >
          <input
            id="compRate"
            type="number"
            value={formData.compRate || ''}
            onChange={(e) => handleChange('compRate', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="0.00"
            className="input"
            step="0.01"
            min="0"
            aria-invalid={!!fieldErrors.compRate}
            aria-describedby={fieldErrors.compRate ? 'compRate-error' : undefined}
          />
        </Field>

        <Field
          htmlFor="notes"
          label="Notes (Optional)"
        >
          <textarea
            id="notes"
            value={formData.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Add internal notes about this offer..."
            className="input min-h-24"
          />
        </Field>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Saving...' : 'Save Offer'}
          </Button>
          <Button
            type="button"
            variant="subtle"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
      </div>
    </div>
  );
}
