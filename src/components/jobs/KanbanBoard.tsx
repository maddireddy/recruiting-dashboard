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

const STATUSES: { id: JobStatus; title: string; color: string }[] = [
  { id: 'OPEN', title: 'Open', color: 'bg-blue-500/20 border-blue-500/30' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-yellow-500/20 border-yellow-500/30' },
  { id: 'INTERVIEW', title: 'Interview', color: 'bg-purple-500/20 border-purple-500/30' },
  { id: 'OFFERED', title: 'Offered', color: 'bg-green-500/20 border-green-500/30' },
  { id: 'CLOSED', title: 'Closed', color: 'bg-gray-500/20 border-gray-500/30' },
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
    return STATUSES.reduce((acc, status) => {
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
      <div className="flex gap-4 h-[calc(100vh-200px)] overflow-x-auto pb-4">
        {STATUSES.map(status => (
          <div key={status.id} className="min-w-[260px] max-w-xs flex-shrink-0">
            <KanbanColumn
              id={status.id}
              title={status.title}
              color={status.color}
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
