import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Download, SlidersHorizontal, RotateCcw, Users, Rocket, CalendarClock, Briefcase, Sparkles, Filter, TrendingUp } from 'lucide-react';
import { reportService } from '../services/report.service';
import toast from 'react-hot-toast';
import type { Candidate } from '../types';
import CandidateTable from '../components/candidates/CandidateTable';
import { BulkActionBar } from '../components/bulk/BulkActionBar';
import CandidateModal from '../components/candidates/CandidateModal';
import { candidateService } from '../services/candidate.service';
import { useSearchParams } from 'react-router-dom';
import { useList, useCreate, useUpdate, useDelete } from '../services/hooks';

type CandidateColumnKey = 'name' | 'contact' | 'skills' | 'experience' | 'availability' | 'status' | 'actions';
type ResizableCandidateColumnKey = Exclude<CandidateColumnKey, 'actions'>;
type CandidateColumnWidths = Partial<Record<ResizableCandidateColumnKey, number>>;

type CandidateSavedView = {
  name: string;
  filters: Record<string, string>;
  visibleColumns: CandidateColumnKey[];
  columnWidths: CandidateColumnWidths;
};


const ALL_CANDIDATE_COLUMNS: CandidateColumnKey[] = ['name', 'contact', 'skills', 'experience', 'availability', 'status', 'actions'];
const RESIZABLE_CANDIDATE_COLUMNS: ResizableCandidateColumnKey[] = ['name', 'contact', 'skills', 'experience', 'availability', 'status'];
const isCandidateColumn = (value: string): value is CandidateColumnKey =>
  ALL_CANDIDATE_COLUMNS.includes(value as CandidateColumnKey);
const QUICK_STATUS_FILTERS = ['AVAILABLE', 'INTERVIEWING', 'PLACED', 'ON_HOLD'] as const;

const getCandidateTimestamp = (candidate: Candidate) => {
  const meta = candidate as { updatedAt?: string | null; createdAt?: string | null };
  return meta.updatedAt ?? meta.createdAt ?? null;
};

const normalizeColumnWidths = (value: unknown): CandidateColumnWidths => {
  const widths: CandidateColumnWidths = {};
  if (value && typeof value === 'object') {
    RESIZABLE_CANDIDATE_COLUMNS.forEach((column) => {
      const maybeNumber = (value as Record<string, unknown>)[column];
      if (typeof maybeNumber === 'number') {
        widths[column] = maybeNumber;
      }
    });
  }
  return widths;
};

