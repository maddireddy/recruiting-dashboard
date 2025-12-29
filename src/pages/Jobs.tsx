import { useList, useCreate, useUpdate, useDelete } from '../services/hooks';
import { jobService } from '../services/job.service';
import { Suspense, lazy, useMemo, useState, useEffect } from 'react';
const KanbanBoard = lazy(() => import('../components/jobs/KanbanBoard'));
const JobModal = lazy(() => import('../components/jobs/JobModal'));
import type { Job, JobStatus } from '../types/job';
import { Plus, Filter, Download } from 'lucide-react';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import { reportService } from '../services/report.service';
import { useSearchParams } from 'react-router-dom';
import JobFiltersSidebar, { type JobFilters } from '../components/jobs/JobFiltersSidebar';

export default function JobsPage() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Get tenant ID from localStorage
  const tenantId = localStorage.getItem('tenantId') || undefined;

  // Saved views
  const [savedViews, setSavedViews] = useState<{ name: string; params: Record<string, string | string[]> }[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('jobsSavedViews') || '[]');
    } catch {
      // Failed to parse saved views from localStorage, returning empty array
      return [];
    }
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

  // Use standardized hooks
  const jobsQ = useList<Job[]>('jobs', (tid) => {
    return jobService.search({ page: 0, size: 100, ...paramsObject }, tid);
  }, tenantId);

  const createM = useCreate('jobs', jobService.create, tenantId);
  const updateM = useUpdate<Partial<Job>, Job>('jobs', (id, data, tid) => jobService.update(id, data, tid), tenantId);
  const deleteM = useDelete('jobs', jobService.delete, tenantId);









  const handleSave = async (job: Partial<Job>) => {
    try {
      if (selectedJob) {
        await updateM.mutateAsync({ id: selectedJob.id, data: job });
      } else {
        await createM.mutateAsync(job);
      }
      setShowModal(false);
      setSelectedJob(null);
    } catch (error) {
      console.error('Failed to save job:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <PageHeader title="Jobs" subtitle="Manage client requirements & workflow" actions={<div className="flex items-center gap-2">
          <Button variant="subtle" size="sm" onClick={() => setFiltersOpen(true)}>
            <Filter size={14} />
            <span className="ml-2">Filters</span>
          </Button>
          <Button variant="subtle" size="sm" onClick={() => reportService.exportJobsCSV()}>
            <Download size={14} />
            <span className="ml-2">Export</span>
          </Button>
          <Button variant="primary" size="md" onClick={() => { setSelectedJob(null); setShowModal(true); }}>
            <Plus size={16} />
            <span className="ml-2">New Job</span>
          </Button>
        </div>} />
      </div>

      {jobsQ.isLoading && <div className="card">Loading jobs...</div>}
      {jobsQ.error && <div className="card text-sm text-red-500">Error loading jobs</div>}

      {jobsQ.data && (
        <Suspense fallback={<div className="card">Loading jobs board...</div>}>
          <KanbanBoard
            jobs={jobsQ.data}
            onUpdateStatus={async (jobId, newStatus) => {
              try {
                await updateM.mutateAsync({ id: jobId, data: { status: newStatus } });
              } catch (error) {
                console.error('Failed to update job status:', error);
              }
            }}
            onEdit={job => {
              setSelectedJob(job);
              setShowModal(true);
            }}
            onDelete={async (id) => {
              if (confirm('Delete this job?')) {
                try {
                  await deleteM.mutateAsync(id);
                } catch (error) {
                  console.error('Failed to delete job:', error);
                }
              }
            }}
          />
        </Suspense>
      )}

      {showModal && (
        <Suspense fallback={<div className="card">Loading job form...</div>}>
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

// (export button integrated into header above)
