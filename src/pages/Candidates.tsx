import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Candidate } from '../types';
import CandidateTable from '../components/candidates/CandidateTable';
import CandidateModal from '../components/candidates/CandidateModal';
import { candidateService } from '../services/candidate.service';
import { useSearchParams } from 'react-router-dom';

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
  const [visibleColumns, setVisibleColumns] = useState<Set<'name' | 'contact' | 'skills' | 'experience' | 'status' | 'actions'>>(
    () => {
      const raw = localStorage.getItem('candidateTable.visibleColumns.v1');
      if (raw) {
        try {
          const arr = JSON.parse(raw) as string[];
          return new Set(arr as any);
        } catch {}
      }
      return new Set(['name','contact','skills','experience','status','actions']);
    }
  );
  const [columnWidths, setColumnWidths] = useState<Partial<Record<'name' | 'contact' | 'skills' | 'experience' | 'status' | 'actions', number>>>(() => {
    const raw = localStorage.getItem('candidateTable.columnWidths.v1');
    if (raw) {
      try { return JSON.parse(raw); } catch {}
    }
    return { name: 260, contact: 240, skills: 300, experience: 140, status: 140 };
  });
  const [showColumnsPanel, setShowColumnsPanel] = useState(false);
  const [savedViews, setSavedViews] = useState<Array<{
    name: string;
    filters: Record<string, string>;
    visibleColumns: string[];
    columnWidths: Record<string, number>;
  }>>(() => {
    const raw = localStorage.getItem('candidateTable.savedViews.v1');
    if (raw) { try { return JSON.parse(raw); } catch {} }
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
      const params: Record<string, any> = { page, size: 10 };
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

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (c: Partial<Candidate>) => candidateService.create(c),
    onMutate: async (newCandidate) => {
      await queryClient.cancelQueries({ queryKey: ['candidates'] });
      const snapshots = queryClient.getQueriesData<any>({ queryKey: ['candidates'] });

      // Optimistically insert only into page 0 queries to avoid pagination inconsistencies
      snapshots.forEach(([key, data]) => {
        const keyArr = key as unknown as any[];
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
            status: (newCandidate as any).status || 'AVAILABLE',
            availability: (newCandidate as any).availability || 'AVAILABLE',
            visaStatus: (newCandidate as any).visaStatus || 'H1B',
            primarySkills: (newCandidate as any).primarySkills || [],
            totalExperience: (newCandidate as any).totalExperience || 0,
            updatedAt: new Date().toISOString(),
          } as Candidate;
          queryClient.setQueryData(key, {
            ...data,
            content: [optimistic, ...data.content],
          });
        }
      });

      return { snapshots };
    },
    onError: (_e, _vars, ctx) => {
      ctx?.snapshots?.forEach(([key, data]: any) => {
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
      const snapshots = queryClient.getQueriesData<any>({ queryKey: ['candidates'] });
      snapshots.forEach(([key, prev]) => {
        if (prev && Array.isArray(prev.content)) {
          const updated = prev.content.map((c: Candidate) => (c.id === id ? { ...c, ...data } : c));
          queryClient.setQueryData(key, { ...prev, content: updated });
        }
      });
      return { snapshots };
    },
    onError: (_e, _vars, ctx) => {
      ctx?.snapshots?.forEach(([key, data]: any) => queryClient.setQueryData(key, data));
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
      await queryClient.cancelQueries({ queryKey: ['candidates'] });
      const snapshots = queryClient.getQueriesData<any>({ queryKey: ['candidates'] });
      snapshots.forEach(([key, prev]) => {
        if (prev && Array.isArray(prev.content)) {
          const filtered = prev.content.filter((c: Candidate) => c.id !== id);
          queryClient.setQueryData(key, { ...prev, content: filtered });
        }
      });
      return { snapshots };
    },
    onError: (_e, _vars, ctx) => {
      ctx?.snapshots?.forEach(([key, data]: any) => queryClient.setQueryData(key, data));
      toast.error('Failed to delete candidate');
    },
    onSuccess: () => {
      toast.success('Candidate deleted successfully!');
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

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    setSelectedCandidate(null);
    setIsModalOpen(true);
  };

  const candidates = data?.content || [];
  const totalPages = data?.totalPages || 0;

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
    await Promise.all(ids.map(id => new Promise<void>((resolve) => {
      // Use mutate to trigger optimistic behavior but wrap in a Promise
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      deleteMutation.mutate(id, { onSettled: () => resolve() });
    })));
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

  const toggleColumnVisibility = (id: 'name' | 'contact' | 'skills' | 'experience' | 'status' | 'actions', checked: boolean) => {
    setVisibleColumns(prev => {
      const next = new Set(prev);
      if (checked) next.add(id); else next.delete(id);
      return next as any;
    });
  };
  const handleColumnResize = (id: 'name' | 'contact' | 'skills' | 'experience' | 'status', width: number) => {
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
      columnWidths: columnWidths as Record<string, number>,
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
    setVisibleColumns(new Set(view.visibleColumns as any));
    setColumnWidths(view.columnWidths as any);
    setPage(0);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Candidates</h1>
          <p className="text-dark-600 mt-1">Manage your candidate database</p>
        </div>
        <button onClick={handleAddNew} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Add Candidate
        </button>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={20} />
            <input
              type="text"
              placeholder="Search by any field or skills (comma/semicolon/pipe for skills)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-dark-50 border border-dark-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="py-3 px-4 bg-dark-50 border border-dark-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="INTERVIEWING">Interviewing</option>
            <option value="PLACED">Placed</option>
            <option value="ON_HOLD">On Hold</option>
          </select>
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="py-3 px-4 bg-dark-50 border border-dark-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Availability</option>
            <option value="AVAILABLE">Available</option>
            <option value="NOT_AVAILABLE">Not Available</option>
          </select>
          <select
            value={visaStatus}
            onChange={(e) => setVisaStatus(e.target.value)}
            className="py-3 px-4 bg-dark-50 border border-dark-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Visa Status</option>
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
            onChange={(e) => setRecruiterId(e.target.value)}
            className="py-3 px-4 bg-dark-50 border border-dark-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[120px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowColumnsPanel(v => !v)} className="py-3 px-4 bg-dark-50 border border-dark-200 rounded-lg">Columns</button>
          <select value={selectedView} onChange={(e) => applyView(e.target.value)} className="py-3 px-4 bg-dark-50 border border-dark-200 rounded-lg">
            <option value="">Saved Views</option>
            {savedViews.map(v => (
              <option key={v.name} value={v.name}>{v.name}</option>
            ))}
          </select>
          <button onClick={saveCurrentView} className="py-3 px-4 bg-dark-50 border border-dark-200 rounded-lg">Save View</button>
        </div>
      </div>
      {showColumnsPanel && (
        <div className="card -mt-3">
          <div className="flex flex-wrap gap-4 text-sm">
            {(['name','contact','skills','experience','status','actions'] as const).map(id => (
              <label key={id} className="flex items-center gap-2">
                <input type="checkbox" checked={visibleColumns.has(id)} onChange={(e) => toggleColumnVisibility(id, e.target.checked)} />
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </label>
            ))}
            <div className="text-dark-600">Drag the tiny handle on header to resize columns.</div>
          </div>
        </div>
      )}

      {/* Quick filter chips */}
      <div className="flex flex-wrap gap-2">
        {['AVAILABLE','INTERVIEWING','PLACED','ON_HOLD'].map(s => (
          <button
            key={s}
            onClick={() => { setSelectedStatus(s); setPage(0); }}
            className={`px-3 py-1 rounded-full border text-xs ${selectedStatus === s ? 'bg-primary-500/20 text-primary-400 border-primary-500/30' : 'bg-dark-100 text-dark-600 border-dark-200'}`}
          >
            {s.replace('_',' ')}
          </button>
        ))}
        {selectedStatus && (
          <button onClick={() => setSelectedStatus('')} className="px-3 py-1 rounded-full border text-xs bg-dark-100 text-dark-600 border-dark-200">Clear</button>
        )}
      </div>

      {isLoading ? (
        <div className="card">
          <p className="text-center py-12">Loading candidates...</p>
        </div>
      ) : error ? (
        <div className="card">
          <p className="text-center py-12 text-red-500">
            Error loading candidates: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      ) : (
        <>
          {selectedIds.size > 0 && (
            <div className="card flex items-center justify-between mb-2">
              <div className="text-sm text-dark-600">{selectedIds.size} selected</div>
              <div className="flex gap-2">
                <button onClick={exportCSV} className="px-3 py-2 bg-dark-100 hover:bg-dark-200 rounded">Export CSV</button>
                <button onClick={bulkDelete} className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded">Delete Selected</button>
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
                className="px-4 py-2 bg-dark-100 hover:bg-dark-200 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 bg-dark-100 hover:bg-dark-200 rounded-lg disabled:opacity-50"
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
