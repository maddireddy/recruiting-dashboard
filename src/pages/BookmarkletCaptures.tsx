import { useMemo, useState } from 'react';
import { Bookmark, Plus, Search, Filter, ChevronDown, ChevronUp, Trash2, Edit, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useList, useCreate, useUpdate, useDelete } from '../services/hooks';
import { bookmarkletCaptureService } from '../services/bookmarkletCapture.service';
import type { BookmarkletCapture } from '../types/bookmarkletCapture';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/LoadingStates';
import Field from '../components/ui/Field';

type SortField = 'title' | 'capturedAt';
type SortOrder = 'asc' | 'desc';

export default function BookmarkletCapturesPage() {
  const tenantId = localStorage.getItem('tenantId') || undefined;
  const [selected, setSelected] = useState<BookmarkletCapture | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('capturedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const listQ = useList<BookmarkletCapture[]>('bookmarklet-captures', () => bookmarkletCaptureService.list(tenantId), tenantId);
  const createM = useCreate<Partial<BookmarkletCapture>, BookmarkletCapture>('bookmarklet-captures', bookmarkletCaptureService.create, tenantId);
  const updateM = useUpdate<Partial<BookmarkletCapture>, BookmarkletCapture>('bookmarklet-captures', bookmarkletCaptureService.update, tenantId);
  const deleteM = useDelete('bookmarklet-captures', bookmarkletCaptureService.delete, tenantId);

  const items = useMemo(() => listQ.data || [], [listQ.data]);

  // Filter and sort
  const filteredItems = useMemo(() => {
    let filtered = items;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sourceUrl?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'title') {
        comparison = (a.title || '').localeCompare(b.title || '');
      } else if (sortField === 'capturedAt') {
        const dateA = a.capturedAt ? new Date(a.capturedAt).getTime() : 0;
        const dateB = b.capturedAt ? new Date(b.capturedAt).getTime() : 0;
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

  const handleSave = async (payload: Partial<BookmarkletCapture>) => {
    try {
      if (selected) {
        await updateM.mutateAsync({ id: selected.id, data: payload });
        toast.success('Capture updated');
      } else {
        await createM.mutateAsync(payload);
        toast.success('Capture created');
      }
      setShowModal(false);
      setSelected(null);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save capture');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this capture?')) return;
    try {
      await deleteM.mutateAsync(id);
      toast.success('Capture deleted');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} capture(s)?`)) return;
    try {
      await Promise.all(Array.from(selectedIds).map(id => deleteM.mutateAsync(id)));
      toast.success(`Deleted ${selectedIds.size} capture(s)`);
      setSelectedIds(new Set());
    } catch (e: any) {
      toast.error('Failed to delete some captures');
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
        <span className="text-[rgb(var(--app-text-primary))]">Bookmarklet Captures</span>
      </nav>

      {/* Page Header */}
      <PageHeader
        title="Bookmarklet Captures"
        subtitle="Captured candidate profiles and job postings from external websites"
        actions={
          <Button variant="primary" size="md" onClick={() => { setSelected(null); setShowModal(true); }}>
            <Plus size={16} />
            <span className="ml-2">New Capture</span>
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
              placeholder="Search by title, URL, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full pl-10"
            />
          </div>

          {searchQuery && (
            <Button variant="ghost" size="md" onClick={() => setSearchQuery('')}>
              Clear Search
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
      {listQ.isLoading && <TableSkeleton rows={8} columns={5} />}

      {/* Error State */}
      {listQ.error && (
        <div className="card text-center py-8">
          <p className="text-[rgb(var(--app-error))]">Failed to load captures</p>
          <Button className="mt-4" variant="subtle" onClick={() => listQ.refetch()}>Try Again</Button>
        </div>
      )}

      {/* Empty State */}
      {!listQ.isLoading && !listQ.error && filteredItems.length === 0 && items.length === 0 && (
        <EmptyState
          icon={<Bookmark size={48} />}
          title="No captures yet"
          description="Use the bookmarklet to quickly capture candidate profiles and job postings from external websites. Save raw HTML and metadata for later processing."
          action={
            <Button variant="primary" onClick={() => { setSelected(null); setShowModal(true); }}>
              <Plus size={16} className="mr-2" />
              Add Capture
            </Button>
          }
        />
      )}

      {/* No Search Results */}
      {!listQ.isLoading && !listQ.error && filteredItems.length === 0 && items.length > 0 && (
        <EmptyState
          icon={<Search size={48} />}
          title="No captures found"
          description={`No captures match "${searchQuery}"`}
          action={
            <Button variant="subtle" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          }
        />
      )}

      {/* Table */}
      {!listQ.isLoading && !listQ.error && filteredItems.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
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
                  <th className="px-4 py-3 cursor-pointer hover:text-[rgb(var(--app-text-primary))]" onClick={() => handleSort('title')}>
                    <div className="flex items-center gap-2">
                      Title
                      {sortField === 'title' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                  <th className="px-4 py-3">Source URL</th>
                  <th className="px-4 py-3 cursor-pointer hover:text-[rgb(var(--app-text-primary))]" onClick={() => handleSort('capturedAt')}>
                    <div className="flex items-center gap-2">
                      Captured
                      {sortField === 'capturedAt' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                  <th className="px-4 py-3">Tags</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(var(--app-border-subtle))]">
                {filteredItems.map((c) => (
                  <tr key={c.id} className="hover:bg-[rgba(var(--app-surface-muted),0.4)] transition">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(c.id)}
                        onChange={() => toggleSelect(c.id)}
                        className="rounded border-[rgba(var(--app-border-subtle))]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Bookmark size={14} className="text-[rgb(var(--app-primary))]" />
                        <span className="font-medium text-[rgb(var(--app-text-primary))]">{c.title || 'Untitled'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={c.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[rgb(var(--app-primary))] hover:underline max-w-xs truncate"
                      >
                        <span className="truncate">{c.sourceUrl}</span>
                        <ExternalLink size={12} className="flex-shrink-0" />
                      </a>
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">
                      {new Date(c.capturedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(c.tags || []).slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="chip bg-[rgba(var(--app-primary),0.15)] text-[rgb(var(--app-primary))] text-xs">
                            {tag}
                          </span>
                        ))}
                        {(c.tags || []).length > 3 && (
                          <span className="text-xs text-muted">+{(c.tags || []).length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setSelected(c); setShowModal(true); }}
                          className="p-2 rounded-lg hover:bg-[rgba(var(--app-primary),0.1)] text-[rgb(var(--app-primary))] transition"
                          title="View/Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-2 rounded-lg hover:bg-[rgba(var(--app-error),0.1)] text-[rgb(var(--app-error))] transition"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-[rgba(var(--app-border-subtle))] text-sm text-muted">
            Showing {filteredItems.length} of {items.length} capture(s)
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <EditModal
          selected={selected}
          onClose={() => { setShowModal(false); setSelected(null); }}
          onSave={handleSave}
          saving={createM.isPending || updateM.isPending}
        />
      )}
    </div>
  );
}

function EditModal({ selected, onClose, onSave, saving }: {
  selected: BookmarkletCapture | null;
  onClose: () => void;
  onSave: (payload: Partial<BookmarkletCapture>) => void | Promise<void>;
  saving?: boolean;
}) {
  const [title, setTitle] = useState(selected?.title || '');
  const [sourceUrl, setSourceUrl] = useState(selected?.sourceUrl || '');
  const [description, setDescription] = useState(selected?.description || '');
  const [tags, setTags] = useState((selected?.tags || []).join(', '));
  const [rawHtml, setRawHtml] = useState(selected?.rawHtml || '');
  const [errors, setErrors] = useState<{ title?: string; sourceUrl?: string }>({});

  const validate = () => {
    const newErrors: { title?: string; sourceUrl?: string } = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!sourceUrl.trim()) newErrors.sourceUrl = 'Source URL is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({
      title: title.trim(),
      sourceUrl: sourceUrl.trim(),
      description: description.trim() || undefined,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      rawHtml: rawHtml.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="pb-4 border-b border-[rgba(var(--app-border-subtle))]">
          <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">
            {selected?.id ? 'View/Edit Capture' : 'New Capture'}
          </h2>
          <p className="text-sm text-muted mt-1">
            Bookmarklet capture from external source
          </p>
        </div>

        <div className="py-6 space-y-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Title" htmlFor="title" error={errors.title} required>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="Capture title"
              />
            </Field>

            <Field label="Source URL" htmlFor="sourceUrl" error={errors.sourceUrl} required>
              <input
                id="sourceUrl"
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="input"
                placeholder="https://example.com/profile"
              />
            </Field>
          </div>

          <Field label="Description" htmlFor="description">
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              placeholder="Brief description of the captured content..."
              rows={3}
            />
          </Field>

          <Field label="Tags" htmlFor="tags" hint="Comma-separated tags">
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="input"
              placeholder="candidate, linkedin, senior-engineer"
            />
          </Field>

          <Field label="Raw HTML (Optional)" htmlFor="rawHtml" hint="Captured HTML content for processing">
            <textarea
              id="rawHtml"
              value={rawHtml}
              onChange={(e) => setRawHtml(e.target.value)}
              className="input font-mono text-xs"
              placeholder="<html>...</html>"
              rows={8}
            />
          </Field>
        </div>

        <div className="pt-4 border-t border-[rgba(var(--app-border-subtle))] flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={saving}>Close</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Capture'}
          </Button>
        </div>
      </div>
    </div>
  );
}
