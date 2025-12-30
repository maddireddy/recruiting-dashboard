import { useState, useMemo } from 'react';
import { Plus, Star, TrendingUp, Users, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { z } from 'zod';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import { useList, useCreate, useUpdate, useDelete } from '../services/hooks';
import { listScorecards, createScorecard, updateScorecard, deleteScorecard } from '../services/scorecard.service';
import type { Scorecard, ScorecardCriteria } from '../types/scorecard';

const criteriaSchema = z.object({
  name: z.string().min(1, 'Criteria name is required'),
  description: z.string().optional(),
  weight: z.number().min(1).max(10),
  maxScore: z.number().min(1).max(10),
});

const scorecardSchema = z.object({
  name: z.string().min(1, 'Scorecard name is required').max(200),
  description: z.string().optional(),
  role: z.string().optional(),
  criteria: z.array(criteriaSchema).min(1, 'At least one criteria is required'),
});

export default function ScorecardsPage() {
  const tenantId = useMemo(() => localStorage.getItem('tenantId') || undefined, []);
  const [selected, setSelected] = useState<Scorecard | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<Scorecard>>({ criteria: [] });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, isLoading, refetch } = useList<Scorecard[]>('scorecards', () => listScorecards(tenantId), tenantId);
  const { mutateAsync: create } = useCreate('scorecards', (payload: Partial<Scorecard>) => createScorecard(payload as any, tenantId), tenantId);
  const { mutateAsync: update } = useUpdate('scorecards', (id: string, payload: Partial<Scorecard>) => updateScorecard({ id, ...payload }, tenantId), tenantId);
  const { mutateAsync: remove } = useDelete('scorecards', (id: string) => deleteScorecard(id, tenantId), tenantId);

  const handleSubmit = async () => {
    try {
      scorecardSchema.parse(form);
      setErrors({});
      if (selected) {
        await update({ id: selected.id, data: form });
        toast.success('Scorecard updated successfully');
      } else {
        await create(form);
        toast.success('Scorecard created successfully');
      }
      setShowModal(false);
      setSelected(null);
      setForm({ criteria: [] });
      refetch();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          fieldErrors[err.path.join('.')] = err.message;
        });
        setErrors(fieldErrors);
        toast.error('Please fix the errors in the form');
      } else {
        toast.error('Failed to save scorecard');
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await remove(id);
      toast.success('Scorecard deleted successfully');
      refetch();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete scorecard');
    }
  };

  const addCriteria = () => {
    setForm({
      ...form,
      criteria: [...(form.criteria || []), { name: '', description: '', weight: 5, maxScore: 5 }],
    });
  };

  const removeCriteria = (index: number) => {
    const criteria = [...(form.criteria || [])];
    criteria.splice(index, 1);
    setForm({ ...form, criteria });
  };

  const updateCriteria = (index: number, field: keyof ScorecardCriteria, value: any) => {
    const criteria = [...(form.criteria || [])];
    criteria[index] = { ...criteria[index], [field]: value };
    setForm({ ...form, criteria });
  };

  const scorecards = data || [];
  const avgScore = scorecards.length > 0
    ? (scorecards.reduce((sum, s) => sum + (s.criteria?.reduce((cs, c) => cs + c.maxScore, 0) || 0), 0) / scorecards.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-10 px-6 py-8">
      <PageHeader
        title="Interview Scorecards"
        subtitle="Create evaluation templates with weighted criteria for consistent candidate assessment across your hiring team"
        actions={
          <Button variant="primary" size="md" onClick={() => { setSelected(null); setForm({ criteria: [] }); setShowModal(true); }}>
            <Plus size={16} />
            <span className="ml-2">New Scorecard</span>
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/15">
              <Star className="text-purple-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Total Templates</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">{scorecards.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/15">
              <TrendingUp className="text-green-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Avg Max Score</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">{avgScore}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15">
              <Users className="text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Total Criteria</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">
                {scorecards.reduce((sum, s) => sum + (s.criteria?.length || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="card space-y-3">
          <div className="h-4 w-40 animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
          <div className="h-4 w-full animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && scorecards.length === 0 && (
        <div className="card flex flex-col items-center justify-center gap-4 text-center py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-[rgba(var(--app-border-subtle))] text-muted">
            <Star size={28} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No scorecard templates yet</h3>
            <p className="max-w-sm text-sm text-muted">
              Create evaluation templates with weighted criteria to ensure consistent and objective candidate assessments.
            </p>
          </div>
          <button onClick={() => { setSelected(null); setForm({ criteria: [] }); setShowModal(true); }} type="button" className="btn-primary">
            <Plus size={16} />
            Create your first scorecard
          </button>
        </div>
      )}

      {/* Scorecards List */}
      {!isLoading && scorecards.length > 0 && (
        <div className="grid gap-4">
          {scorecards.map((scorecard: Scorecard) => {
            const totalWeight = scorecard.criteria?.reduce((sum, c) => sum + c.weight, 0) || 0;
            const maxPossibleScore = scorecard.criteria?.reduce((sum, c) => sum + c.maxScore, 0) || 0;

            return (
              <article key={scorecard.id} className="card border-transparent transition hover:border-[rgba(var(--app-primary-from),0.45)]">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 flex-1">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[rgba(var(--app-primary-from),0.15)]">
                        <Star className="text-[rgb(var(--app-primary-from))]" size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">{scorecard.name}</h3>
                        {scorecard.description && (
                          <p className="text-sm text-muted mt-1">{scorecard.description}</p>
                        )}
                        {scorecard.role && (
                          <p className="text-sm text-muted mt-1">For: {scorecard.role}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelected(scorecard);
                          setForm(scorecard);
                          setShowModal(true);
                        }}
                        type="button"
                        className="btn-muted px-3 py-2 text-sm"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(scorecard.id, scorecard.name)}
                        type="button"
                        className="rounded-lg border border-transparent px-3 py-2 text-sm text-red-400 transition hover:border-red-400/40 hover:bg-red-500/10"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 rounded-lg bg-[rgba(var(--app-surface-muted))] px-3 py-2">
                      <span className="text-muted">Criteria:</span>
                      <span className="font-semibold text-[rgb(var(--app-text-primary))]">{scorecard.criteria?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-[rgba(var(--app-surface-muted))] px-3 py-2">
                      <span className="text-muted">Total Weight:</span>
                      <span className="font-semibold text-[rgb(var(--app-text-primary))]">{totalWeight}</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-[rgba(var(--app-surface-muted))] px-3 py-2">
                      <span className="text-muted">Max Score:</span>
                      <span className="font-semibold text-[rgb(var(--app-text-primary))]">{maxPossibleScore}</span>
                    </div>
                  </div>

                  {/* Criteria Preview */}
                  {scorecard.criteria && scorecard.criteria.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Evaluation Criteria</p>
                      <div className="grid gap-2">
                        {scorecard.criteria.map((criteria, idx) => (
                          <div key={idx} className="rounded-lg border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted))] p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="font-medium text-[rgb(var(--app-text-primary))]">{criteria.name}</p>
                                {criteria.description && (
                                  <p className="text-sm text-muted mt-1">{criteria.description}</p>
                                )}
                              </div>
                              <div className="flex gap-3 text-sm">
                                <div className="text-right">
                                  <p className="text-muted text-xs">Weight</p>
                                  <p className="font-semibold text-[rgb(var(--app-text-primary))]">{criteria.weight}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-muted text-xs">Max</p>
                                  <p className="font-semibold text-[rgb(var(--app-text-primary))]">{criteria.maxScore}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
          <div className="card w-full max-w-4xl max-h-[90vh] overflow-hidden p-0">
            <div className="sticky top-0 flex items-center justify-between border-b border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface))] px-6 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {selected ? 'Edit Scorecard' : 'Create Scorecard'}
                </p>
                <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">Interview Scorecard</h2>
              </div>
              <button onClick={() => { setShowModal(false); setSelected(null); setForm({ criteria: [] }); setErrors({}); }} type="button" className="rounded-lg border border-transparent p-2 text-muted transition hover:border-[rgba(var(--app-border-subtle))]">
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-6" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-1">
                    Scorecard Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name || ''}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input w-full"
                    placeholder="e.g., Technical Interview - Senior Engineer"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-1">
                    Description
                  </label>
                  <textarea
                    value={form.description || ''}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="input w-full resize-none"
                    rows={3}
                    placeholder="Brief description of this scorecard..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-1">
                    Role/Position
                  </label>
                  <input
                    type="text"
                    value={form.role || ''}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="input w-full"
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
              </div>

              {/* Criteria */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">Evaluation Criteria</h3>
                  <button type="button" onClick={addCriteria} className="btn-muted px-3 py-2 text-sm">
                    <Plus size={16} />
                    Add Criteria
                  </button>
                </div>

                {(form.criteria || []).map((criteria, index) => (
                  <div key={index} className="rounded-lg border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted))] p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-1">
                            Criteria Name <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={criteria.name}
                            onChange={(e) => updateCriteria(index, 'name', e.target.value)}
                            className="input w-full"
                            placeholder="e.g., Problem Solving"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-1">
                            Description
                          </label>
                          <textarea
                            value={criteria.description || ''}
                            onChange={(e) => updateCriteria(index, 'description', e.target.value)}
                            className="input w-full resize-none"
                            rows={2}
                            placeholder="What to look for in this criteria..."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-1">
                              Weight (1-10)
                            </label>
                            <input
                              type="number"
                              value={criteria.weight}
                              onChange={(e) => updateCriteria(index, 'weight', parseInt(e.target.value) || 1)}
                              className="input w-full"
                              min="1"
                              max="10"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-1">
                              Max Score (1-10)
                            </label>
                            <input
                              type="number"
                              value={criteria.maxScore}
                              onChange={(e) => updateCriteria(index, 'maxScore', parseInt(e.target.value) || 1)}
                              className="input w-full"
                              min="1"
                              max="10"
                            />
                          </div>
                        </div>
                      </div>

                      {(form.criteria?.length || 0) > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCriteria(index)}
                          className="mt-6 rounded-lg border border-transparent p-2 text-red-400 transition hover:border-red-400/40 hover:bg-red-500/10"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface))] px-6 py-4">
              <button onClick={() => { setShowModal(false); setSelected(null); setForm({ criteria: [] }); setErrors({}); }} type="button" className="btn-muted">
                Cancel
              </button>
              <button onClick={handleSubmit} type="button" className="btn-primary">
                {selected ? 'Update Scorecard' : 'Create Scorecard'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
