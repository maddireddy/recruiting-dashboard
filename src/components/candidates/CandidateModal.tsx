import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import type { Candidate } from '../../types';

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-100 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-dark-200">
          <h2 className="text-2xl font-bold">
            {candidate ? 'Edit Candidate' : 'Add New Candidate'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-200 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">First Name</label>
              <input type="text" {...register('firstName')} className="input" />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <input type="text" {...register('lastName')} className="input" />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input type="email" {...register('email')} className="input" />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input type="tel" {...register('phone')} className="input" />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Primary Skills (comma-separated)</label>
            <input type="text" {...register('primarySkills')} className="input" placeholder="Java, React, Spring Boot" />
            {errors.primarySkills && <p className="text-red-500 text-sm mt-1">{errors.primarySkills.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Visa Status</label>
              <select {...register('visaStatus')} className="input">
                <option value="H1B">H1B</option>
                <option value="GREEN_CARD">Green Card</option>
                <option value="CITIZEN">US Citizen</option>
                <option value="EAD">EAD</option>
                <option value="OPT">OPT</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Experience (years)</label>
              <input type="number" min="0" {...register('totalExperience')} className="input" />
              {errors.totalExperience && <p className="text-red-500 text-sm mt-1">{errors.totalExperience.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Availability</label>
              <select {...register('availability')} className="input">
                <option value="IMMEDIATE">Immediate</option>
                <option value="2_WEEKS">2 Weeks</option>
                <option value="1_MONTH">1 Month</option>
                <option value="NOT_AVAILABLE">Not Available</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select {...register('status')} className="input">
                <option value="AVAILABLE">Available</option>
                <option value="PLACED">Placed</option>
                <option value="INTERVIEWING">Interviewing</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 disabled:opacity-60">
              {candidate ? 'Update Candidate' : 'Add Candidate'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-dark-200 hover:bg-dark-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
