import { useMemo, useState } from 'react';
import { FileText, Plus, Search, Filter, ChevronDown, ChevronUp, Trash2, Edit, Clipboard } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { InterviewGuide } from '../types/interviewGuide';
import { listInterviewGuides, createInterviewGuide, updateInterviewGuide, deleteInterviewGuide } from '../services/interviewGuide.service';
import { useList, useCreate, useUpdate, useDelete } from '../services/hooks';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/LoadingStates';
import Field from '../components/ui/Field';

type SortField = 'name' | 'role' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export default function InterviewGuides() {
  const tenantId = useMemo(() => localStorage.getItem('tenantId') || undefined, []);
  const [selected, setSelected] = useState<InterviewGuide | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const { data, isLoading, error, refetch } = useList<InterviewGuide[]>('interviewGuides', () => listInterviewGuides(tenantId), tenantId);
  const createM = useCreate('interviewGuides', (payload: Partial<InterviewGuide>) => createInterviewGuide(payload as any, tenantId), tenantId);
  const updateM = useUpdate('interviewGuides', (id: string, payload: Partial<InterviewGuide>) => updateInterviewGuide({ id, ...payload }, tenantId), tenantId);
  const deleteM = useDelete('interviewGuides', (id: string) => deleteInterviewGuide(id, tenantId), tenantId);

  const items = useMemo(() => data || [], [data]);

  // Extract unique roles
  const allRoles = useMemo(() => {
    const roles = new Set<string>();
    items.forEach(item => {
      if (item.role) roles.add(item.role);
    });
    return Array.from(roles).sort();
  }, [items]);

  // Filter and sort
  const filteredItems = useMemo(() => {
    let filtered = items;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.role?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterRole) {
      filtered = filtered.filter(item => item.role === filterRole);
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = (a.name || '').localeCompare(b.name || '');
      } else if (sortField === 'role') {
        comparison = (a.role || '').localeCompare(b.role || '');
      } else if (sortField === 'createdAt') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        comparison = dateA - dateB;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [items, searchQuery, filterRole, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSave = async (payload: Partial<InterviewGuide>) => {
    try {
      if (selected) {
        await updateM.mutateAsync({ id: selected.id, data: payload });
        toast.success('Interview guide updated');
      } else {
        await createM.mutateAsync(payload);
        toast.success('Interview guide created');
      }
      setShowModal(false);
      setSelected(null);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save guide');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this interview guide?')) return;
    try {
      await deleteM.mutateAsync(id);
      toast.success('Guide deleted');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} guide(s)?`)) return;
    try {
      await Promise.all(Array.from(selectedIds).map(id => deleteM.mutateAsync(id)));
      toast.success(`Deleted ${selectedIds.size} guide(s)`);
      setSelectedIds(new Set());
    } catch (e: any) {
      toast.error('Failed to delete some guides');
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

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted">
        <span>Dashboard</span>
        <span>/</span>
        <span className="text-[rgb(var(--app-text-primary))]">Interview Guides</span>
      </nav>

      {/* Page Header */}
      <PageHeader
        title="Interview Guides"
        subtitle="Create structured interview templates with questions and evaluation criteria"
        actions={
          <Button variant="primary" size="md" onClick={() => { setSelected(null); setShowModal(true); }}>
            <Plus size={16} />
            <span className="ml-2">New Guide</span>
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
              placeholder="Search by name or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full pl-10"
            />
          </div>

          <div className="sm:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="input w-full pl-10 appearance-none"
              >
                <option value="">All Roles</option>
                {allRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>

          {(searchQuery || filterRole) && (
            <Button variant="ghost" size="md" onClick={() => { setSearchQuery(''); setFilterRole(''); }}>
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
      {isLoading && <TableSkeleton rows={8} columns={4} />}

      {/* Error State */}
      {error && (
        <div className="card text-center py-8">
          <p className="text-[rgb(var(--app-error))]">Failed to load guides</p>
          <Button className="mt-4" variant="subtle" onClick={() => refetch()}>Try Again</Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredItems.length === 0 && items.length === 0 && (
        <EmptyState
          icon={<Clipboard size={48} />}
          title="No interview guides yet"
          description="Create structured interview guides with questions and evaluation criteria to ensure consistent candidate assessments"
          action={
            <Button variant="primary" onClick={() => { setSelected(null); setShowModal(true); }}>
              <Plus size={16} className="mr-2" />
              Create Guide
            </Button>
          }
        />
      )}

      {/* No Search Results */}
      {!isLoading && !error && filteredItems.length === 0 && items.length > 0 && (
        <EmptyState
          icon={<Search size={48} />}
          title="No guides found"
          description={`No guides match "${searchQuery}"${filterRole ? ` for role ${filterRole}` : ''}`}
          action={
            <Button variant="subtle" onClick={() => { setSearchQuery(''); setFilterRole(''); }}>
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
                  <th className="px-4 py-3 cursor-pointer hover:text-[rgb(var(--app-text-primary))]" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-2">
                      Name
                      {sortField === 'name' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:text-[rgb(var(--app-text-primary))]" onClick={() => handleSort('role')}>
                    <div className="flex items-center gap-2">
                      Role
                      {sortField === 'role' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:text-[rgb(var(--app-text-primary))]" onClick={() => handleSort('createdAt')}>
                    <div className="flex items-center gap-2">
                      Created
                      {sortField === 'createdAt' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(var(--app-border-subtle))]">
                {filteredItems.map((guide) => (
                  <tr key={guide.id} className="hover:bg-[rgba(var(--app-surface-muted),0.4)] transition">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(guide.id)}
                        onChange={() => toggleSelect(guide.id)}
                        className="rounded border-[rgba(var(--app-border-subtle))]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Clipboard size={16} className="text-[rgb(var(--app-primary))]" />
                        <span className="font-medium text-[rgb(var(--app-text-primary))]">{guide.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="chip bg-[rgba(var(--app-primary),0.15)] text-[rgb(var(--app-primary))]">
                        {guide.role || 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">
                      {guide.createdAt ? new Date(guide.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setSelected(guide); setShowModal(true); }}
                          className="p-2 rounded-lg hover:bg-[rgba(var(--app-primary),0.1)] text-[rgb(var(--app-primary))] transition"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(guide.id)}
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
            Showing {filteredItems.length} of {items.length} guide(s)
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && <EditModal selected={selected} onClose={() => { setShowModal(false); setSelected(null); }} onSave={handleSave} saving={createM.isPending || updateM.isPending} />}
    </div>
  );
}

function EditModal({ selected, onClose, onSave, saving }: {
  selected: InterviewGuide | null;
  onClose: () => void;
  onSave: (payload: Partial<InterviewGuide>) => void | Promise<void>;
  saving?: boolean;
}) {
  const [name, setName] = useState(selected?.name || '');
  const [role, setRole] = useState(selected?.role || '');
  const [errors, setErrors] = useState<{ name?: string; role?: string }>({});

  const validate = () => {
    const newErrors: { name?: string; role?: string } = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!role.trim()) newErrors.role = 'Role is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({ name: name.trim(), role: role.trim(), sections: selected?.sections || [] });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-lg">
        <div className="pb-4 border-b border-[rgba(var(--app-border-subtle))]">
          <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">
            {selected ? 'Edit Guide' : 'New Interview Guide'}
          </h2>
          <p className="text-sm text-muted mt-1">
            Create a structured interview template
          </p>
        </div>

        <div className="py-6 space-y-5">
          <Field label="Guide Name" htmlFor="name" error={errors.name} required>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="e.g., Senior Engineer Technical Interview"
            />
          </Field>

          <Field label="Role/Position" htmlFor="role" error={errors.role} required>
            <input
              id="role"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input"
              placeholder="e.g., Software Engineer"
            />
          </Field>
        </div>

        <div className="pt-4 border-t border-[rgba(var(--app-border-subtle))] flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Guide'}
          </Button>
        </div>
      </div>
    </div>
  );
}
