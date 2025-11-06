import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService } from '../services/job.service';
import { Suspense, lazy, useMemo, useState, useEffect } from 'react';
const KanbanBoard = lazy(() => import('../components/jobs/KanbanBoard'));
const JobModal = lazy(() => import('../components/jobs/JobModal'));
import type { Job, JobStatus } from '../types/job';
import { Plus, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import JobFiltersSidebar, { type JobFilters } from '../components/jobs/JobFiltersSidebar';

export default function JobsPage() {
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Saved views
  const [savedViews, setSavedViews] = useState<{ name: string; params: Record<string, any> }[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('jobsSavedViews') || '[]');
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('jobsSavedViews', JSON.stringify(savedViews));
  }, [savedViews]);

  const paramsObject = useMemo(() => {
    const obj: Record<string, string> = {};
    for (const [k, v] of searchParams.entries()) obj[k] = v;
    return obj;
  }, [searchParams]);

  const initialFilters: JobFilters = useMemo(() => ({
    status: paramsObject.status ? (paramsObject.status.split(',') as JobStatus[]) : undefined,
    client: paramsObject.client || undefined,
    skills: paramsObject.skills ? paramsObject.skills.split(',') : undefined,
    minExp: paramsObject.minExp ? Number(paramsObject.minExp) : undefined,
    maxExp: paramsObject.maxExp ? Number(paramsObject.maxExp) : undefined,
    startDateFrom: paramsObject.startDateFrom || undefined,
    startDateTo: paramsObject.startDateTo || undefined,
  }), [paramsObject]);

  const jobsQuery = useQuery({
    queryKey: ['jobs', paramsObject],
    queryFn: () =>
      jobService
        .search({ page: 0, size: 100, ...paramsObject })
        .then((r) => (Array.isArray((r as any).data) ? (r as any).data : ((r as any).data?.content || [])))
  });

  const updateStatus = useMutation({
    mutationFn: ({ jobId, newStatus }: { jobId: string; newStatus: JobStatus }) =>
      jobService.update(jobId, { status: newStatus }),
    // Optimistic update: move the job to the new status immediately
    onMutate: async ({ jobId, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['jobs'] });

      const previousEntries = queryClient.getQueriesData<Job[]>({ queryKey: ['jobs'] });

      queryClient.setQueriesData<Job[]>({ queryKey: ['jobs'] }, (prev) =>
        (prev ?? []).map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
      );

      return { previousEntries } as { previousEntries: Array<[unknown, Job[] | undefined]> };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousEntries) {
        for (const [key, data] of context.previousEntries) {
          queryClient.setQueryData(key as any, data);
        }
      }
      toast.error('Failed to move job. Reverting change.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job status updated');
    },
  });

  const createJob = useMutation({
    mutationFn: (job: Partial<Job>) => jobService.create(job),
    onMutate: async (newJob) => {
      await queryClient.cancelQueries({ queryKey: ['jobs'] });
      const previousEntries = queryClient.getQueriesData<Job[]>({ queryKey: ['jobs'] });
      const tempId = `temp-${Date.now()}`;

      // Insert a temporary job so the board feels snappy
      queryClient.setQueriesData<Job[]>({ queryKey: ['jobs'] }, (prev = []) => [
        {
          id: tempId,
          tenantId: '',
          title: newJob.title || 'New Job',
          client: newJob.client || '',
          location: newJob.location || '',
          jobType: (newJob.jobType as Job['jobType']) || 'FULL_TIME',
          status: (newJob.status as JobStatus) || 'OPEN',
          description: newJob.description || '',
          requiredSkills: newJob.requiredSkills || [],
          preferredSkills: newJob.preferredSkills || [],
          minExperience: newJob.minExperience || 0,
          maxExperience: newJob.maxExperience || 0,
          rateMin: newJob.rateMin || 0,
          rateMax: newJob.rateMax || 0,
          rateCurrency: newJob.rateCurrency || 'USD',
          startDate: newJob.startDate || new Date().toISOString(),
          endDate: newJob.endDate || new Date().toISOString(),
          openings: newJob.openings || 1,
          submissionsCount: 0,
          interviewsCount: 0,
          createdBy: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      return { previousEntries, tempId } as { previousEntries: Array<[unknown, Job[] | undefined]>; tempId: string };
    },
    onSuccess: (res, _vars, context) => {
      const created = res.data;
      // Replace temp with created job
      if (context?.tempId) {
        queryClient.setQueriesData<Job[]>({ queryKey: ['jobs'] }, (prev = []) =>
          prev.map((j) => (j.id === context.tempId ? created : j))
        );
      }
      toast.success('Job created');
    },
    onError: (_err, _vars, context) => {
      if (context?.previousEntries) {
        for (const [key, data] of context.previousEntries) {
          queryClient.setQueryData(key as any, data);
        }
      }
      toast.error('Failed to create job');
    },
    onSettled: () => {
      // Ensure server-truth
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setShowModal(false);
    },
  });

  const updateJob = useMutation({
    mutationFn: (job: Partial<Job>) => {
      if (!selectedJob?.id) throw new Error('No job selected');
      return jobService.update(selectedJob.id, job);
    },
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: ['jobs'] });
      const previousEntries = queryClient.getQueriesData<Job[]>({ queryKey: ['jobs'] });
      if (selectedJob?.id) {
        queryClient.setQueriesData<Job[]>({ queryKey: ['jobs'] }, (prev = []) =>
          prev.map((j) => (j.id === selectedJob.id ? ({ ...j, ...patch, updatedAt: new Date().toISOString() } as Job) : j))
        );
      }
      return { previousEntries } as { previousEntries: Array<[unknown, Job[] | undefined]> };
    },
    onSuccess: (res) => {
      const updated = res.data;
      queryClient.setQueriesData<Job[]>({ queryKey: ['jobs'] }, (prev = []) => prev.map((j) => (j.id === updated.id ? updated : j)));
      toast.success('Job updated');
    },
    onError: (_err, _vars, context) => {
      if (context?.previousEntries) {
        for (const [key, data] of context.previousEntries) {
          queryClient.setQueryData(key as any, data);
        }
      }
      toast.error('Failed to update job');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setShowModal(false);
      setSelectedJob(null);
    },
  });

  const deleteJob = useMutation({
    mutationFn: (id: string) => jobService.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['jobs'] });
      const previousEntries = queryClient.getQueriesData<Job[]>({ queryKey: ['jobs'] });
      queryClient.setQueriesData<Job[]>({ queryKey: ['jobs'] }, (prev = []) => prev.filter((j) => j.id !== id));
      return { previousEntries } as { previousEntries: Array<[unknown, Job[] | undefined]> };
    },
    onSuccess: () => {
      toast.success('Job deleted');
    },
    onError: (_err, _vars, context) => {
      if (context?.previousEntries) {
        for (const [key, data] of context.previousEntries) {
          queryClient.setQueryData(key as any, data);
        }
      }
      toast.error('Failed to delete job');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const handleSave = (job: Partial<Job>) => {
    if (selectedJob) {
      updateJob.mutate(job);
    } else {
      createJob.mutate(job);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Jobs</h1>
          <p className="text-dark-600">Manage client requirements & workflow</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-dark-200 hover:bg-dark-300 rounded transition"
          >
            <Filter size={18} />
            Filters
          </button>
          <button
            onClick={() => {
              setSelectedJob(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded transition"
          >
            <Plus size={18} />
            Add Job
          </button>
        </div>
      </div>

      {jobsQuery.isLoading && <p>Loading jobs...</p>}
      {jobsQuery.error && <p className="text-red-500">Error loading jobs</p>}

      {jobsQuery.data && (
        <Suspense fallback={<div className="p-6">Loading jobs board...</div>}>
          <KanbanBoard
            jobs={jobsQuery.data}
            onUpdateStatus={(jobId, newStatus) => updateStatus.mutate({ jobId, newStatus })}
            onEdit={job => {
              setSelectedJob(job);
              setShowModal(true);
            }}
            onDelete={id => {
              if (confirm('Delete this job?')) deleteJob.mutate(id);
            }}
          />
        </Suspense>
      )}

      {showModal && (
        <Suspense fallback={<div className="p-6">Loading job form...</div>}>
          <JobModal
            job={selectedJob}
            onSave={handleSave}
            onClose={() => {
              setShowModal(false);
              setSelectedJob(null);
            }}
          />
        </Suspense>
      )}

      <JobFiltersSidebar
        open={filtersOpen}
        initial={initialFilters}
        onClose={() => setFiltersOpen(false)}
        onApply={(f) => {
          const p: Record<string, string> = {};
          if (f.status?.length) p.status = f.status.join(',');
          if (f.client) p.client = f.client;
          if (f.skills?.length) p.skills = f.skills.join(',');
          if (typeof f.minExp === 'number') p.minExp = String(f.minExp);
          if (typeof f.maxExp === 'number') p.maxExp = String(f.maxExp);
          if (f.startDateFrom) p.startDateFrom = f.startDateFrom;
          if (f.startDateTo) p.startDateTo = f.startDateTo;
          setSearchParams(p, { replace: true });
          setFiltersOpen(false);
        }}
        savedViews={savedViews}
        onSaveView={(name, params) => {
          setSavedViews((prev) => {
            const without = prev.filter((v) => v.name !== name);
            return [...without, { name, params }];
          });
        }}
        onApplyView={(view) => {
          const sp = new URLSearchParams(view.params as Record<string, string>);
          setSearchParams(sp, { replace: true });
        }}
      />
    </div>
  );
}
