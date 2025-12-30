import { useMemo, useState } from 'react';
import { Award, Plus, Search, Filter, ChevronDown, ChevronUp, Trash2, Edit, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { SilverMedalist } from '../types/silverMedalist';
import { listSilverMedalists, createSilverMedalist, updateSilverMedalist, deleteSilverMedalist, reengageSilverMedalist } from '../services/silverMedalist.service';
import { useList, useCreate, useUpdate, useDelete } from '../services/hooks';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/LoadingStates';
import Field from '../components/ui/Field';

type SortField = 'candidateName' | 'jobTitle' | 'status' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export default function SilverMedalists() {
  const tenantId = useMemo(() => localStorage.getItem('tenantId') || undefined, []);
  const [selected, setSelected] = useState<SilverMedalist | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const { data, isLoading, error, refetch } = useList<SilverMedalist[]>('silverMedalists', () => listSilverMedalists(tenantId), tenantId);
  const createM = useCreate('silverMedalists', (payload: Partial<SilverMedalist>) => createSilverMedalist(payload as any, tenantId), tenantId);
  const updateM = useUpdate('silverMedalists', (id: string, payload: Partial<SilverMedalist>) => updateSilverMedalist({ id, ...payload }, tenantId), tenantId);
  const deleteM = useDelete('silverMedalists', (id: string) => deleteSilverMedalist(id, tenantId), tenantId);

  const items = useMemo(() => data || [], [data]);

  // Extract unique statuses
  const allStatuses = useMemo(() => {
    const statuses = new Set<string>();
    items.forEach(item => {
      if (item.status) statuses.add(item.status);
    });
    return Array.from(statuses).sort();
  }, [items]);

  // Filter and sort
  const filteredItems = useMemo(() => {
    let filtered = items;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.candidateName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus) {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'candidateName') {
        comparison = (a.candidateName || a.candidateId || '').localeCompare(b.candidateName || b.candidateId || '');
      } else if (sortField === 'jobTitle') {
        comparison = (a.jobTitle || a.jobId || '').localeCompare(b.jobTitle || b.jobId || '');
      } else if (sortField === 'status') {
        comparison = (a.status || '').localeCompare(b.status || '');
      } else if (sortField === 'createdAt') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        comparison = dateA - dateB;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [items, searchQuery, filterStatus, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSave = async (payload: Partial<SilverMedalist>) => {
    try {
      if (selected) {
        await updateM.mutateAsync({ id: selected.id, data: payload });
        toast.success('Silver medalist updated');
      } else {
        await createM.mutateAsync(payload);
        toast.success('Silver medalist created');
      }
      setShowModal(false);
      setSelected(null);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this silver medalist?')) return;
    try {
      await deleteM.mutateAsync(id);
      toast.success('Silver medalist deleted');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} silver medalist(s)?`)) return;
    try {
      await Promise.all(Array.from(selectedIds).map(id => deleteM.mutateAsync(id)));
      toast.success(`Deleted ${selectedIds.size} silver medalist(s)`);
      setSelectedIds(new Set());
    } catch (e: any) {
      toast.error('Failed to delete some silver medalists');
    }
  };

  const handleReengage = async (item: SilverMedalist) => {
    try {
      await reengageSilverMedalist(item.id, tenantId);
      toast.success('Re-engagement triggered for ' + (item.candidateName || item.candidateId));
      refetch();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to re-engage');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map(item => item.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'contacted':
        return 'bg-[rgba(var(--app-primary),0.15)] text-[rgb(var(--app-primary))]';
      case 'reengaged':
        return 'bg-[rgba(var(--app-success),0.15)] text-[rgb(var(--app-success))]';
      case 'archived':
        return 'bg-[rgba(var(--app-border-subtle),0.5)] text-muted';
      case 'pending':
      default:
        return 'bg-[rgba(var(--app-warning),0.15)] text-[rgb(var(--app-warning))]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted">
        <span>Dashboard</span>
        <span>/</span>
        <span className="text-[rgb(var(--app-text-primary))]">Silver Medalists</span>
      </nav>

      {/* Page Header */}
      <PageHeader
        title="Silver Medalists"
        subtitle="Track runner-up candidates for future opportunities and re-engagement"
        actions={
          <Button variant="primary" size="md" onClick={() => { setSelected(null); setShowModal(true); }}>
            <Plus size={16} />
            <span className="ml-2">New Silver Medalist</span>
          </Button>
        }
      />

      {/* Search & Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              type="text"
              placeholder="Search by candidate, job, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full pl-10"
            />
          </div>

          <div className="sm:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input w-full pl-10 appearance-none"
              >
                <option value="">All Statuses</option>
                {allStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          {(searchQuery || filterStatus) && (
            <Button variant="ghost" size="md" onClick={() => { setSearchQuery(''); setFilterStatus(''); }}>
              Clear Filters
            </Button>
          )}
        </div>

        {selectedIds.size > 0 && (
          <div className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-[rgba(var(--app-primary),0.1)] border border-[rgba(var(--app-primary),0.3)]">
            <span className="text-sm font-medium text-[rgb(var(--app-text-primary))]">
              {selectedIds.size} selected
            </span>
            <Button variant="ghost" size="sm" onClick={handleBulkDelete}>
              <Trash2 size={14} />
              <span className="ml-1">Delete</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
              Deselect All
            </Button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && <TableSkeleton rows={8} columns={5} />}

      {/* Error State */}
      {error && (
        <div className="card text-center py-8">
          <p className="text-[rgb(var(--app-error))]">Failed to load silver medalists</p>
          <Button className="mt-4" variant="subtle" onClick={() => refetch()}>Try Again</Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredItems.length === 0 && items.length === 0 && (
        <EmptyState
          icon={<Award size={48} />}
          title="No silver medalists yet"
          description="Track runner-up candidates who narrowly missed an offer. Re-engage them for future opportunities and maintain your talent pipeline."
          action={
            <Button variant="primary" onClick={() => { setSelected(null); setShowModal(true); }}>
              <Plus size={16} className="mr-2" />
              Add Silver Medalist
            </Button>
          }
        />
      )}

      {/* No Search Results */}
      {!isLoading && !error && filteredItems.length === 0 && items.length > 0 && (
        <EmptyState
          icon={<Search size={48} />}
          title="No silver medalists found"
          description={`No silver medalists match "${searchQuery}"${filterStatus ? ` with status ${filterStatus}` : ''}`}
          action={
            <Button variant="subtle" onClick={() => { setSearchQuery(''); setFilterStatus(''); }}>
              Clear Filters
            </Button>
          }
        />
      )}

      {/* Table */}
      {!isLoading && !error && filteredItems.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[rgb(var(--app-surface-muted))] text-left text-xs font-semibold uppercase tracking-wider text-muted border-b border-[rgba(var(--app-border-subtle))]">
                <tr>
                  <th className="px-4 py-3 w-12">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredItems.length && filteredItems.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-[rgba(var(--app-border-subtle))]"
                    />
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:text-[rgb(var(--app-text-primary))]" onClick={() => handleSort('candidateName')}>
                    <div className="flex items-center gap-2">
                      Candidate
                      {sortField === 'candidateName' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:text-[rgb(var(--app-text-primary))]" onClick={() => handleSort('jobTitle')}>
                    <div className="flex items-center gap-2">
                      Job
                      {sortField === 'jobTitle' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:text-[rgb(var(--app-text-primary))]" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-2">
                      Status
                      {sortField === 'status' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                  <th className="px-4 py-3">Notes</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(var(--app-border-subtle))]">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[rgba(var(--app-surface-muted),0.4)] transition">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="rounded border-[rgba(var(--app-border-subtle))]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Award size={16} className="text-[rgb(var(--app-primary))]" />
                        <span className="font-medium text-[rgb(var(--app-text-primary))]">
                          {item.candidateName || item.candidateId}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted">{item.jobTitle || item.jobId || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`chip capitalize ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted truncate max-w-xs block">
                        {item.notes || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReengage(item)}
                          className="p-2 rounded-lg hover:bg-[rgba(var(--app-success),0.1)] text-[rgb(var(--app-success))] transition"
                          title="Re-engage"
                        >
                          <UserPlus size={16} />
                        </button>
                        <button
                          onClick={() => { setSelected(item); setShowModal(true); }}
                          className="p-2 rounded-lg hover:bg-[rgba(var(--app-primary),0.1)] text-[rgb(var(--app-primary))] transition"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 rounded-lg hover:bg-[rgba(var(--app-error),0.1)] text-[rgb(var(--app-error))] transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-[rgba(var(--app-border-subtle))] text-sm text-muted">
            Showing {filteredItems.length} of {items.length} silver medalist(s)
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && <EditModal selected={selected} onClose={() => { setShowModal(false); setSelected(null); }} onSave={handleSave} saving={createM.isPending || updateM.isPending} />}
    </div>
  );
}

function EditModal({ selected, onClose, onSave, saving }: {
  selected: SilverMedalist | null;
  onClose: () => void;
  onSave: (payload: Partial<SilverMedalist>) => void | Promise<void>;
  saving?: boolean;
}) {
  const [candidateId, setCandidateId] = useState(selected?.candidateId || '');
  const [jobId, setJobId] = useState(selected?.jobId || '');
  const [status, setStatus] = useState<SilverMedalist['status']>(selected?.status || 'pending');
  const [notes, setNotes] = useState(selected?.notes || '');
  const [errors, setErrors] = useState<{ candidateId?: string; jobId?: string }>({});

  const validate = () => {
    const newErrors: { candidateId?: string; jobId?: string } = {};
    if (!candidateId.trim()) newErrors.candidateId = 'Candidate ID is required';
    if (!jobId.trim()) newErrors.jobId = 'Job ID is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({ candidateId: candidateId.trim(), jobId: jobId.trim(), status, notes: notes.trim() });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-lg">
        <div className="pb-4 border-b border-[rgba(var(--app-border-subtle))]">
          <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">
            {selected ? 'Edit Silver Medalist' : 'New Silver Medalist'}
          </h2>
          <p className="text-sm text-muted mt-1">
            Track runner-up candidates for future re-engagement
          </p>
        </div>

        <div className="py-6 space-y-5">
          <Field label="Candidate ID" htmlFor="candidateId" error={errors.candidateId} required>
            <input
              id="candidateId"
              type="text"
              value={candidateId}
              onChange={(e) => setCandidateId(e.target.value)}
              className="input"
              placeholder="e.g., CAND-12345"
            />
          </Field>

          <Field label="Job ID" htmlFor="jobId" error={errors.jobId} required>
            <input
              id="jobId"
              type="text"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="input"
              placeholder="e.g., JOB-67890"
            />
          </Field>

          <Field label="Status" htmlFor="status">
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as SilverMedalist['status'])}
              className="input"
            >
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="reengaged">Reengaged</option>
              <option value="archived">Archived</option>
            </select>
          </Field>

          <Field label="Notes" htmlFor="notes">
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input"
              placeholder="Add notes about this candidate..."
              rows={4}
            />
          </Field>
        </div>

        <div className="pt-4 border-t border-[rgba(var(--app-border-subtle))] flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
