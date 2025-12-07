import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import type { Candidate } from '../../types';
import { FormField } from '../common/FormField';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Candidate>) => void;
  candidate?: Candidate | null;
}

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(7, 'Enter a valid phone'),
  visaStatus: z.string().min(1),
  primarySkills: z.string().min(1, 'Enter at least one skill'),
  totalExperience: z.coerce.number().min(0, 'Experience cannot be negative'),
  availability: z.string().min(1),
  status: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export default function CandidateModal({ isOpen, onClose, onSave, candidate }: Props) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      visaStatus: 'H1B',
      primarySkills: '',
      totalExperience: 0,
      availability: 'IMMEDIATE',
      status: 'AVAILABLE',
    },
  });

  useEffect(() => {
    if (candidate) {
      reset({
        firstName: candidate.firstName || '',
        lastName: candidate.lastName || '',
        email: candidate.email || '',
        phone: candidate.phone || '',
        visaStatus: candidate.visaStatus || 'H1B',
        primarySkills: Array.isArray(candidate.primarySkills) ? candidate.primarySkills.join(', ') : '',
        totalExperience: candidate.totalExperience || 0,
        availability: candidate.availability || 'IMMEDIATE',
        status: candidate.status || 'AVAILABLE',
      });
    } else {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        visaStatus: 'H1B',
        primarySkills: '',
        totalExperience: 0,
        availability: 'IMMEDIATE',
        status: 'AVAILABLE',
      });
    }
  }, [candidate, isOpen, reset]);

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      fullName: `${values.firstName} ${values.lastName}`.trim(),
      primarySkills: values.primarySkills.split(',').map((s) => s.trim()).filter(Boolean),
    };
    onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
      <div className="card w-full max-w-3xl max-h-[90vh] overflow-hidden p-0">
        <div className="sticky top-0 flex items-center justify-between border-b border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface))] px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {candidate ? 'Edit candidate' : 'Add candidate'}
            </p>
            <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">Candidate profile</h2>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg border border-transparent p-2 text-muted transition hover:border-[rgba(var(--app-border-subtle))]"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="max-h-[calc(90vh-72px)] space-y-6 overflow-y-auto px-6 py-6"
        >
          <section className="grid gap-4 md:grid-cols-2">
            <FormField label="First name" required error={errors.firstName?.message}>
              <input type="text" {...register('firstName')} className="input" placeholder="Jane" />
            </FormField>
            <FormField label="Last name" required error={errors.lastName?.message}>
              <input type="text" {...register('lastName')} className="input" placeholder="Doe" />
            </FormField>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <FormField label="Email" required error={errors.email?.message}>
              <input type="email" {...register('email')} className="input" placeholder="jane@example.com" />
            </FormField>
            <FormField label="Phone" required error={errors.phone?.message}>
              <input type="tel" {...register('phone')} className="input" placeholder="(555) 123-4567" />
            </FormField>
          </section>

          <FormField
            label="Primary skills"
            required
            description="Separate skills with commas"
            error={errors.primarySkills?.message}
          >
            <input type="text" {...register('primarySkills')} className="input" placeholder="Java, React, Spring Boot" />
          </FormField>

          <section className="grid gap-4 md:grid-cols-2">
            <FormField label="Visa status" required>
              <select {...register('visaStatus')} className="input">
                <option value="H1B">H1B</option>
                <option value="GREEN_CARD">Green Card</option>
                <option value="CITIZEN">US Citizen</option>
                <option value="EAD">EAD</option>
                <option value="OPT">OPT</option>
              </select>
            </FormField>
            <FormField label="Experience (years)" required error={errors.totalExperience?.message}>
              <input type="number" min="0" {...register('totalExperience')} className="input" placeholder="5" />
            </FormField>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <FormField label="Availability" required>
              <select {...register('availability')} className="input">
                <option value="IMMEDIATE">Immediate</option>
                <option value="2_WEEKS">2 Weeks</option>
                <option value="1_MONTH">1 Month</option>
                <option value="NOT_AVAILABLE">Not Available</option>
              </select>
            </FormField>
            <FormField label="Status" required>
              <select {...register('status')} className="input">
                <option value="AVAILABLE">Available</option>
                <option value="PLACED">Placed</option>
                <option value="INTERVIEWING">Interviewing</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </FormField>
          </section>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-muted"
            >
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary disabled:opacity-60">
              {candidate ? 'Update candidate' : 'Add candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
