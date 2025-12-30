import { useMemo, useState } from 'react';
import { Bookmark, Plus, Search, ChevronDown, ChevronUp, Trash2, Edit, Play } from 'lucide-react';
import { useList, useCreate, useUpdate, useDelete } from '../services/hooks';
import { savedSearchService } from '../services/savedSearch.service';
import type { SavedSearch } from '../types/savedSearch';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/LoadingStates';
import { toast } from 'react-hot-toast';
import Field from '../components/ui/Field';
import { useNavigate } from 'react-router-dom';

type SortField = 'name' | 'updatedAt';
type SortOrder = 'asc' | 'desc';

export default function SavedSearchesPage() {
  const navigate = useNavigate();
  const tenantId = localStorage.getItem('tenantId') || undefined;
  const [selected, setSelected] = useState<SavedSearch | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const searchesQ = useList<SavedSearch[]>('saved-searches', () => savedSearchService.list(tenantId), tenantId);
  const createM = useCreate<Partial<SavedSearch>, SavedSearch>('saved-searches', savedSearchService.create, tenantId);
  const updateM = useUpdate<Partial<SavedSearch>, SavedSearch>('saved-searches', savedSearchService.update, tenantId);
  const deleteM = useDelete('saved-searches', savedSearchService.delete, tenantId);

  const items = useMemo(() => searchesQ.data || [], [searchesQ.data]);

  // Filter and sort
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.query?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = (a.name || '').localeCompare(b.name || '');
      } else if (sortField === 'updatedAt') {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        comparison = dateA - dateB;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [items, searchQuery, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSave = async (payload: Partial<SavedSearch>) => {
    try {
      if (selected) {
        await updateM.mutateAsync({ id: selected.id, data: payload });
        toast.success('Saved search updated successfully');
      } else {
        await createM.mutateAsync(payload);
        toast.success('Saved search created successfully');
      }
      setShowModal(false);
      setSelected(null);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save search');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this saved search?')) return;
    try {
      await deleteM.mutateAsync(id);
      toast.success('Saved search deleted');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete saved search');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} saved search(es)?`)) return;

    try {
      await Promise.all(Array.from(selectedIds).map(id => deleteM.mutateAsync(id)));
      toast.success(`Deleted ${selectedIds.size} saved search(es)`);
      setSelectedIds(new Set());
    } catch (error: any) {
      toast.error('Failed to delete some saved searches');
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

  const openEditModal = (item: SavedSearch) => {
    setSelected(item);
    setShowModal(true);
  };

  const handleExecuteSearch = (search: SavedSearch) => {
    // Navigate to candidates page with the saved search applied
    const params = new URLSearchParams();

    if (search.query) {
      params.set('q', search.query);
    }

    if (search.filters) {
      Object.entries(search.filters).forEach(([key, value]) => {
        if (value) {
          params.set(key, String(value));
        }
      });
    }

    const targetPage = search.searchType === 'jobs' ? '/jobs' : '/candidates';
    const queryString = params.toString();
    const url = queryString ? `${targetPage}?${queryString}` : targetPage;

    toast.success(`Executing search: ${search.name}`);
    navigate(url);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted">
        <span>Dashboard</span>
        <span>/</span>
        <span className="text-[rgb(var(--app-text-primary))]">Saved Searches</span>
      </nav>

      {/* Page Header */}
      <PageHeader
        title="Saved Searches"
        subtitle="Save and manage your frequently used search queries"
        actions={
          <Button variant="primary" size="md" onClick={openNewModal}>
            <Plus size={16} />
            <span className="ml-2">New Saved Search</span>
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
              placeholder="Search saved searches by name or query..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full pl-10"
            />
          </div>

          {/* Clear Filters */}
          {searchQuery && (
            <Button
              variant="ghost"
              size="md"
              onClick={() => setSearchQuery('')}
            >
              Clear Search
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
      {searchesQ.isLoading && <TableSkeleton rows={6} columns={4} />}

      {/* Error State */}
      {searchesQ.error && (
        <div className="card">
          <div className="text-center py-8">
            <p className="text-[rgb(var(--app-error))]">Failed to load saved searches</p>
            <Button className="mt-4" variant="subtle" onClick={() => searchesQ.refetch()}>
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!searchesQ.isLoading && !searchesQ.error && filteredItems.length === 0 && items.length === 0 && (
        <EmptyState
          icon={<Bookmark size={48} />}
          title="No saved searches yet"
          description="Save your frequently used queries for quick access. Create your first saved search to get started."
          action={
            <Button variant="primary" onClick={openNewModal}>
              <Plus size={16} className="mr-2" />
              Create Saved Search
            </Button>
          }
        />
      )}

      {/* No Search Results */}
      {!searchesQ.isLoading && !searchesQ.error && filteredItems.length === 0 && items.length > 0 && (
        <EmptyState
          icon={<Search size={48} />}
          title="No searches found"
          description={`No saved searches match your search "${searchQuery}"`}
          action={
            <Button variant="subtle" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          }
        />
      )}

      {/* Table */}
      {!searchesQ.isLoading && !searchesQ.error && filteredItems.length > 0 && (
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
                      {sortField === 'name' && (
                        sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3">Query</th>
                  <th className="px-4 py-3 cursor-pointer hover:text-[rgb(var(--app-text-primary))]" onClick={() => handleSort('updatedAt')}>
                    <div className="flex items-center gap-2">
                      Updated
                      {sortField === 'updatedAt' && (
                        sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(var(--app-border-subtle))]">
                {filteredItems.map((search) => (
                  <tr key={search.id} className="hover:bg-[rgba(var(--app-surface-muted),0.4)] transition">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(search.id)}
                        onChange={() => toggleSelect(search.id)}
                        className="rounded border-[rgba(var(--app-border-subtle))]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Bookmark size={16} className="text-[rgb(var(--app-primary))]" />
                        <span className="font-medium text-[rgb(var(--app-text-primary))]">{search.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-md truncate text-sm text-muted font-mono">
                        {search.query}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">
                      {search.updatedAt ? new Date(search.updatedAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleExecuteSearch(search)}
                          className="p-2 rounded-lg hover:bg-[rgba(var(--app-success),0.1)] text-[rgb(var(--app-success))] transition"
                          title="Execute Search"
                        >
                          <Play size={16} />
                        </button>
                        <button
                          onClick={() => openEditModal(search)}
                          className="p-2 rounded-lg hover:bg-[rgba(var(--app-primary),0.1)] text-[rgb(var(--app-primary))] transition"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(search.id)}
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
            Showing {filteredItems.length} of {items.length} saved search(es)
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
  initial?: Partial<SavedSearch>;
  onClose: () => void;
  onSave: (payload: Partial<SavedSearch>) => void | Promise<void>;
  saving?: boolean;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [query, setQuery] = useState(initial?.query || '');
  const [errors, setErrors] = useState<{ name?: string; query?: string }>({});

  if (!open) return null;

  const validate = () => {
    const newErrors: { name?: string; query?: string } = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!query.trim()) newErrors.query = 'Query is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({
      name: name.trim(),
      query: query.trim()
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="pb-4 border-b border-[rgba(var(--app-border-subtle))]">
          <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">
            {initial?.id ? 'Edit Saved Search' : 'New Saved Search'}
          </h2>
          <p className="text-sm text-muted mt-1">
            Save a search query for quick access later
          </p>
        </div>

        {/* Form */}
        <div className="py-6 space-y-5">
          <Field label="Search Name" htmlFor="name" error={errors.name} required hint="A descriptive name for this search">
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="e.g., Senior Developers in California"
            />
          </Field>

          <Field label="Search Query" htmlFor="query" error={errors.query} required hint="The search query or filter criteria">
            <textarea
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input"
              rows={6}
              placeholder="e.g., role:developer AND location:California AND experience:>5"
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[rgba(var(--app-border-subtle))] flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Search'}
          </Button>
        </div>
      </div>
    </div>
  );
}
