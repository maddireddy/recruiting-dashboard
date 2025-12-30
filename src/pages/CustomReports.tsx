import { useMemo, useState } from 'react';
import { FileBarChart, Plus, Search, Filter, ChevronDown, ChevronUp, Trash2, Edit, Play, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { CustomReport, CustomReportResultRow } from '../types/customReport';
import { listCustomReports, createCustomReport, updateCustomReport, deleteCustomReport, runCustomReport, exportCustomReport } from '../services/customReport.service';
import { useList, useCreate, useUpdate, useDelete } from '../services/hooks';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/LoadingStates';
import Field from '../components/ui/Field';

type SortField = 'name' | 'description' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export default function CustomReports() {
  const tenantId = useMemo(() => localStorage.getItem('tenantId') || undefined, []);
  const [selected, setSelected] = useState<CustomReport | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [results, setResults] = useState<CustomReportResultRow[] | null>(null);
  const [showResults, setShowResults] = useState(false);

  const { data, isLoading, error, refetch } = useList<CustomReport[]>('customReports', () => listCustomReports(tenantId), tenantId);
  const createM = useCreate('customReports', (payload: Partial<CustomReport>) => createCustomReport(payload as any, tenantId), tenantId);
  const updateM = useUpdate('customReports', (id: string, payload: Partial<CustomReport>) => updateCustomReport({ id, ...payload }, tenantId), tenantId);
  const deleteM = useDelete('customReports', (id: string) => deleteCustomReport(id, tenantId), tenantId);

  const items = useMemo(() => data || [], [data]);

  // Filter and sort
  const filteredItems = useMemo(() => {
    let filtered = items;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = (a.name || '').localeCompare(b.name || '');
      } else if (sortField === 'description') {
        comparison = (a.description || '').localeCompare(b.description || '');
      } else if (sortField === 'createdAt') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
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

  const handleSave = async (payload: Partial<CustomReport>) => {
    try {
      if (selected) {
        await updateM.mutateAsync({ id: selected.id, data: payload });
        toast.success('Report updated');
      } else {
        await createM.mutateAsync(payload);
        toast.success('Report created');
      }
      setShowModal(false);
      setSelected(null);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save report');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this report?')) return;
    try {
      await deleteM.mutateAsync(id);
      toast.success('Report deleted');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} report(s)?`)) return;
    try {
      await Promise.all(Array.from(selectedIds).map(id => deleteM.mutateAsync(id)));
      toast.success(`Deleted ${selectedIds.size} report(s)`);
      setSelectedIds(new Set());
    } catch (e: any) {
      toast.error('Failed to delete some reports');
    }
  };

  const handleRun = async (id: string) => {
    try {
      const data = await runCustomReport(id, tenantId);
      setResults(data);
      setShowResults(true);
      toast.success('Report executed successfully');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to run report');
    }
  };

  const handleExport = async (id: string, format: 'csv' | 'xlsx') => {
    try {
      const blob = await exportCustomReport(id, format, tenantId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${id}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Export started (${format.toUpperCase()})`);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to export');
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
        <span className="text-[rgb(var(--app-text-primary))]">Custom Reports</span>
      </nav>

      {/* Page Header */}
      <PageHeader
        title="Custom Reports"
        subtitle="Create and run custom data reports with flexible filtering and export options"
        actions={
          <Button variant="primary" size="md" onClick={() => { setSelected(null); setShowModal(true); }}>
            <Plus size={16} />
            <span className="ml-2">New Report</span>
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
              placeholder="Search by name or description..."
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
      {isLoading && <TableSkeleton rows={8} columns={4} />}

      {/* Error State */}
      {error && (
        <div className="card text-center py-8">
          <p className="text-[rgb(var(--app-error))]">Failed to load reports</p>
          <Button className="mt-4" variant="subtle" onClick={() => refetch()}>Try Again</Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredItems.length === 0 && items.length === 0 && (
        <EmptyState
          icon={<FileBarChart size={48} />}
          title="No custom reports yet"
          description="Create custom data reports with flexible filters, run them on demand, and export to CSV or Excel formats"
          action={
            <Button variant="primary" onClick={() => { setSelected(null); setShowModal(true); }}>
              <Plus size={16} className="mr-2" />
              Create Report
            </Button>
          }
        />
      )}

      {/* No Search Results */}
      {!isLoading && !error && filteredItems.length === 0 && items.length > 0 && (
        <EmptyState
          icon={<Search size={48} />}
          title="No reports found"
          description={`No reports match "${searchQuery}"`}
          action={
            <Button variant="subtle" onClick={() => setSearchQuery('')}>
              Clear Search
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
                  <th className="px-4 py-3 cursor-pointer hover:text-[rgb(var(--app-text-primary))]" onClick={() => handleSort('description')}>
                    <div className="flex items-center gap-2">
                      Description
                      {sortField === 'description' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
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
                {filteredItems.map((report) => (
                  <tr key={report.id} className="hover:bg-[rgba(var(--app-surface-muted),0.4)] transition">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(report.id)}
                        onChange={() => toggleSelect(report.id)}
                        className="rounded border-[rgba(var(--app-border-subtle))]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileBarChart size={16} className="text-[rgb(var(--app-primary))]" />
                        <span className="font-medium text-[rgb(var(--app-text-primary))]">{report.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted">{report.description || 'No description'}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">
                      {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRun(report.id)}
                          className="p-2 rounded-lg hover:bg-[rgba(var(--app-success),0.1)] text-[rgb(var(--app-success))] transition"
                          title="Run Report"
                        >
                          <Play size={16} />
                        </button>
                        <button
                          onClick={() => handleExport(report.id, 'csv')}
                          className="p-2 rounded-lg hover:bg-[rgba(var(--app-primary),0.1)] text-[rgb(var(--app-primary))] transition"
                          title="Export CSV"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => handleExport(report.id, 'xlsx')}
                          className="p-2 rounded-lg hover:bg-[rgba(var(--app-primary),0.1)] text-[rgb(var(--app-primary))] transition"
                          title="Export XLSX"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => { setSelected(report); setShowModal(true); }}
                          className="p-2 rounded-lg hover:bg-[rgba(var(--app-primary),0.1)] text-[rgb(var(--app-primary))] transition"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(report.id)}
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
            Showing {filteredItems.length} of {items.length} report(s)
          </div>
        </div>
      )}

      {/* Results Panel */}
      {showResults && results && (
        <div className="card">
          <div className="flex items-center justify-between pb-4 border-b border-[rgba(var(--app-border-subtle))]">
            <h2 className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">Report Results</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowResults(false)}>
              Close
            </Button>
          </div>
          <div className="mt-4">
            <pre className="bg-[rgb(var(--app-surface-muted))] p-4 rounded-lg text-sm overflow-auto max-h-96">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && <EditModal selected={selected} onClose={() => { setShowModal(false); setSelected(null); }} onSave={handleSave} saving={createM.isPending || updateM.isPending} />}
    </div>
  );
}

function EditModal({ selected, onClose, onSave, saving }: {
  selected: CustomReport | null;
  onClose: () => void;
  onSave: (payload: Partial<CustomReport>) => void | Promise<void>;
  saving?: boolean;
}) {
  const [name, setName] = useState(selected?.name || '');
  const [description, setDescription] = useState(selected?.description || '');
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  const validate = () => {
    const newErrors: { name?: string; description?: string } = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({ name: name.trim(), description: description.trim(), filters: selected?.filters || {} });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-lg">
        <div className="pb-4 border-b border-[rgba(var(--app-border-subtle))]">
          <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">
            {selected ? 'Edit Report' : 'New Custom Report'}
          </h2>
          <p className="text-sm text-muted mt-1">
            Create a custom data report with flexible filtering
          </p>
        </div>

        <div className="py-6 space-y-5">
          <Field label="Report Name" htmlFor="name" error={errors.name} required>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="e.g., Monthly Hiring Report"
            />
          </Field>

          <Field label="Description" htmlFor="description" error={errors.description}>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              placeholder="Describe what this report tracks..."
              rows={4}
            />
          </Field>
        </div>

        <div className="pt-4 border-t border-[rgba(var(--app-border-subtle))] flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Report'}
          </Button>
        </div>
      </div>
    </div>
  );
}
