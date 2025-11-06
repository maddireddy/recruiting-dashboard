import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Briefcase, MapPin, DollarSign, Edit, Trash2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Job } from '../../types/job';
import { useQueryClient } from '@tanstack/react-query';
import { jobService } from '../../services/job.service';

interface Props {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
}

export default function JobCard({ job, onEdit, onDelete }: Props) {
  const queryClient = useQueryClient();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-dark-200 rounded-lg border border-dark-300 p-4 cursor-move hover:border-primary-500 transition-colors"
      onMouseEnter={() => {
        // Prefetch job details so edit modal interactions feel snappier
        queryClient.prefetchQuery({
          queryKey: ['job', job.id],
          queryFn: () => jobService.getById(job.id).then(r => r.data),
          staleTime: 60_000,
        });
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-sm">
          <Link to={`/jobs/${job.id}`} onClick={(e) => e.stopPropagation()} className="hover:underline text-primary-400">
            {job.title}
          </Link>
        </h4>
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(job);
            }}
            className="p-1 hover:bg-primary-500/20 rounded"
          >
            <Edit size={14} className="text-primary-500" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(job.id);
            }}
            className="p-1 hover:bg-red-500/20 rounded"
          >
            <Trash2 size={14} className="text-red-500" />
          </button>
        </div>
      </div>

      <p className="text-sm text-dark-600 mb-3">{job.client}</p>

      <div className="space-y-2 text-xs text-dark-600">
        <div className="flex items-center gap-2">
          <MapPin size={12} />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Briefcase size={12} />
          <span>{job.jobType ? job.jobType.replace('_', ' ') : ''}</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign size={12} />
          <span>${job.rateMin} - ${job.rateMax}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users size={12} />
          <span>{job.submissionsCount} submissions</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {(job.requiredSkills ?? []).slice(0, 3).map(skill => (
          <span key={skill} className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded">
            {skill}
          </span>
        ))}
        {(job.requiredSkills ?? []).length > 3 && (
          <span className="px-2 py-1 bg-dark-300 text-dark-600 text-xs rounded">
            +{(job.requiredSkills ?? []).length - 3}
          </span>
        )}
      </div>
    </div>
  );
}
