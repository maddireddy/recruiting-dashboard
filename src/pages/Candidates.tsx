import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Download, SlidersHorizontal, RotateCcw, Users, UserCheck, UserCog, Briefcase } from 'lucide-react';
import { reportService } from '../services/report.service';
import toast from 'react-hot-toast';
import type { Candidate } from '../types';
import CandidateTable from '../components/candidates/CandidateTable';
import CandidateModal from '../components/candidates/CandidateModal';
import { candidateService } from '../services/candidate.service';
import { useSearchParams } from 'react-router-dom';
import StatsCard from '../components/dashboard/StatsCard';

type CandidateColumnKey = 'name' | 'contact' | 'skills' | 'experience' | 'status' | 'actions';
type ResizableCandidateColumnKey = Exclude<CandidateColumnKey, 'actions'>;
type CandidateColumnWidths = Partial<Record<ResizableCandidateColumnKey, number>>;
type CandidateQueryResult = { content: Candidate[]; totalElements?: number; totalPages?: number };
type CandidateSavedView = {
  name: string;
  filters: Record<string, string>;
  visibleColumns: CandidateColumnKey[];
  columnWidths: CandidateColumnWidths;
};
type CandidateQuerySnapshots = Array<[readonly unknown[], CandidateQueryResult | undefined]>;

const ALL_CANDIDATE_COLUMNS: CandidateColumnKey[] = ['name', 'contact', 'skills', 'experience', 'status', 'actions'];
const RESIZABLE_CANDIDATE_COLUMNS: ResizableCandidateColumnKey[] = ['name', 'contact', 'skills', 'experience', 'status'];
const isCandidateColumn = (value: string): value is CandidateColumnKey =>
  ALL_CANDIDATE_COLUMNS.includes(value as CandidateColumnKey);
