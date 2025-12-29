import { useMemo } from 'react';
import * as DndKit from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useState } from 'react';
import type { Job, JobStatus } from '../../types/job';
import KanbanColumn from './KanbanColumn';
import JobCard from './JobCard';

interface Props {
  jobs: Job[];
  onUpdateStatus: (jobId: string, newStatus: JobStatus) => void;
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
}

const COLUMN_META: Array<{
  id: JobStatus;
  title: string;
  accent: {
    header: string;
    badge: string;
  };
}> = [
  {
    id: 'OPEN',
    title: 'Open',
    accent: {
      header: 'bg-emerald-500/10 text-emerald-400',
      badge: 'border-transparent bg-emerald-500/15 text-emerald-200',
    },
  },
  {
    id: 'IN_PROGRESS',
    title: 'In Progress',
    accent: {
      header: 'bg-sky-500/10 text-sky-400',
      badge: 'border-transparent bg-sky-500/15 text-sky-200',
    },
  },
  {
    id: 'INTERVIEW',
    title: 'Interview',
    accent: {
      header: 'bg-violet-500/10 text-violet-400',
      badge: 'border-transparent bg-violet-500/15 text-violet-200',
    },
  },
  {
    id: 'OFFERED',
    title: 'Offered',
    accent: {
      header: 'bg-amber-500/10 text-amber-400',
      badge: 'border-transparent bg-amber-500/15 text-amber-200',
    },
  },
  {
    id: 'CLOSED',
    title: 'Closed',
    accent: {
      header: 'bg-slate-500/10 text-slate-300',
      badge: 'border-transparent bg-slate-500/15 text-slate-200',
    },
  },
];

export default function KanbanBoard({ jobs, onUpdateStatus, onEdit, onDelete }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = DndKit.useSensors(
    DndKit.useSensor(DndKit.PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const jobsByStatus = useMemo(() => {
    return COLUMN_META.reduce((acc, status) => {
      acc[status.id] = jobs.filter(job => job.status === status.id);
      return acc;
    }, {} as Record<JobStatus, Job[]>);
  }, [jobs]);

  const handleDragStart = (event: DndKit.DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DndKit.DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const jobId = active.id as string;
    const newStatus = over.id as JobStatus;
    
    const job = jobs.find(j => j.id === jobId);
    if (job && job.status !== newStatus) {
      onUpdateStatus(jobId, newStatus);
    }
    
    setActiveId(null);
  };

  const activeJob = activeId ? jobs.find(j => j.id === activeId) : null;

  return (
    <DndKit.DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-[calc(100vh-280px)] gap-4 overflow-x-auto pb-4">
        {COLUMN_META.map(status => (
          <div key={status.id} className="min-w-64 w-full sm:w-80 max-w-xs flex-shrink-0">
            <KanbanColumn
              id={status.id}
              title={status.title}
              accent={status.accent}
              count={jobsByStatus[status.id]?.length || 0}
            >
              <SortableContext
                items={jobsByStatus[status.id]?.map(j => j.id) || []}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {jobsByStatus[status.id]?.map(job => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </SortableContext>
            </KanbanColumn>
          </div>
        ))}
      </div>

      <DndKit.DragOverlay>
        {activeJob && (
          <div className="rotate-3 opacity-80">
            <JobCard job={activeJob} onEdit={() => {}} onDelete={() => {}} />
          </div>
        )}
      </DndKit.DragOverlay>
    </DndKit.DndContext>
  );
}
