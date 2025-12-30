import { useMemo, useState } from 'react';
import { FileText, Plus, Search, Filter, ChevronDown, ChevronUp, Trash2, Edit, UserCheck } from 'lucide-react';
import { useList, useCreate, useUpdate, useDelete } from '../services/hooks';
import { vendorSubmittalService } from '../services/vendorSubmittal.service';
import type { VendorSubmittal } from '../types/vendorSubmittal';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/LoadingStates';
import { toast } from 'react-hot-toast';
import Field from '../components/ui/Field';

type SortField = 'vendorName' | 'candidateName' | 'rate' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export default function VendorSubmittals() {
  const tenantId = useMemo(() => localStorage.getItem('tenantId') || undefined, []);
  const [selected, setSelected] = useState<VendorSubmittal | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const submittalsQ = useList<VendorSubmittal[]>('vendorSubmittals', () => vendorSubmittalService.list(tenantId), tenantId);
  const createM = useCreate<Partial<VendorSubmittal>, VendorSubmittal>('vendorSubmittals', (payload) => vendorSubmittalService.create(payload, tenantId), tenantId);
  const updateM = useUpdate<Partial<VendorSubmittal>, VendorSubmittal>('vendorSubmittals', (id, payload) => vendorSubmittalService.update(id, payload, tenantId), tenantId);
  const deleteM = useDelete('vendorSubmittals', (id) => vendorSubmittalService.delete(id, tenantId), tenantId);

  const items = useMemo(() => submittalsQ.data || [], [submittalsQ.data]);

  // Filter and sort
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.vendorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.candidateName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus) {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'vendorName') {
        comparison = (a.vendorName || '').localeCompare(b.vendorName || '');
      } else if (sortField === 'candidateName') {
        comparison = (a.candidateName || '').localeCompare(b.candidateName || '');
      } else if (sortField === 'rate') {
        comparison = (a.rate || 0) - (b.rate || 0);
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

  const handleSave = async (payload: Partial<VendorSubmittal>) => {
    try {
      if (selected) {
        await updateM.mutateAsync({ id: selected.id, data: payload });
        toast.success('Submittal updated successfully');
      } else {
        await createM.mutateAsync(payload);
        toast.success('Submittal created successfully');
      }
      setShowModal(false);
      setSelected(null);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save submittal');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submittal?')) return;
    try {
      await deleteM.mutateAsync(id);
      toast.success('Submittal deleted');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete submittal');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} submittal(s)?`)) return;

    try {
      await Promise.all(Array.from(selectedIds).map(id => deleteM.mutateAsync(id)));
      toast.success(`Deleted ${selectedIds.size} submittal(s)`);
      setSelectedIds(new Set());
    } catch (error: any) {
      toast.error('Failed to delete some submittals');
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

  const openNewModal = () => {
    setSelected(null);
    setShowModal(true);
  };

  const openEditModal = (item: VendorSubmittal) => {
    setSelected(item);
    setShowModal(true);
  };

  const getStatusColor = (status: VendorSubmittal['status']) => {
    switch (status) {
      case 'accepted':
        return 'bg-[rgba(var(--app-success),0.15)] text-[rgb(var(--app-success))]';
      case 'rejected':
        return 'bg-[rgba(var(--app-error),0.15)] text-[rgb(var(--app-error))]';
      case 'withdrawn':
        return 'bg-[rgba(var(--app-warning),0.15)] text-[rgb(var(--app-warning))]';
      case 'submitted':
      default:
        return 'bg-[rgba(var(--app-primary),0.15)] text-[rgb(var(--app-primary))]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted">
        <span>Dashboard</span>
        <span>/</span>
        <span className="text-[rgb(var(--app-text-primary))]">Vendor Submittals</span>
      </nav>

      {/* Page Header */}
      <PageHeader
        title="Vendor Submittals"
        subtitle="Track and manage vendor candidate submissions"
        actions={
          <Button variant="primary" size="md" onClick={openNewModal}>
            <Plus size={16} />
            <span className="ml-2">New Submittal</span>
          </Button>
        }
      />

      {/* Search & Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              type="text"
              placeholder="Search by vendor, candidate, or job..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input w-full pl-10 appearance-none"
              >
                <option value="">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchQuery || filterStatus) && (
            <Button
              variant="ghost"
              size="md"
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Bulk Actions */}
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
      {submittalsQ.isLoading && <TableSkeleton rows={8} columns={6} />}

      {/* Error State */}
      {submittalsQ.error && (
        <div className="card">
          <div className="text-center py-8">
            <p className="text-[rgb(var(--app-error))]">Failed to load submittals</p>
            <Button className="mt-4" variant="subtle" onClick={() => submittalsQ.refetch()}>
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!submittalsQ.isLoading && !submittalsQ.error && filteredItems.length === 0 && items.length === 0 && (
        <EmptyState
          icon={<UserCheck size={48} />}
          title="No submittals yet"
          description="Start tracking vendor candidate submissions. Add your first submittal to get started."
          action={
            <Button variant="primary" onClick={openNewModal}>
              <Plus size={16} className="mr-2" />
              Create Submittal
            </Button>
          }
        />
      )}

      {/* No Search Results */}
      {!submittalsQ.isLoading && !submittalsQ.error && filteredItems.length === 0 && items.length > 0 && (
        <EmptyState
          icon={<Search size={48} />}
          title="No submittals found"
          description={`No submittals match your search "${searchQuery}${filterStatus ? ` with status ${filterStatus}` : ''}"`}
          action={
            <Button variant="subtle" onClick={() => { setSearchQuery(''); setFilterStatus(''); }}>
              Clear Filters
            </Button>
          }
        />
      )}

      {/* Table */}
      {!submittalsQ.isLoading && !submittalsQ.error && filteredItems.length > 0 && (
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
                  <th className="px-4 py-3 cursor-pointer hover:text-[rgb(var(--app-text-primary))]" onClick={() => handleSort('vendorName')}>
                    <div className="flex items-center gap-2">
                      Vendor
                      {sortField === 'vendorName' && (
                        sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:text-[rgb(var(--app-text-primary))]" onClick={() => handleSort('candidateName')}>
                    <div className="flex items-center gap-2">
                      Candidate
                      {sortField === 'candidateName' && (
                        sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3">Job</th>
                  <th className="px-4 py-3 cursor-pointer hover:text-[rgb(var(--app-text-primary))]" onClick={() => handleSort('rate')}>
                    <div className="flex items-center gap-2">
                      Rate
                      {sortField === 'rate' && (
                        sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(var(--app-border-subtle))]">
                {filteredItems.map((submittal) => (
                  <tr key={submittal.id} className="hover:bg-[rgba(var(--app-surface-muted),0.4)] transition">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(submittal.id)}
                        onChange={() => toggleSelect(submittal.id)}
                        className="rounded border-[rgba(var(--app-border-subtle))]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-[rgb(var(--app-text-primary))]">{submittal.vendorName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[rgb(var(--app-text-primary))]">{submittal.candidateName || submittal.candidateId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-muted">{submittal.jobTitle || submittal.jobId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-[rgb(var(--app-text-primary))]">{submittal.rate ? `$${submittal.rate}` : '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`chip ${getStatusColor(submittal.status)}`}>
                        {submittal.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(submittal)}
                          className="p-2 rounded-lg hover:bg-[rgba(var(--app-primary),0.1)] text-[rgb(var(--app-primary))] transition"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(submittal.id)}
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

          {/* Table Footer */}
          <div className="px-4 py-3 border-t border-[rgba(var(--app-border-subtle))] text-sm text-muted">
            Showing {filteredItems.length} of {items.length} submittal(s)
          </div>
        </div>
      )}

      {/* Modal */}
      <EditModal
        open={showModal}
        initial={selected || undefined}
        onClose={() => { setShowModal(false); setSelected(null); }}
        onSave={handleSave}
        saving={createM.isPending || updateM.isPending}
      />
    </div>
  );
}

function EditModal({ open, initial, onClose, onSave, saving }: {
  open: boolean;
  initial?: Partial<VendorSubmittal>;
  onClose: () => void;
  onSave: (payload: Partial<VendorSubmittal>) => void | Promise<void>;
  saving?: boolean;
}) {
  const [vendorName, setVendorName] = useState(initial?.vendorName || '');
  const [candidateId, setCandidateId] = useState(initial?.candidateId || '');
  const [candidateName, setCandidateName] = useState(initial?.candidateName || '');
  const [jobId, setJobId] = useState(initial?.jobId || '');
  const [jobTitle, setJobTitle] = useState(initial?.jobTitle || '');
  const [rate, setRate] = useState(initial?.rate?.toString() || '');
  const [status, setStatus] = useState<VendorSubmittal['status']>(initial?.status || 'submitted');
  const [errors, setErrors] = useState<{ vendorName?: string; candidateId?: string; jobId?: string }>({});

  if (!open) return null;

  const validate = () => {
    const newErrors: { vendorName?: string; candidateId?: string; jobId?: string } = {};
    if (!vendorName.trim()) newErrors.vendorName = 'Vendor name is required';
    if (!candidateId.trim()) newErrors.candidateId = 'Candidate ID is required';
    if (!jobId.trim()) newErrors.jobId = 'Job ID is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({
      vendorName: vendorName.trim(),
      candidateId: candidateId.trim(),
      candidateName: candidateName.trim() || undefined,
      jobId: jobId.trim(),
      jobTitle: jobTitle.trim() || undefined,
      rate: rate ? Number(rate) : undefined,
      status
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="pb-4 border-b border-[rgba(var(--app-border-subtle))]">
          <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">
            {initial?.id ? 'Edit Submittal' : 'New Submittal'}
          </h2>
          <p className="text-sm text-muted mt-1">
            Track vendor candidate submissions and manage the hiring pipeline
          </p>
        </div>

        {/* Form */}
        <div className="py-6 space-y-5">
          <Field label="Vendor Name" htmlFor="vendorName" error={errors.vendorName} required>
            <input
              id="vendorName"
              type="text"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="input"
              placeholder="e.g., Tech Staffing Inc."
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Candidate ID" htmlFor="candidateId" error={errors.candidateId} required>
              <input
                id="candidateId"
                type="text"
                value={candidateId}
                onChange={(e) => setCandidateId(e.target.value)}
                className="input"
                placeholder="CAND-001"
              />
            </Field>

            <Field label="Candidate Name" htmlFor="candidateName" hint="Optional display name">
              <input
                id="candidateName"
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="input"
                placeholder="John Doe"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Job ID" htmlFor="jobId" error={errors.jobId} required>
              <input
                id="jobId"
                type="text"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                className="input"
                placeholder="JOB-001"
              />
            </Field>

            <Field label="Job Title" htmlFor="jobTitle" hint="Optional display title">
              <input
                id="jobTitle"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="input"
                placeholder="Senior Developer"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Rate" htmlFor="rate" hint="Hourly or daily rate">
              <input
                id="rate"
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="input"
                placeholder="150"
              />
            </Field>

            <Field label="Status" htmlFor="status" required>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as VendorSubmittal['status'])}
                className="input"
              >
                <option value="submitted">Submitted</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[rgba(var(--app-border-subtle))] flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Submittal'}
          </Button>
        </div>
      </div>
    </div>
  );
}
