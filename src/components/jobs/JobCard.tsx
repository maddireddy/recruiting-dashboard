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
      className={`card cursor-move space-y-3 p-4 transition duration-200 ${isDragging ? 'border-[rgba(var(--app-primary-from),0.45)] shadow-xl' : 'hover:border-[rgba(var(--app-primary-from),0.35)]'}`}
      onMouseEnter={() => {
        // Prefetch job details so edit modal interactions feel snappier
        queryClient.prefetchQuery({
          queryKey: ['job', job.id],
          queryFn: () => jobService.getById(job.id).then(r => r.data),
          staleTime: 60_000,
        });
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-sm font-semibold">
          <Link
            to={`/jobs/${job.id}`}
            onClick={(e) => e.stopPropagation()}
            className="transition hover:text-[rgb(var(--app-primary-from))]"
          >
            {job.title}
          </Link>
        </h4>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(job);
            }}
            className="rounded-lg border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] p-1.5 text-[rgb(var(--app-text-secondary))] transition hover:text-[rgb(var(--app-primary-from))]"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(job.id);
            }}
            className="rounded-lg border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] p-1.5 text-[rgb(var(--app-text-secondary))] transition hover:text-red-400"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <p className="text-sm text-muted">{job.client}</p>

      <div className="space-y-2 text-xs text-[rgb(var(--app-text-secondary))]">
        <div className="flex items-center gap-2">
          <MapPin size={12} className="text-muted" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Briefcase size={12} className="text-muted" />
          <span>{job.jobType ? job.jobType.replace('_', ' ') : ''}</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign size={12} className="text-muted" />
          <span>${job.rateMin} - ${job.rateMax}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users size={12} className="text-muted" />
          <span>{job.submissionsCount} submissions</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(job.requiredSkills ?? []).slice(0, 3).map(skill => (
          <span key={skill} className="chip chip-active">
            {skill}
          </span>
        ))}
        {(job.requiredSkills ?? []).length > 3 && (
          <span className="chip text-[rgb(var(--app-text-secondary))]">
            +{(job.requiredSkills ?? []).length - 3}
          </span>
        )}
      </div>
    </div>
  );
}
