import { useMemo, useState } from 'react';
import { Smartphone, Plus, Search, Filter, ChevronDown, ChevronUp, Trash2, Edit } from 'lucide-react';
import { useList, useCreate, useUpdate, useDelete } from '../services/hooks';
import { mobileConfigService } from '../services/mobileConfig.service';
import type { MobileAppConfig } from '../types/mobileConfig';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/LoadingStates';
import { toast } from 'react-hot-toast';
import Field from '../components/ui/Field';

type SortField = 'version' | 'platform' | 'updatedAt';
type SortOrder = 'asc' | 'desc';

export default function MobileAppConfigs() {
  const tenantId = useMemo(() => localStorage.getItem('tenantId') || undefined, []);
  const [selected, setSelected] = useState<MobileAppConfig | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const configsQ = useList<MobileAppConfig[]>('mobileConfigs', () => mobileConfigService.list(tenantId), tenantId);
  const createM = useCreate<Partial<MobileAppConfig>, MobileAppConfig>('mobileConfigs', (payload) => mobileConfigService.create(payload, tenantId), tenantId);
  const updateM = useUpdate<Partial<MobileAppConfig>, MobileAppConfig>('mobileConfigs', (id, payload) => mobileConfigService.update(id, payload, tenantId), tenantId);
  const deleteM = useDelete('mobileConfigs', (id) => mobileConfigService.delete(id, tenantId), tenantId);

  const items = useMemo(() => configsQ.data || [], [configsQ.data]);

  // Filter and sort
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.version?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.platform?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        Object.keys(item.features || {}).some(key => key.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Platform filter
    if (filterPlatform) {
      filtered = filtered.filter(item => item.platform === filterPlatform);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'version') {
        comparison = (a.version || '').localeCompare(b.version || '');
      } else if (sortField === 'platform') {
        comparison = (a.platform || '').localeCompare(b.platform || '');
      } else if (sortField === 'updatedAt') {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        comparison = dateA - dateB;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [items, searchQuery, filterPlatform, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSave = async (payload: Partial<MobileAppConfig>) => {
    try {
      if (selected) {
        await updateM.mutateAsync({ id: selected.id, data: payload });
        toast.success('Config updated successfully');
      } else {
        await createM.mutateAsync(payload);
        toast.success('Config created successfully');
      }
      setShowModal(false);
      setSelected(null);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save config');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this config?')) return;
    try {
      await deleteM.mutateAsync(id);
      toast.success('Config deleted');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete config');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} config(s)?`)) return;

    try {
      await Promise.all(Array.from(selectedIds).map(id => deleteM.mutateAsync(id)));
      toast.success(`Deleted ${selectedIds.size} config(s)`);
      setSelectedIds(new Set());
    } catch (error: any) {
      toast.error('Failed to delete some configs');
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

  const openEditModal = (item: MobileAppConfig) => {
    setSelected(item);
    setShowModal(true);
  };

  const getPlatformColor = (platform: MobileAppConfig['platform']) => {
    switch (platform) {
      case 'ios':
        return 'bg-[rgba(var(--app-primary),0.15)] text-[rgb(var(--app-primary))]';
      case 'android':
        return 'bg-[rgba(var(--app-success),0.15)] text-[rgb(var(--app-success))]';
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
        <span>Settings</span>
        <span>/</span>
        <span className="text-[rgb(var(--app-text-primary))]">Mobile App Configs</span>
      </nav>

      {/* Page Header */}
      <PageHeader
        title="Mobile App Configs"
        subtitle="Manage mobile application configurations and feature flags"
        actions={
          <Button variant="primary" size="md" onClick={openNewModal}>
            <Plus size={16} />
            <span className="ml-2">New Config</span>
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
              placeholder="Search by version, platform, or feature flags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full pl-10"
            />
          </div>

          {/* Platform Filter */}
          <div className="sm:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="input w-full pl-10 appearance-none"
              >
                <option value="">All Platforms</option>
                <option value="ios">iOS</option>
                <option value="android">Android</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchQuery || filterPlatform) && (
            <Button
              variant="ghost"
              size="md"
              onClick={() => {
                setSearchQuery('');
                setFilterPlatform('');
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
      {configsQ.isLoading && <TableSkeleton rows={6} columns={5} />}

      {/* Error State */}
      {configsQ.error && (
        <div className="card">
          <div className="text-center py-8">
            <p className="text-[rgb(var(--app-error))]">Failed to load configs</p>
            <Button className="mt-4" variant="subtle" onClick={() => configsQ.refetch()}>
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!configsQ.isLoading && !configsQ.error && filteredItems.length === 0 && items.length === 0 && (
        <EmptyState
          icon={<Smartphone size={48} />}
          title="No mobile configs yet"
          description="Create mobile app configurations to manage feature flags and settings across platforms."
          action={
            <Button variant="primary" onClick={openNewModal}>
              <Plus size={16} className="mr-2" />
              Create Config
            </Button>
          }
        />
      )}

      {/* No Search Results */}
      {!configsQ.isLoading && !configsQ.error && filteredItems.length === 0 && items.length > 0 && (
        <EmptyState
          icon={<Search size={48} />}
          title="No configs found"
          description={`No configs match your search "${searchQuery}${filterPlatform ? ` for ${filterPlatform}` : ''}"`}
          action={
            <Button variant="subtle" onClick={() => { setSearchQuery(''); setFilterPlatform(''); }}>
              Clear Filters
            </Button>
          }
        />
      )}

      {/* Table */}
      {!configsQ.isLoading && !configsQ.error && filteredItems.length > 0 && (
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
                  <th className="px-4 py-3 cursor-pointer hover:text-[rgb(var(--app-text-primary))]" onClick={() => handleSort('version')}>
                    <div className="flex items-center gap-2">
                      Version
                      {sortField === 'version' && (
                        sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:text-[rgb(var(--app-text-primary))]" onClick={() => handleSort('platform')}>
                    <div className="flex items-center gap-2">
                      Platform
                      {sortField === 'platform' && (
                        sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3">Feature Flags</th>
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
                {filteredItems.map((config) => (
                  <tr key={config.id} className="hover:bg-[rgba(var(--app-surface-muted),0.4)] transition">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(config.id)}
                        onChange={() => toggleSelect(config.id)}
                        className="rounded border-[rgba(var(--app-border-subtle))]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Smartphone size={16} className="text-[rgb(var(--app-primary))]" />
                        <span className="font-medium text-[rgb(var(--app-text-primary))]">{config.version || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`chip ${getPlatformColor(config.platform)}`}>
                        {config.platform}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {Object.keys(config.features || {}).slice(0, 3).map((flag, idx) => (
                          <span
                            key={idx}
                            className="chip bg-[rgba(var(--app-primary),0.1)] text-[rgb(var(--app-primary))]"
                          >
                            {flag}
                          </span>
                        ))}
                        {Object.keys(config.features || {}).length > 3 && (
                          <span className="text-xs text-muted">
                            +{Object.keys(config.features || {}).length - 3} more
                          </span>
                        )}
                        {(!config.features || Object.keys(config.features).length === 0) && (
                          <span className="text-xs text-muted">No flags</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">
                      {config.updatedAt ? new Date(config.updatedAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(config)}
                          className="p-2 rounded-lg hover:bg-[rgba(var(--app-primary),0.1)] text-[rgb(var(--app-primary))] transition"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(config.id)}
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
            Showing {filteredItems.length} of {items.length} config(s)
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
  initial?: Partial<MobileAppConfig>;
  onClose: () => void;
  onSave: (payload: Partial<MobileAppConfig>) => void | Promise<void>;
  saving?: boolean;
}) {
  const [version, setVersion] = useState(initial?.version || '');
  const [platform, setPlatform] = useState<MobileAppConfig['platform']>(initial?.platform || 'ios');
  const [featuresStr, setFeaturesStr] = useState(Object.keys(initial?.features || {}).join(', '));
  const [errors, setErrors] = useState<{ version?: string; platform?: string }>({});

  if (!open) return null;

  const validate = () => {
    const newErrors: { version?: string; platform?: string } = {};
    if (!version.trim()) newErrors.version = 'Version is required';
    if (!platform) newErrors.platform = 'Platform is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const keys = featuresStr.split(',').map(s => s.trim()).filter(Boolean);
    const features: Record<string, boolean> = {};
    keys.forEach(k => (features[k] = true));

    onSave({
      version: version.trim(),
      platform,
      features
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="pb-4 border-b border-[rgba(var(--app-border-subtle))]">
          <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">
            {initial?.id ? 'Edit Config' : 'New Config'}
          </h2>
          <p className="text-sm text-muted mt-1">
            Configure mobile app settings and feature flags
          </p>
        </div>

        {/* Form */}
        <div className="py-6 space-y-5">
          <Field label="App Version" htmlFor="version" error={errors.version} required hint="e.g., 2.1.0">
            <input
              id="version"
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="input"
              placeholder="2.1.0"
            />
          </Field>

          <Field label="Platform" htmlFor="platform" error={errors.platform} required>
            <select
              id="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value as MobileAppConfig['platform'])}
              className="input"
            >
              <option value="ios">iOS</option>
              <option value="android">Android</option>
            </select>
          </Field>

          <Field
            label="Feature Flags"
            htmlFor="features"
            hint="Comma-separated list (e.g., darkMode, pushNotifications, analytics)"
          >
            <input
              id="features"
              type="text"
              value={featuresStr}
              onChange={(e) => setFeaturesStr(e.target.value)}
              className="input"
              placeholder="darkMode, pushNotifications, analytics"
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[rgba(var(--app-border-subtle))] flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Config'}
          </Button>
        </div>
      </div>
    </div>
  );
}
