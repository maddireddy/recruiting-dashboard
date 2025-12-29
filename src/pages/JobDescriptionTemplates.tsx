import { useMemo, useState } from 'react';
import { FileText, Plus, Search, Sparkles, Filter, ChevronDown, ChevronUp, Trash2, Edit, Copy } from 'lucide-react';
import { useList, useCreate, useUpdate, useDelete } from '../services/hooks';
import { jdTemplateService } from '../services/jdTemplate.service';
import type { JobDescriptionTemplate } from '../types/jobDescriptionTemplate';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/LoadingStates';
import { toast } from 'react-hot-toast';
import Field from '../components/ui/Field';

type SortField = 'name' | 'updatedAt';
type SortOrder = 'asc' | 'desc';

export default function JobDescriptionTemplatesPage() {
  const tenantId = localStorage.getItem('tenantId') || undefined;
  const [selected, setSelected] = useState<JobDescriptionTemplate | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const templatesQ = useList<JobDescriptionTemplate[]>('jd-templates', () => jdTemplateService.list(tenantId), tenantId);
  const createM = useCreate<Partial<JobDescriptionTemplate>, JobDescriptionTemplate>('jd-templates', jdTemplateService.create, tenantId);
  const updateM = useUpdate<Partial<JobDescriptionTemplate>, JobDescriptionTemplate>('jd-templates', jdTemplateService.update, tenantId);
  const deleteM = useDelete('jd-templates', jdTemplateService.delete, tenantId);

  const items = useMemo(() => templatesQ.data || [], [templatesQ.data]);

  // Extract unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    items.forEach(item => {
      (item.tags || []).forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [items]);

  // Filter and sort
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Tag filter
    if (filterTag) {
      filtered = filtered.filter(item => (item.tags || []).includes(filterTag));
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'updatedAt') {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        comparison = dateA - dateB;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [items, searchQuery, filterTag, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSave = async (payload: Partial<JobDescriptionTemplate>) => {
    try {
      if (selected) {
        await updateM.mutateAsync({ id: selected.id, data: payload });
        toast.success('Template updated successfully');
      } else {
        await createM.mutateAsync(payload);
        toast.success('Template created successfully');
      }
      setShowModal(false);
      setSelected(null);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save template');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await deleteM.mutateAsync(id);
      toast.success('Template deleted');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete template');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} template(s)?`)) return;

    try {
      await Promise.all(Array.from(selectedIds).map(id => deleteM.mutateAsync(id)));
      toast.success(`Deleted ${selectedIds.size} template(s)`);
      setSelectedIds(new Set());
    } catch (error: any) {
      toast.error('Failed to delete some templates');
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

  const openEditModal = (item: JobDescriptionTemplate) => {
    setSelected(item);
    setShowModal(true);
  };

  const handleAIGenerate = () => {
    toast.success('AI Generator coming soon!');
    // TODO: Integrate with AI service
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted">
        <span>Dashboard</span>
        <span>/</span>
        <span className="text-[rgb(var(--app-text-primary))]">Job Description Templates</span>
      </nav>

      {/* Page Header */}
      <PageHeader
        title="Job Description Templates"
        subtitle="Create and manage reusable job description templates with AI assistance"
        actions={
          <div className="flex items-center gap-3">
            <Button variant="subtle" size="md" onClick={handleAIGenerate}>
              <Sparkles size={16} />
              <span className="ml-2">AI Generator</span>
            </Button>
            <Button variant="primary" size="md" onClick={openNewModal}>
              <Plus size={16} />
              <span className="ml-2">New Template</span>
            </Button>
          </div>
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
              placeholder="Search templates by name or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full pl-10"
            />
          </div>

          {/* Tag Filter */}
          <div className="sm:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="input w-full pl-10 appearance-none"
              >
                <option value="">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchQuery || filterTag) && (
            <Button
              variant="ghost"
              size="md"
              onClick={() => {
                setSearchQuery('');
                setFilterTag('');
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
      {templatesQ.isLoading && <TableSkeleton rows={8} columns={5} />}

      {/* Error State */}
      {templatesQ.error && (
        <div className="card">
          <div className="text-center py-8">
            <p className="text-[rgb(var(--app-error))]">Failed to load templates</p>
            <Button className="mt-4" variant="subtle" onClick={() => templatesQ.refetch()}>
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!templatesQ.isLoading && !templatesQ.error && filteredItems.length === 0 && items.length === 0 && (
        <EmptyState
          icon={<FileText size={48} />}
          title="No templates yet"
          description="Create your first job description template to speed up your hiring process. Use AI to generate templates or start from scratch."
          action={
            <div className="flex gap-3">
              <Button variant="primary" onClick={openNewModal}>
                <Plus size={16} className="mr-2" />
                Create Template
              </Button>
              <Button variant="subtle" onClick={handleAIGenerate}>
                <Sparkles size={16} className="mr-2" />
                Try AI Generator
              </Button>
            </div>
          }
        />
      )}

      {/* No Search Results */}
      {!templatesQ.isLoading && !templatesQ.error && filteredItems.length === 0 && items.length > 0 && (
        <EmptyState
          icon={<Search size={48} />}
          title="No templates found"
          description={`No templates match your search "${searchQuery}${filterTag ? ` with tag ${filterTag}` : ''}"`}
          action={
            <Button variant="subtle" onClick={() => { setSearchQuery(''); setFilterTag(''); }}>
              Clear Filters
            </Button>
          }
        />
      )}

      {/* Table */}
      {!templatesQ.isLoading && !templatesQ.error && filteredItems.length > 0 && (
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
                  <th className="px-4 py-3">Tags</th>
                  <th className="px-4 py-3">Status</th>
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
                {filteredItems.map((template) => (
                  <tr key={template.id} className="hover:bg-[rgba(var(--app-surface-muted),0.4)] transition">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(template.id)}
                        onChange={() => toggleSelect(template.id)}
                        className="rounded border-[rgba(var(--app-border-subtle))]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-[rgb(var(--app-primary))]" />
                        <span className="font-medium text-[rgb(var(--app-text-primary))]">{template.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(template.tags || []).map((tag, idx) => {
                          const tagColors = [
                            'bg-[rgba(var(--app-primary),0.15)] text-[rgb(var(--app-primary))]',
                            'bg-[rgba(var(--app-success),0.15)] text-[rgb(var(--app-success))]',
                            'bg-[rgba(var(--app-warning),0.15)] text-[rgb(var(--app-warning))]',
                          ];
                          return (
                            <span
                              key={idx}
                              className={`chip ${tagColors[idx % 3]}`}
                            >
                              {tag}
                            </span>
                          );
                        })}
                        {(!template.tags || template.tags.length === 0) && (
                          <span className="text-xs text-muted">No tags</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="chip bg-[rgba(var(--app-success),0.15)] text-[rgb(var(--app-success))]">
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">
                      {template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(template)}
                          className="p-2 rounded-lg hover:bg-[rgba(var(--app-primary),0.1)] text-[rgb(var(--app-primary))] transition"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
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
            Showing {filteredItems.length} of {items.length} template(s)
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
  initial?: Partial<JobDescriptionTemplate>;
  onClose: () => void;
  onSave: (payload: Partial<JobDescriptionTemplate>) => void | Promise<void>;
  saving?: boolean;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [content, setContent] = useState(initial?.content || '');
  const [tags, setTags] = useState((initial?.tags || []).join(', '));
  const [errors, setErrors] = useState<{ name?: string; content?: string }>({});

  if (!open) return null;

  const validate = () => {
    const newErrors: { name?: string; content?: string } = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!content.trim()) newErrors.content = 'Content is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({
      name: name.trim(),
      content: content.trim(),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="pb-4 border-b border-[rgba(var(--app-border-subtle))]">
          <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">
            {initial?.id ? 'Edit Template' : 'New Template'}
          </h2>
          <p className="text-sm text-muted mt-1">
            Create a reusable job description template for faster hiring
          </p>
        </div>

        {/* Form */}
        <div className="py-6 space-y-5">
          <Field label="Template Name" htmlFor="name" error={errors.name} required>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="e.g., Senior Software Engineer"
            />
          </Field>

          <Field label="Job Description Content" htmlFor="content" error={errors.content} required hint="Use markdown formatting for better readability">
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input"
              rows={12}
              placeholder="## About the Role&#10;&#10;We are seeking a talented...&#10;&#10;## Responsibilities&#10;- Lead technical initiatives&#10;- Mentor junior developers"
            />
          </Field>

          <Field label="Tags" htmlFor="tags" hint="Comma-separated (e.g., Engineering, Remote, Senior)">
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="input"
              placeholder="Engineering, Remote, Senior"
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[rgba(var(--app-border-subtle))] flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </div>
    </div>
  );
}
