import { useMemo, useState } from 'react';
import { ClipboardCheck, Plus, Search, Filter, ChevronDown, ChevronUp, Trash2, Edit } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { SkillsAssessment } from '../types/skillsAssessment';
import { skillsAssessmentService } from '../services/skillsAssessment.service';
import { useList, useCreate, useUpdate, useDelete } from '../services/hooks';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/LoadingStates';
import Field from '../components/ui/Field';

type SortField = 'name' | 'skillArea' | 'totalQuestions' | 'averageScore' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export default function SkillsAssessments() {
  const tenantId = useMemo(() => localStorage.getItem('tenantId') || undefined, []);
  const [selected, setSelected] = useState<SkillsAssessment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSkillArea, setFilterSkillArea] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const { data, isLoading, error, refetch } = useList<SkillsAssessment[]>('skillsAssessments', () => skillsAssessmentService.list(tenantId), tenantId);
  const createM = useCreate('skillsAssessments', (payload: Partial<SkillsAssessment>) => skillsAssessmentService.create(payload, tenantId), tenantId);
  const updateM = useUpdate('skillsAssessments', (id: string, payload: Partial<SkillsAssessment>) => skillsAssessmentService.update(id, payload, tenantId), tenantId);
  const deleteM = useDelete('skillsAssessments', (id: string) => skillsAssessmentService.delete(id, tenantId), tenantId);

  const items = useMemo(() => data || [], [data]);

  // Extract unique skill areas
  const allSkillAreas = useMemo(() => {
    const areas = new Set<string>();
    items.forEach(item => {
      if (item.skillArea) areas.add(item.skillArea);
    });
    return Array.from(areas).sort();
  }, [items]);

  // Filter and sort
  const filteredItems = useMemo(() => {
    let filtered = items;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.skillArea?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterSkillArea) {
      filtered = filtered.filter(item => item.skillArea === filterSkillArea);
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = (a.name || '').localeCompare(b.name || '');
      } else if (sortField === 'skillArea') {
        comparison = (a.skillArea || '').localeCompare(b.skillArea || '');
      } else if (sortField === 'totalQuestions') {
        comparison = (a.totalQuestions ?? 0) - (b.totalQuestions ?? 0);
      } else if (sortField === 'averageScore') {
        comparison = (a.averageScore ?? 0) - (b.averageScore ?? 0);
      } else if (sortField === 'createdAt') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        comparison = dateA - dateB;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [items, searchQuery, filterSkillArea, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSave = async (payload: Partial<SkillsAssessment>) => {
    try {
      if (selected) {
        await updateM.mutateAsync({ id: selected.id, data: payload });
        toast.success('Assessment updated');
      } else {
        await createM.mutateAsync(payload);
        toast.success('Assessment created');
      }
      setShowModal(false);
      setSelected(null);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save assessment');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this assessment?')) return;
    try {
      await deleteM.mutateAsync(id);
      toast.success('Assessment deleted');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} assessment(s)?`)) return;
    try {
      await Promise.all(Array.from(selectedIds).map(id => deleteM.mutateAsync(id)));
      toast.success(`Deleted ${selectedIds.size} assessment(s)`);
      setSelectedIds(new Set());
    } catch (e: any) {
      toast.error('Failed to delete some assessments');
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

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-muted';
    if (score >= 80) return 'text-[rgb(var(--app-success))]';
    if (score >= 60) return 'text-[rgb(var(--app-warning))]';
    return 'text-[rgb(var(--app-error))]';
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted">
        <span>Dashboard</span>
        <span>/</span>
        <span className="text-[rgb(var(--app-text-primary))]">Skills Assessments</span>
      </nav>

      {/* Page Header */}
      <PageHeader
        title="Skills Assessments"
        subtitle="Create and manage technical skills assessments for evaluating candidate competencies"
        actions={
          <Button variant="primary" size="md" onClick={() => { setSelected(null); setShowModal(true); }}>
            <Plus size={16} />
            <span className="ml-2">New Assessment</span>
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
              placeholder="Search by name or skill area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full pl-10"
            />
          </div>

          <div className="sm:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <select
                value={filterSkillArea}
                onChange={(e) => setFilterSkillArea(e.target.value)}
                className="input w-full pl-10 appearance-none"
              >
                <option value="">All Skill Areas</option>
                {allSkillAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          </div>

          {(searchQuery || filterSkillArea) && (
            <Button variant="ghost" size="md" onClick={() => { setSearchQuery(''); setFilterSkillArea(''); }}>
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
          <p className="text-[rgb(var(--app-error))]">Failed to load assessments</p>
          <Button className="mt-4" variant="subtle" onClick={() => refetch()}>Try Again</Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredItems.length === 0 && items.length === 0 && (
        <EmptyState
          icon={<ClipboardCheck size={48} />}
          title="No skills assessments yet"
          description="Create technical skills assessments to evaluate candidate competencies across different skill areas and track average scores"
          action={
            <Button variant="primary" onClick={() => { setSelected(null); setShowModal(true); }}>
              <Plus size={16} className="mr-2" />
              Create Assessment
            </Button>
          }
        />
      )}

      {/* No Search Results */}
      {!isLoading && !error && filteredItems.length === 0 && items.length > 0 && (
        <EmptyState
          icon={<Search size={48} />}
          title="No assessments found"
          description={`No assessments match "${searchQuery}"${filterSkillArea ? ` in ${filterSkillArea}` : ''}`}
          action={
            <Button variant="subtle" onClick={() => { setSearchQuery(''); setFilterSkillArea(''); }}>
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
                  <th className="px-4 py-3 cursor-pointer hover:text-[rgb(var(--app-text-primary))]" onClick={() => handleSort('skillArea')}>
                    <div className="flex items-center gap-2">
                      Skill Area
                      {sortField === 'skillArea' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:text-[rgb(var(--app-text-primary))]" onClick={() => handleSort('totalQuestions')}>
                    <div className="flex items-center gap-2">
                      Questions
                      {sortField === 'totalQuestions' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:text-[rgb(var(--app-text-primary))]" onClick={() => handleSort('averageScore')}>
                    <div className="flex items-center gap-2">
                      Avg Score
                      {sortField === 'averageScore' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
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
                        <ClipboardCheck size={16} className="text-[rgb(var(--app-primary))]" />
                        <span className="font-medium text-[rgb(var(--app-text-primary))]">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="chip bg-[rgba(var(--app-primary),0.15)] text-[rgb(var(--app-primary))]">
                        {item.skillArea}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">
                      {item.totalQuestions ?? '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold ${getScoreColor(item.averageScore)}`}>
                        {item.averageScore != null ? `${item.averageScore}%` : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
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
            Showing {filteredItems.length} of {items.length} assessment(s)
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && <EditModal selected={selected} onClose={() => { setShowModal(false); setSelected(null); }} onSave={handleSave} saving={createM.isPending || updateM.isPending} />}
    </div>
  );
}

