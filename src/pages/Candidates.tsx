import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Download, SlidersHorizontal, RotateCcw, Users, Rocket, CalendarClock, Briefcase, Sparkles, Filter, TrendingUp } from 'lucide-react';
import { reportService } from '../services/report.service';
import toast from 'react-hot-toast';
import type { Candidate } from '../types';
import CandidateTable from '../components/candidates/CandidateTable';
import CandidateModal from '../components/candidates/CandidateModal';
import { candidateService } from '../services/candidate.service';
import { useSearchParams } from 'react-router-dom';

type CandidateColumnKey = 'name' | 'contact' | 'skills' | 'experience' | 'availability' | 'status' | 'actions';
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
    onError: (error, vars, ctx) => {
      const snapshots = (ctx as { snapshots?: CandidateQuerySnapshots } | undefined)?.snapshots;
      snapshots?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      if (import.meta.env.DEV) {
        console.debug('[Candidates] update failed', { error, vars });
      }
      const message = error instanceof Error ? error.message : '';
      toast.error(message ? `Failed to update candidate: ${message}` : 'Failed to update candidate');
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
    mutationFn: async (id: string) => candidateService.delete(id),
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
      // success handled via toast.promise in caller
    },
    onSettled: (_result, _error, id) => {
      if (id) {
        queryClient.invalidateQueries({ queryKey: ['candidate', id] });
      }
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const result = await candidateService.deleteMany(ids);
      if (result.successes.length === 0) {
        const error = new Error('All deletions failed');
        Object.assign(error, { failures: result.failures });
        throw error;
      }
      return result;
    },
    onMutate: async (ids: string[]) => {
      if (!ids.length) return;
      const idSet = new Set(ids);
      setSelectedIds(prev => {
        if (prev.size === 0) return prev;
        const next = new Set(prev);
        ids.forEach(id => next.delete(id));
        return next;
      });
      await queryClient.cancelQueries({ queryKey: ['candidates'] });
      const snapshots = queryClient.getQueriesData<CandidateQueryResult>({ queryKey: ['candidates'] });
      snapshots.forEach(([key, prev]) => {
        if (prev && Array.isArray(prev.content)) {
          const filtered = prev.content.filter((candidate: Candidate) => !idSet.has(candidate.id));
          queryClient.setQueryData(key, { ...prev, content: filtered });
        }
      });
      return { snapshots: snapshots as CandidateQuerySnapshots };
    },
    onError: (_error, ids, ctx) => {
      const snapshots = (ctx as { snapshots?: CandidateQuerySnapshots } | undefined)?.snapshots;
      snapshots?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      setSelectedIds(prev => {
        const next = new Set(prev);
        ids.forEach(id => next.add(id));
        return next;
      });
    },
    onSettled: () => {
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

  const handleDelete = async (id: string) => {
    const target = candidates.find((c) => c.id === id);
    const label = target?.fullName || 'this candidate';
    if (!window.confirm(`Delete ${label}? This action cannot be undone.`)) return;
    await toast.promise(
      deleteMutation.mutateAsync(id),
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

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} selected candidate${selectedIds.size > 1 ? 's' : ''}? This cannot be undone.`)) return;
    const ids = Array.from(selectedIds);
    const result = await toast.promise<{ successes: string[]; failures: Array<{ id: string; reason: unknown }> }>(
      bulkDeleteMutation.mutateAsync(ids),
      {
        loading: `Deleting ${ids.length} candidate${ids.length > 1 ? 's' : ''}…`,
        success: ({ successes, failures }) => {
          if (failures.length > 0) {
            return `${successes.length} deleted, ${failures.length} failed`;
          }
          return `${successes.length} candidate${successes.length === 1 ? '' : 's'} removed`;
        },
        error: 'Failed to delete selected candidates.',
      }
    );
    setSelectedIds(new Set(result.failures.map(({ id }) => id)));
  };

  const exportCSV = () => {
    if (selectedIds.size === 0) return;
    const map = new Map(candidates.map(c => [c.id, c] as const));
    const selected = Array.from(selectedIds).map(id => map.get(id)).filter(Boolean) as Candidate[];
    const headers = ['Full Name','Email','Phone','Skills','Experience','Status','Availability','Visa'];
    const rows = selected.map(c => [
      c.fullName,
      c.email,
      c.phone,
      (c.primarySkills || []).join('; '),
      String(c.totalExperience ?? ''),
      c.status,
      c.availability,
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
        <div className="rounded-3xl border border-[rgba(var(--app-primary-from),0.3)] bg-[rgba(var(--app-primary-from),0.08)] px-5 py-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-[rgb(var(--app-text-primary))]">
              <span className="rounded-full bg-[rgb(var(--app-primary-from))] px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                {selectedIds.size} selected
              </span>
              <span className="text-muted">Bulk actions</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={exportCSV} type="button" className="btn-muted gap-2 px-3 py-2 text-sm">
                <Download size={16} />
                Export CSV
              </button>
              <button onClick={bulkDelete} type="button" className="btn-muted gap-2 px-3 py-2 text-sm text-red-400 hover:border-red-400 hover:text-red-300">
                Delete selected
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="card space-y-3">
          <div className="h-4 w-40 animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
          <div className="h-4 w-full animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-3xl border border-red-400/40 bg-red-500/5 p-6 text-red-300">
          Error loading candidates: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      )}

      {!isLoading && !error && candidates.length === 0 && (
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

      {!isLoading && !error && candidates.length > 0 && (
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

// (export button integrated into header above)