const QUICK_STATUS_FILTERS = ['AVAILABLE', 'INTERVIEWING', 'PLACED', 'ON_HOLD'] as const;

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
  const queryClient = useQueryClient();
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
  const [visibleColumns, setVisibleColumns] = useState<Set<CandidateColumnKey>>(
    () => {
      const raw = localStorage.getItem('candidateTable.visibleColumns.v1');
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as unknown;
          const columns = Array.isArray(parsed)
            ? parsed.filter((col): col is CandidateColumnKey => typeof col === 'string' && isCandidateColumn(col))
            : ALL_CANDIDATE_COLUMNS;
          return new Set(columns);
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
    return { name: 260, contact: 240, skills: 300, experience: 140, status: 140 };
  });
  const [showColumnsPanel, setShowColumnsPanel] = useState(false);
  const [savedViews, setSavedViews] = useState<CandidateSavedView[]>(() => {
    const raw = localStorage.getItem('candidateTable.savedViews.v1');
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as CandidateSavedView[];
        return parsed.map((view) => ({
          ...view,
          visibleColumns: view.visibleColumns.filter((col): col is CandidateColumnKey => isCandidateColumn(col)),
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

  // Fetch candidates
  const { data, isLoading, error } = useQuery({
    queryKey: ['candidates', page, searchTerm, selectedStatus, availability, visaStatus, recruiterId],
    queryFn: async () => {
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
        return candidateService.getAll(page, 10).then(r => r.data);
      }
      return candidateService.search(params).then(r => r.data);
    },
  });

  // Reset selection when data set changes (page/filters)
  useEffect(() => {
    setSelectedIds(new Set());
  }, [page, searchTerm, selectedStatus, availability, visaStatus, recruiterId]);

  // Debug: log candidate list whenever query data changes
  useEffect(() => {
    console.debug('[Candidates.tsx] candidate list', data?.content);
  }, [data]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (c: Partial<Candidate>) => candidateService.create(c),
    onMutate: async (newCandidate) => {
      await queryClient.cancelQueries({ queryKey: ['candidates'] });
      const snapshots = queryClient.getQueriesData<CandidateQueryResult>({ queryKey: ['candidates'] });

      // Optimistically insert only into page 0 queries to avoid pagination inconsistencies
      snapshots.forEach(([key, data]) => {
        const keyArr = Array.isArray(key) ? key : [];
        const keyPage = keyArr?.[1];
        if (data && typeof data === 'object' && keyPage === 0 && Array.isArray(data.content)) {
          const tempId = `optimistic-${Date.now()}`;
          const optimistic: Candidate = {
            id: tempId,
            fullName: `${newCandidate.firstName || ''} ${newCandidate.lastName || ''}`.trim() || (newCandidate.email || 'New Candidate'),
            firstName: newCandidate.firstName || '',
            lastName: newCandidate.lastName || '',
            email: newCandidate.email || '',
            phone: newCandidate.phone || '',
            status: (newCandidate as Candidate).status || 'AVAILABLE',
            availability: (newCandidate as Candidate).availability || 'AVAILABLE',
            visaStatus: (newCandidate as Candidate).visaStatus || 'H1B',
            primarySkills: (newCandidate as Candidate).primarySkills || [],
            totalExperience: (newCandidate as Candidate).totalExperience || 0,
            updatedAt: new Date().toISOString(),
          } as Candidate;
          queryClient.setQueryData(key, {
            ...data,
            content: [optimistic, ...data.content],
          });
        }
      });

      return { snapshots: snapshots as CandidateQuerySnapshots };
    },
    onError: (_e, _vars, ctx) => {
      const snapshots = (ctx as { snapshots?: CandidateQuerySnapshots } | undefined)?.snapshots;
      snapshots?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      toast.error('Failed to add candidate');
    },
    onSuccess: () => {
      toast.success('Candidate added successfully!');
    },
    onSettled: () => {
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Candidate> }) =>
      candidateService.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['candidates'] });
      const snapshots = queryClient.getQueriesData<CandidateQueryResult>({ queryKey: ['candidates'] });
      snapshots.forEach(([key, prev]) => {
        if (prev && Array.isArray(prev.content)) {
          const updated = prev.content.map((c: Candidate) => (c.id === id ? { ...c, ...data } : c));
          queryClient.setQueryData(key, { ...prev, content: updated });
        }
      });
      return {
        snapshots: snapshots as CandidateQuerySnapshots,
      };
    },
    onError: (_e, _vars, ctx) => {
      const snapshots = (ctx as { snapshots?: CandidateQuerySnapshots } | undefined)?.snapshots;
      snapshots?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      toast.error('Failed to update candidate');
    },
    onSuccess: () => {
      toast.success('Candidate updated successfully!');
    },
    onSettled: () => {
      setIsModalOpen(false);
      setSelectedCandidate(null);
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: candidateService.delete,
    onMutate: async (id: string) => {
      setSelectedIds(prev => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      await queryClient.cancelQueries({ queryKey: ['candidates'] });
      const snapshots = queryClient.getQueriesData<CandidateQueryResult>({ queryKey: ['candidates'] });
      snapshots.forEach(([key, prev]) => {
        if (prev && Array.isArray(prev.content)) {
          const filtered = prev.content.filter((c: Candidate) => c.id !== id);
          queryClient.setQueryData(key, { ...prev, content: filtered });
        }
      });
      return {
        snapshots: snapshots as CandidateQuerySnapshots,
      };
    },
    onError: (_e, _vars, ctx) => {
      const snapshots = (ctx as { snapshots?: CandidateQuerySnapshots } | undefined)?.snapshots;
      snapshots?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      toast.error('Failed to delete candidate');
    },
    onSuccess: () => {
      toast.success('Candidate deleted successfully!');
    },
    onSettled: (_result, _error, id) => {
      if (id) {
        queryClient.invalidateQueries({ queryKey: ['candidate', id] });
      }
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });

  const handleSave = (data: Partial<Candidate>) => {
    if (selectedCandidate) {
      updateMutation.mutate({ id: selectedCandidate.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    setSelectedCandidate(null);
    setIsModalOpen(true);
  };

  const candidates = useMemo(() => data?.content ?? [], [data?.content]);
  const totalPages = data?.totalPages || 0;
  const totalCandidates = data?.totalElements ?? candidates.length;

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

  const summaryCards = useMemo(
    () => [
      {
        title: 'Total Candidates',
        value: totalCandidates,
        icon: <Users size={18} className="text-primary-400" />,
        accentClassName: 'hover:border-[rgba(var(--app-primary-from),0.45)] transition-colors',
      },
      {
        title: 'Available Now',
        value: statusBreakdown.available,
        icon: <UserCheck size={18} className="text-green-400" />,
        accentClassName: 'hover:border-emerald-400/40 transition-colors',
      },
      {
        title: 'Interviewing',
        value: statusBreakdown.interviewing,
        icon: <UserCog size={18} className="text-yellow-400" />,
        accentClassName: 'hover:border-amber-400/40 transition-colors',
      },
      {
        title: 'Placed',
        value: statusBreakdown.placed,
        icon: <Briefcase size={18} className="text-blue-400" />,
        accentClassName: 'hover:border-sky-400/40 transition-colors',
      },
    ],
    [statusBreakdown, totalCandidates]
  );

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

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} selected candidate(s)?`)) return;
    const ids = Array.from(selectedIds);
    // Fire individual mutations (each does optimistic update + rollback)
    await Promise.all(
      ids.map((id) => deleteMutation.mutateAsync(id).catch(() => undefined))
    );
    setSelectedIds(new Set());
  };

  const exportCSV = () => {
    if (selectedIds.size === 0) return;
    const map = new Map(candidates.map(c => [c.id, c] as const));
    const selected = Array.from(selectedIds).map(id => map.get(id)).filter(Boolean) as Candidate[];
    const headers = ['Full Name','Email','Phone','Skills','Experience','Status','Visa'];
    const rows = selected.map(c => [
      c.fullName,
      c.email,
      c.phone,
      (c.primarySkills || []).join('; '),
      String(c.totalExperience ?? ''),
      c.status,
      c.visaStatus,
    ]);
    const csv = [headers, ...rows].map(r => r.map(field => {
      const s = String(field ?? '');
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s;
    }).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidates-${selected.length}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
    const nextColumns = view.visibleColumns.filter((col): col is CandidateColumnKey => isCandidateColumn(col));
    setVisibleColumns(new Set(nextColumns));
    setColumnWidths(normalizeColumnWidths(view.columnWidths));
    setPage(0);
  };

  return (
    <div className="space-y-10 px-6 py-8">
      <header className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(var(--app-border-subtle))] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            <Users size={14} />
            Talent Network
          </div>
          <h1 className="text-3xl font-semibold text-[rgb(var(--app-text-primary))]">Candidates</h1>
          <p className="max-w-2xl text-sm text-muted">
            Monitor talent availability, collaborate with recruiters, and keep every candidate interaction polished.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleAddNew} type="button" className="btn-primary">
            <Plus size={18} />
            New candidate
          </button>
          <button
            onClick={() => reportService.exportCandidatesCSV()}
            type="button"
            className="btn-muted"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <StatsCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            accentClassName={card.accentClassName}
          />
        ))}
      </section>

      <section className="card space-y-6">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="relative md:col-span-2 xl:col-span-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
            <input
              type="text"
              placeholder="Search by any field or skills (comma/semicolon/pipe for skills)..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
              className="input pl-11"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setPage(0); }}
            className="input"
          >
            <option value="">All status</option>
            <option value="AVAILABLE">Available</option>
            <option value="INTERVIEWING">Interviewing</option>
            <option value="PLACED">Placed</option>
            <option value="ON_HOLD">On Hold</option>
          </select>
          <select
            value={availability}
            onChange={(e) => { setAvailability(e.target.value); setPage(0); }}
            className="input"
          >
            <option value="">All availability</option>
            <option value="AVAILABLE">Available</option>
            <option value="NOT_AVAILABLE">Not Available</option>
          </select>
          <select
            value={visaStatus}
            onChange={(e) => { setVisaStatus(e.target.value); setPage(0); }}
            className="input"
          >
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

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(var(--app-border-subtle))] pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowColumnsPanel((prev) => !prev)}
              type="button"
              className="btn-muted"
            >
              <SlidersHorizontal size={16} />
              Columns
            </button>
            <button
              onClick={clearFilters}
              type="button"
              disabled={!hasActiveFilters}
              className="btn-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RotateCcw size={16} />
              Reset filters
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedView}
              onChange={(e) => applyView(e.target.value)}
              className="input py-2.5"
            >
              <option value="">Saved views</option>
              {savedViews.map((view) => (
                <option key={view.name} value={view.name}>
                  {view.name}
                </option>
              ))}
            </select>
            <button
              onClick={saveCurrentView}
              type="button"
              className="btn-primary"
            >
              Save view
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {QUICK_STATUS_FILTERS.map((status) => (
            <button
              key={status}
              onClick={() => { setSelectedStatus(status); setPage(0); }}
              type="button"
              className={`chip ${selectedStatus === status ? 'chip-active' : ''}`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
          {selectedStatus && (
            <button
              onClick={() => {
                setSelectedStatus('');
                setPage(0);
              }}
              type="button"
              className="chip"
            >
              Clear
            </button>
          )}
        </div>

        {showColumnsPanel && (
          <div className="rounded-2xl border border-dashed border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">Display preferences</p>
            <p className="text-sm text-muted">Choose which columns appear in the table. Drag the resize handle in the header to adjust widths.</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-[rgb(var(--app-text-primary))]">
              {(['name', 'contact', 'skills', 'experience', 'status', 'actions'] as const).map((id) => (
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

      {isLoading && (
        <div className="card space-y-3">
          <div className="h-4 w-40 animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
          <div className="h-4 w-full animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
        </div>
      )}

      {!isLoading && error && (
        <div className="card border-red-400/40 bg-red-500/5 text-red-300">
          Error loading candidates: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      )}

      {!isLoading && !error && candidates.length === 0 && (
        <div className="card flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-[rgba(var(--app-border-subtle))] text-muted">
            <Users size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">No candidates found</h3>
            <p className="max-w-sm text-sm text-muted">Try adjusting your filters or import fresh talent from a recent campaign.</p>
          </div>
          <button onClick={handleAddNew} type="button" className="btn-primary">
            <Plus size={16} />
            Add your first candidate
          </button>
        </div>
      )}

      {!isLoading && !error && candidates.length > 0 && (
        <>
          {selectedIds.size > 0 && (
            <div className="card mb-2 flex flex-wrap items-center justify-between gap-3 border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))]">
              <div className="flex items-center gap-2 text-sm text-muted">
                <span className="chip surface-muted text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--app-text-primary))]">Bulk edit</span>
                <span>{selectedIds.size} selected</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={exportCSV} type="button" className="btn-muted px-3 py-2 text-sm">
                  <Download size={16} />
                  Export CSV
                </button>
                <button
                  onClick={bulkDelete}
                  type="button"
                  className="btn-muted px-3 py-2 text-sm text-red-400 hover:border-red-400 hover:text-red-300"
                >
                  Delete selected
                </button>
              </div>
            </div>
          )}
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

// (export button integrated into header above)