function EditModal({ selected, onClose, onSave, saving }: {
  selected: SkillsAssessment | null;
  onClose: () => void;
  onSave: (payload: Partial<SkillsAssessment>) => void | Promise<void>;
  saving?: boolean;
}) {
  const [name, setName] = useState(selected?.name || '');
  const [skillArea, setSkillArea] = useState(selected?.skillArea || '');
  const [totalQuestions, setTotalQuestions] = useState<number>(selected?.totalQuestions ?? 0);
  const [errors, setErrors] = useState<{ name?: string; skillArea?: string; totalQuestions?: string }>({});

  const validate = () => {
    const newErrors: { name?: string; skillArea?: string; totalQuestions?: string } = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!skillArea.trim()) newErrors.skillArea = 'Skill area is required';
    if (totalQuestions < 1) newErrors.totalQuestions = 'Must have at least 1 question';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({ name: name.trim(), skillArea: skillArea.trim(), totalQuestions });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-lg">
        <div className="pb-4 border-b border-[rgba(var(--app-border-subtle))]">
          <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">
            {selected ? 'Edit Assessment' : 'New Skills Assessment'}
          </h2>
          <p className="text-sm text-muted mt-1">
            Create a technical skills assessment to evaluate candidates
          </p>
        </div>

        <div className="py-6 space-y-5">
          <Field label="Assessment Name" htmlFor="name" error={errors.name} required>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="e.g., JavaScript Fundamentals"
            />
          </Field>

          <Field label="Skill Area" htmlFor="skillArea" error={errors.skillArea} required>
            <input
              id="skillArea"
              type="text"
              value={skillArea}
              onChange={(e) => setSkillArea(e.target.value)}
              className="input"
              placeholder="e.g., Frontend Development"
            />
          </Field>

          <Field label="Total Questions" htmlFor="totalQuestions" error={errors.totalQuestions} required>
            <input
              id="totalQuestions"
              type="number"
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(Number(e.target.value))}
              className="input"
              placeholder="10"
              min="1"
            />
          </Field>
        </div>

        <div className="pt-4 border-t border-[rgba(var(--app-border-subtle))] flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Assessment'}
          </Button>
        </div>
      </div>
    </div>
  );
}