export default function Candidates() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [availability, setAvailability] = useState('');
  const [visaStatus, setVisaStatus] = useState('');
  const [recruiterId, setRecruiterId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Get tenant ID from localStorage
  const tenantId = localStorage.getItem('tenantId') || undefined;

  // Use standardized hooks
  const candidatesQ = useList<Candidate[]>('candidates', (tid) => {
    const params: Record<string, string | number | boolean | string[] | undefined> = { page, size: 10 };
    if (/[,;|]/.test(searchTerm)) {
      params.skills = searchTerm.split(/[,;|]/).map(s => s.trim()).filter(Boolean);
    } else if (searchTerm) {
      params.q = searchTerm;
    }
    if (selectedStatus) params.status = selectedStatus;
    if (availability) params.availability = availability;
    if (visaStatus) params.visaStatus = visaStatus;
    if (recruiterId) params.recruiterId = recruiterId;

    // If no search term or skills, use getAll instead of search
    if (!params.q && !params.skills) {
      return candidateService.getAll(page, 10, tid);
    }
    return candidateService.search(params, tid);
  }, tenantId);

  const createM = useCreate('candidates', candidateService.create, tenantId);
  const updateM = useUpdate<Partial<Candidate>, Candidate>('candidates', (id, data, tid) => candidateService.update(id, data, tid), tenantId);
  const deleteM = useDelete('candidates', candidateService.delete, tenantId);
  const [visibleColumns, setVisibleColumns] = useState<Set<CandidateColumnKey>>(
    () => {
      const raw = localStorage.getItem('candidateTable.visibleColumns.v1');
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as unknown;
          const columns = Array.isArray(parsed)
            ? parsed.filter((col): col is CandidateColumnKey => typeof col === 'string' && isCandidateColumn(col))
            : ALL_CANDIDATE_COLUMNS;
          const columnSet = new Set(columns);
          columnSet.add('availability');
          return columnSet;
        } catch {
          // Fallback to defaults if parse fails
        }
      }
      return new Set(ALL_CANDIDATE_COLUMNS);
    }
  );
  const [columnWidths, setColumnWidths] = useState<CandidateColumnWidths>(() => {
    const raw = localStorage.getItem('candidateTable.columnWidths.v1');
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as unknown;
        return normalizeColumnWidths(parsed);
      } catch {
        // Fallback to defaults if parse fails
      }
    }
  return { name: 260, contact: 240, skills: 300, experience: 140, availability: 150, status: 140 };
  });
  const [showColumnsPanel, setShowColumnsPanel] = useState(false);
  const [savedViews, setSavedViews] = useState<CandidateSavedView[]>(() => {
    const raw = localStorage.getItem('candidateTable.savedViews.v1');
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as CandidateSavedView[];
        return parsed.map((view) => ({
          ...view,
          visibleColumns: Array.from(new Set([
            ...view.visibleColumns.filter((col): col is CandidateColumnKey => isCandidateColumn(col)),
            'availability',
          ])),
          columnWidths: normalizeColumnWidths(view.columnWidths),
        }));
      } catch {
        // Fallback to empty if parse fails
      }
    }
    return [];
  });
  const [selectedView, setSelectedView] = useState<string>('');

  // Initialize state from URL on first render
  useEffect(() => {
    const p = parseInt(searchParams.get('page') || '0', 10);
    setPage(Number.isFinite(p) && p >= 0 ? p : 0);
    setSearchTerm(searchParams.get('q') || '');
    setSelectedStatus(searchParams.get('status') || '');
    setAvailability(searchParams.get('availability') || '');
    setVisaStatus(searchParams.get('visaStatus') || '');
    setRecruiterId(searchParams.get('recruiterId') || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep URL in sync when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (page) params.set('page', String(page));
    if (searchTerm) params.set('q', searchTerm);
    if (selectedStatus) params.set('status', selectedStatus);
    if (availability) params.set('availability', availability);
    if (visaStatus) params.set('visaStatus', visaStatus);
    if (recruiterId) params.set('recruiterId', recruiterId);
    setSearchParams(params);
  }, [page, searchTerm, selectedStatus, availability, visaStatus, recruiterId, setSearchParams]);

  // Persist columns prefs
  useEffect(() => {
    localStorage.setItem('candidateTable.visibleColumns.v1', JSON.stringify(Array.from(visibleColumns)));
  }, [visibleColumns]);
  useEffect(() => {
    localStorage.setItem('candidateTable.columnWidths.v1', JSON.stringify(columnWidths));
  }, [columnWidths]);

  // Reset selection when data set changes (page/filters)
  useEffect(() => {
    setSelectedIds(new Set());
  }, [page, searchTerm, selectedStatus, availability, visaStatus, recruiterId]);

  // Debug: log candidate list whenever query data changes
  useEffect(() => {
    console.debug('[Candidates.tsx] candidate list', candidatesQ.data);
  }, [candidatesQ.data]);

  // legacy bulk delete mutation removed; bulk operations now routed through the bulk API

  const handleSave = async (data: Partial<Candidate>) => {
    try {
      if (selectedCandidate) {
        await updateM.mutateAsync({ id: selectedCandidate.id, data });
        toast.success('Candidate updated successfully!');
      } else {
        await createM.mutateAsync(data);
        toast.success('Candidate created successfully!');
      }
      setIsModalOpen(false);
      setSelectedCandidate(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      toast.error(message ? `Failed to save candidate: ${message}` : 'Failed to save candidate');
    }
  };

  const handleEdit = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const target = candidates.find((c) => c.id === id);
    const label = target?.fullName || 'this candidate';
    if (!window.confirm(`Delete ${label}? This action cannot be undone.`)) return;
    await toast.promise(
      deleteM.mutateAsync(id),
      {
        loading: 'Removing candidate…',
        success: `${label} removed`,
        error: `Could not delete ${label}.` ,
      }
    );
  };

  const handleAddNew = () => {
    setSelectedCandidate(null);
    setIsModalOpen(true);
  };

  const candidates = candidatesQ.data || [];
  const totalPages = 1; // Simplified for now, can be enhanced later
  const totalCandidates = candidates.length;

  const statusBreakdown = useMemo(() => {
    return candidates.reduce(
      (acc, candidate) => {
        const status = (candidate.status || '').toUpperCase();
        if (status === 'AVAILABLE') acc.available += 1;
        else if (status === 'INTERVIEWING') acc.interviewing += 1;
        else if (status === 'PLACED') acc.placed += 1;
        else if (status === 'ON_HOLD') acc.onHold += 1;
        return acc;
      },
      { available: 0, interviewing: 0, placed: 0, onHold: 0 }
    );
  }, [candidates]);

  const averageExperience = useMemo(() => {
    const experiences = candidates
      .map((candidate) => candidate.totalExperience ?? 0)
      .filter((value) => typeof value === 'number' && Number.isFinite(value));
    if (experiences.length === 0) return 0;
    const total = experiences.reduce((sum, value) => sum + Number(value), 0);
    return total / experiences.length;
  }, [candidates]);

  const heroMetrics = useMemo(
    () => [
      {
        key: 'total',
        label: 'Total talent',
        value: totalCandidates,
        icon: <Users size={18} />,
        accent: 'bg-[rgba(var(--app-primary-from),0.12)] text-[rgb(var(--app-primary-from))]',
      },
      {
        key: 'available',
        label: 'Ready to deploy',
        value: statusBreakdown.available,
        icon: <Rocket size={18} />,
        accent: 'bg-emerald-500/15 text-emerald-300',
      },
      {
        key: 'interviewing',
        label: 'Interviewing',
        value: statusBreakdown.interviewing,
        icon: <CalendarClock size={18} />,
        accent: 'bg-amber-500/15 text-amber-300',
      },
      {
        key: 'placed',
        label: 'Placements',
        value: statusBreakdown.placed,
        icon: <Briefcase size={18} />,
        accent: 'bg-sky-500/15 text-sky-300',
      },
    ],
    [statusBreakdown.available, statusBreakdown.interviewing, statusBreakdown.placed, totalCandidates]
  );

  const pipelineDistribution = useMemo(() => {
    const total = statusBreakdown.available + statusBreakdown.interviewing + statusBreakdown.placed + statusBreakdown.onHold;
    const entries = [
      { key: 'available', label: 'Available now', value: statusBreakdown.available, barClass: 'bg-emerald-400' },
      { key: 'interviewing', label: 'Interviewing', value: statusBreakdown.interviewing, barClass: 'bg-amber-400' },
      { key: 'placed', label: 'Placed', value: statusBreakdown.placed, barClass: 'bg-sky-400' },
      { key: 'onHold', label: 'On hold', value: statusBreakdown.onHold, barClass: 'bg-purple-400' },
    ];
    return entries.map((entry) => ({
      ...entry,
      percent: total > 0 ? Math.round((entry.value / total) * 100) : 0,
    }));
  }, [statusBreakdown]);

  const topSkills = useMemo(() => {
    const counts = new Map<string, number>();
    candidates.forEach((candidate) => {
      (candidate.primarySkills ?? []).forEach((skill) => {
        const normalized = (skill || '').trim();
        if (!normalized) return;
        counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [candidates]);

  const latestUpdatedCandidate = useMemo(() => {
    const enriched = candidates
      .map((candidate) => ({ candidate, timestamp: getCandidateTimestamp(candidate) }))
      .filter((entry): entry is { candidate: Candidate; timestamp: string } => Boolean(entry.timestamp));
    if (enriched.length === 0) return undefined;
    enriched.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return enriched[0];
  }, [candidates]);

  const latestUpdateLabel = useMemo(() => {
    if (!latestUpdatedCandidate) return null;
    const formatted = new Date(latestUpdatedCandidate.timestamp).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    return {
      name: latestUpdatedCandidate.candidate.fullName ?? 'Profile updated',
      formatted,
    };
  }, [latestUpdatedCandidate]);

  const hasActiveFilters = useMemo(
    () => Boolean(searchTerm || selectedStatus || availability || visaStatus || recruiterId),
    [searchTerm, selectedStatus, availability, visaStatus, recruiterId]
  );

  const clearFilters = () => {
    if (!hasActiveFilters) return;
    setSearchTerm('');
    setSelectedStatus('');
    setAvailability('');
    setVisaStatus('');
    setRecruiterId('');
    setSelectedView('');
    setPage(0);
  };

  const activeFiltersList = useMemo(() => {
    const items: Array<{ key: string; label: string; value: string; onClear: () => void }> = [];
    if (searchTerm) {
      items.push({
        key: 'search',
        label: 'Search',
        value: searchTerm,
        onClear: () => {
          setSearchTerm('');
          setPage(0);
        },
      });
    }
    if (selectedStatus) {
      items.push({
        key: 'status',
        label: 'Status',
        value: selectedStatus.replace('_', ' '),
        onClear: () => {
          setSelectedStatus('');
          setPage(0);
        },
      });
    }
    if (availability) {
      items.push({
        key: 'availability',
        label: 'Availability',
        value: availability.replace('_', ' '),
        onClear: () => {
          setAvailability('');
          setPage(0);
        },
      });
    }
    if (visaStatus) {
      items.push({
        key: 'visa',
        label: 'Visa',
        value: visaStatus,
        onClear: () => {
          setVisaStatus('');
          setPage(0);
        },
      });
    }
    if (recruiterId) {
      items.push({
        key: 'recruiter',
        label: 'Recruiter',
        value: recruiterId,
        onClear: () => {
          setRecruiterId('');
          setPage(0);
        },
      });
    }
    return items;
  }, [availability, recruiterId, searchTerm, selectedStatus, visaStatus]);

  const toggleOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(candidates.map(c => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  // legacy inline bulk actions removed; operations now handled via BulkActionBar

  // legacy inline export removed; export handled via BulkActionBar with server-side bulk export

  const toggleColumnVisibility = (id: CandidateColumnKey, checked: boolean) => {
    setVisibleColumns(prev => {
      const next = new Set<CandidateColumnKey>(prev);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  };
  const handleColumnResize = (id: ResizableCandidateColumnKey, width: number) => {
    setColumnWidths(prev => ({ ...prev, [id]: width }));
  };

  const saveCurrentView = () => {
    const name = window.prompt('Save view as name:');
    if (!name) return;
    const filters: Record<string, string> = {
      q: searchTerm,
      status: selectedStatus,
      availability,
      visaStatus,
      recruiterId,
    };
    const view = {
      name,
      filters,
      visibleColumns: Array.from(visibleColumns),
      columnWidths: normalizeColumnWidths(columnWidths),
    };
    const next = [...savedViews.filter(v => v.name !== name), view];
    setSavedViews(next);
    localStorage.setItem('candidateTable.savedViews.v1', JSON.stringify(next));
    setSelectedView(name);
  };

  const applyView = (name: string) => {
    const view = savedViews.find(v => v.name === name);
    if (!view) return;
    setSelectedView(name);
    setSearchTerm(view.filters.q || '');
    setSelectedStatus(view.filters.status || '');
    setAvailability(view.filters.availability || '');
    setVisaStatus(view.filters.visaStatus || '');
    setRecruiterId(view.filters.recruiterId || '');
  const nextColumns = new Set(view.visibleColumns.filter((col): col is CandidateColumnKey => isCandidateColumn(col)));
  nextColumns.add('availability');
  setVisibleColumns(nextColumns);
    setColumnWidths(normalizeColumnWidths(view.columnWidths));
    setPage(0);
  };

  return (
    <div className="space-y-12 px-6 pb-16 pt-8">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="relative overflow-hidden rounded-3xl border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-elevated))] shadow-[0_50px_120px_-60px_rgba(15,23,42,0.45)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(var(--app-primary-from),0.22),_rgba(var(--app-surface),0))]" />
          <div className="relative flex flex-col gap-8 p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(var(--app-primary-from),0.3)] bg-[rgba(var(--app-primary-from),0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--app-primary-from))]">
                  <Sparkles size={14} />
                  Talent workspace
                </div>
                <div className="space-y-2">
                  <h1 className="text-4xl font-semibold text-[rgb(var(--app-text-primary))]">Candidates</h1>
                  <p className="max-w-2xl text-sm text-[rgba(var(--app-text-primary),0.72)]">
                    Monitor bench strength, spotlight niche skills, and sync recruiting follow-ups without leaving this view.
                  </p>
                </div>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row lg:w-auto lg:flex-col">
                <button onClick={handleAddNew} type="button" className="btn-primary w-full justify-center gap-2">
                  <Plus size={18} />
                  New candidate
                </button>
                <button
                  onClick={() => reportService.exportCandidatesCSV()}
                  type="button"
                  className="btn-muted w-full justify-center gap-2"
                >
                  <Download size={18} />
                  Export roster
                </button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {heroMetrics.map((metric) => (
                <div key={metric.key} className="flex items-center gap-3 rounded-2xl border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted))] p-4">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${metric.accent}`}>
                    {metric.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{metric.label}</p>
                    <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">
                      {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                    </p>
                    <p className="text-xs text-muted">
                      {metric.key === 'total' && 'Active profiles across tenants'}
                      {metric.key === 'available' && 'Marked as ready for deployment'}
                      {metric.key === 'interviewing' && 'In active interview cycles'}
                      {metric.key === 'placed' && 'Closed placements this cycle'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {latestUpdateLabel && (
              <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted))] px-4 py-3 text-xs text-muted">
                <span className="font-semibold text-[rgb(var(--app-text-primary))]">Latest update</span>
                <span className="h-1 w-1 rounded-full bg-[rgba(var(--app-text-primary),0.35)]" />
                <span>{latestUpdateLabel.name}</span>
                <span className="h-1 w-1 rounded-full bg-[rgba(var(--app-text-primary),0.35)]" />
                <span>{latestUpdateLabel.formatted}</span>
              </div>
            )}
          </div>
        </div>
        <aside className="flex flex-col gap-6 rounded-3xl border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-elevated))] p-6">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">Pipeline health</h2>
            <div className="mt-4 space-y-3">
              {pipelineDistribution.map((item) => (
                <div key={item.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span className="font-medium text-[rgb(var(--app-text-primary))]">{item.label}</span>
                    <span>{item.value.toLocaleString()} · {item.percent}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(var(--app-border-subtle))]">
                    <div className={`h-full rounded-full ${item.barClass}`} style={{ width: `${Math.min(item.percent, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted))] px-4 py-3 text-xs text-muted">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 font-semibold text-[rgb(var(--app-text-primary))]">
                  <TrendingUp size={14} />
                  Average experience
                </span>
                <span className="text-sm font-semibold text-[rgb(var(--app-text-primary))]">{averageExperience.toFixed(1)} yrs</span>
              </div>
              <p className="mt-1 text-[11px]">Based on currently visible candidates.</p>
            </div>
          </div>
          <div className="space-y-3 border-t border-[rgba(var(--app-border-subtle))] pt-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">Most requested skills</h2>
            {topSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {topSkills.map(([skill, count]) => (
                  <span key={skill} className="inline-flex items-center gap-1 rounded-full border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted))] px-3 py-1 text-xs font-medium text-[rgb(var(--app-text-primary))]">
                    {skill}
                    <span className="text-[rgba(var(--app-text-secondary),0.7)]">· {count}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted">Skills will appear as soon as profiles include them.</p>
            )}
          </div>
        </aside>
      </section>

      <section className="rounded-3xl border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-elevated))] p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">Filters &amp; saved views</h2>
            <p className="text-sm text-muted">Layer recruiter filters and capture the layouts you rely on.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setShowColumnsPanel((prev) => !prev)} type="button" className="btn-muted gap-2">
              <SlidersHorizontal size={16} />
              Columns
            </button>
            <button onClick={clearFilters} type="button" disabled={!hasActiveFilters} className="btn-muted gap-2 disabled:cursor-not-allowed disabled:opacity-60">
              <RotateCcw size={16} />
              Reset filters
            </button>
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted))] px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted">
              <Filter size={14} />
              {savedViews.length} saved
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="relative md:col-span-2 xl:col-span-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
            <input
              type="text"
              placeholder="Search by keyword or comma-separated skills…"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
              className="input pl-12"
            />
          </div>
          <select value={selectedStatus} onChange={(e) => { setSelectedStatus(e.target.value); setPage(0); }} className="input">
            <option value="">All status</option>
            <option value="AVAILABLE">Available</option>
            <option value="INTERVIEWING">Interviewing</option>
            <option value="PLACED">Placed</option>
            <option value="ON_HOLD">On Hold</option>
          </select>
          <select value={availability} onChange={(e) => { setAvailability(e.target.value); setPage(0); }} className="input">
            <option value="">All availability</option>
            <option value="AVAILABLE">Available</option>
            <option value="NOT_AVAILABLE">Not Available</option>
          </select>
          <select value={visaStatus} onChange={(e) => { setVisaStatus(e.target.value); setPage(0); }} className="input">
            <option value="">All visa status</option>
            <option value="H1B">H1B</option>
            <option value="GC">GC</option>
            <option value="CITIZEN">Citizen</option>
            <option value="OPT">OPT</option>
            <option value="OTHER">Other</option>
          </select>
          <input
            type="text"
            placeholder="Recruiter ID"
            value={recruiterId}
            onChange={(e) => { setRecruiterId(e.target.value); setPage(0); }}
            className="input"
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(var(--app-border-subtle))] pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <select value={selectedView} onChange={(e) => applyView(e.target.value)} className="input py-2.5">
              <option value="">Saved views</option>
              {savedViews.map((view) => (
                <option key={view.name} value={view.name}>
                  {view.name}
                </option>
              ))}
            </select>
            <button onClick={saveCurrentView} type="button" className="btn-primary gap-2">
              <Plus size={16} />
              Save view
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK_STATUS_FILTERS.map((status) => {
            const isActive = selectedStatus === status;
            return (
              <button
                key={status}
                onClick={() => { setSelectedStatus(status); setPage(0); }}
                type="button"
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                  isActive
                    ? 'bg-[rgb(var(--app-primary-from))] text-white shadow-[0_12px_24px_-14px_rgba(17,24,39,0.7)]'
                    : 'bg-[rgba(var(--app-surface-muted))] text-muted hover:text-[rgb(var(--app-text-primary))]'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            );
          })}
          {selectedStatus && (
            <button
              onClick={() => { setSelectedStatus(''); setPage(0); }}
              type="button"
              className="rounded-full bg-[rgba(var(--app-surface-muted))] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted hover:text-[rgb(var(--app-text-primary))]"
            >
              Clear status
            </button>
          )}
        </div>
        {activeFiltersList.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeFiltersList.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.onClear}
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted))] px-3 py-1.5 text-xs text-[rgb(var(--app-text-primary))] transition hover:border-[rgba(var(--app-primary-from),0.4)]"
              >
                <span className="font-semibold uppercase tracking-[0.2em] text-muted">{chip.label}</span>
                <span>{chip.value}</span>
                <span className="text-muted">×</span>
              </button>
            ))}
            <button onClick={clearFilters} type="button" className="rounded-full bg-[rgb(var(--app-primary-from))] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Clear all
            </button>
          </div>
        )}
        {showColumnsPanel && (
          <div className="mt-6 rounded-2xl border border-dashed border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted))] p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">Display preferences</p>
            <p className="text-sm text-muted">Toggle visibility per column. Resize headers in the table to fine-tune widths.</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-[rgb(var(--app-text-primary))]">
              {ALL_CANDIDATE_COLUMNS.map((id) => (
                <label key={id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={visibleColumns.has(id)}
                    onChange={(e) => toggleColumnVisibility(id, e.target.checked)}
                  />
                  {id.charAt(0).toUpperCase() + id.slice(1)}
                </label>
              ))}
            </div>
          </div>
        )}
      </section>

      {selectedIds.size > 0 && (
        <BulkActionBar
          selectedCount={selectedIds.size}
          selectedIds={Array.from(selectedIds)}
          onClearSelection={() => setSelectedIds(new Set())}
          onActionComplete={() => {
            // Refresh will be handled automatically by the hooks
          }}
        />
      )}

      {candidatesQ.isLoading && (
        <div className="card space-y-3">
          <div className="h-4 w-40 animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
          <div className="h-4 w-full animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
        </div>
      )}

      {!candidatesQ.isLoading && candidatesQ.error && (
        <div className="rounded-3xl border border-red-400/40 bg-red-500/5 p-6 text-red-300">
          Error loading candidates: {candidatesQ.error instanceof Error ? candidatesQ.error.message : 'Unknown error'}
        </div>
      )}

      {!candidatesQ.isLoading && !candidatesQ.error && candidates.length === 0 && (
        <div className="rounded-3xl border border-dashed border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-elevated))] p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-[rgba(var(--app-border-subtle))] text-muted">
            <Users size={28} />
          </div>
          <div className="mt-4 space-y-1">
            <h3 className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">No candidates found</h3>
            <p className="mx-auto max-w-sm text-sm text-muted">Try adjusting your filters or add new talent from a recent sourcing sprint.</p>
          </div>
          <button onClick={handleAddNew} type="button" className="btn-primary mt-6 gap-2">
            <Plus size={16} />
            Add your first candidate
          </button>
        </div>
      )}

      {!candidatesQ.isLoading && !candidatesQ.error && candidates.length > 0 && (
        <>
          <CandidateTable
            candidates={candidates}
            onEdit={handleEdit}
            onDelete={handleDelete}
            selectedIds={selectedIds}
            onToggleOne={toggleOne}
            onToggleAll={toggleAll}
            visibleColumns={visibleColumns}
            columnWidths={columnWidths}
            onColumnResize={handleColumnResize}
          />
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                type="button"
                className="btn-muted px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                Previous
              </button>
              <span className="text-sm text-muted">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                type="button"
                className="btn-muted px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <CandidateModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCandidate(null);
        }}
        onSave={handleSave}
        candidate={selectedCandidate}
      />
    </div>
  );
}
