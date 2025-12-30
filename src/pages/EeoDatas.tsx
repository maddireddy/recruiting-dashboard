import { useMemo, useState } from 'react';
import { Shield, Plus, Search, Trash2, Edit, BarChart3 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useList, useCreate, useUpdate, useDelete } from '../services/hooks';
import { eeoService } from '../services/eeo.service';
import type { EeoRecord, EeoReport } from '../types/eeo';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/LoadingStates';
import Field from '../components/ui/Field';

export default function EeoDatasPage() {
  const tenantId = localStorage.getItem('tenantId') || undefined;
  const [selected, setSelected] = useState<EeoRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const listQ = useList<EeoRecord[]>('eeo-records', () => eeoService.list(tenantId), tenantId);
  const createM = useCreate<Partial<EeoRecord>, EeoRecord>('eeo-records', eeoService.create, tenantId);
  const updateM = useUpdate<Partial<EeoRecord>, EeoRecord>('eeo-records', eeoService.update, tenantId);
  const deleteM = useDelete('eeo-records', eeoService.delete, tenantId);

  const reportQ = useList<EeoReport>('eeo-report', () => eeoService.report(tenantId), tenantId);

  const items = useMemo(() => listQ.data || [], [listQ.data]);
  const report = useMemo(() => reportQ.data, [reportQ.data]);

  // Filter items
  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    return items.filter(item =>
      item.candidateId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.gender?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ethnicity?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  const handleSave = async (payload: Partial<EeoRecord>) => {
    try {
      if (selected) {
        await updateM.mutateAsync({ id: selected.id, data: payload });
        toast.success('EEO record updated');
      } else {
        await createM.mutateAsync(payload);
        toast.success('EEO record created');
      }
      setShowModal(false);
      setSelected(null);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save record');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this EEO record?')) return;
    try {
      await deleteM.mutateAsync(id);
      toast.success('EEO record deleted');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted">
        <span>Dashboard</span>
        <span>/</span>
        <span className="text-[rgb(var(--app-text-primary))]">EEO Data</span>
      </nav>

      {/* Page Header */}
      <PageHeader
        title="EEO Data"
        subtitle="Equal Employment Opportunity data collection and compliance reporting"
        actions={
          <Button variant="primary" size="md" onClick={() => { setSelected(null); setShowModal(true); }}>
            <Plus size={16} />
            <span className="ml-2">New Record</span>
          </Button>
        }
      />

      {/* Search */}
      <div className="card">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            placeholder="Search by candidate ID, gender, or ethnicity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Table Section */}
        <div className="lg:col-span-2">
          {/* Loading State */}
          {listQ.isLoading && <TableSkeleton rows={8} columns={6} />}

          {/* Error State */}
          {listQ.error && (
            <div className="card text-center py-8">
              <p className="text-[rgb(var(--app-error))]">Failed to load EEO records</p>
              <Button className="mt-4" variant="subtle" onClick={() => listQ.refetch()}>Try Again</Button>
            </div>
          )}

          {/* Empty State */}
          {!listQ.isLoading && !listQ.error && filteredItems.length === 0 && items.length === 0 && (
            <EmptyState
              icon={<Shield size={48} />}
              title="No EEO records yet"
              description="Start collecting Equal Employment Opportunity data to ensure compliance and generate diversity reports"
              action={
                <Button variant="primary" onClick={() => { setSelected(null); setShowModal(true); }}>
                  <Plus size={16} className="mr-2" />
                  Add EEO Record
                </Button>
              }
            />
          )}

          {/* No Search Results */}
          {!listQ.isLoading && !listQ.error && filteredItems.length === 0 && items.length > 0 && (
            <EmptyState
              icon={<Search size={48} />}
              title="No records found"
              description={`No records match "${searchQuery}"`}
              action={
                <Button variant="subtle" onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              }
              variant="compact"
            />
          )}

          {/* Table */}
          {!listQ.isLoading && !listQ.error && filteredItems.length > 0 && (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[rgb(var(--app-surface-muted))] text-left text-xs font-semibold uppercase tracking-wider text-muted border-b border-[rgba(var(--app-border-subtle))]">
                    <tr>
                      <th className="px-4 py-3">Candidate</th>
                      <th className="px-4 py-3">Gender</th>
                      <th className="px-4 py-3">Ethnicity</th>
                      <th className="px-4 py-3">Veteran</th>
                      <th className="px-4 py-3">Disability</th>
                      <th className="px-4 py-3">Collected</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(var(--app-border-subtle))]">
                    {filteredItems.map((r) => (
                      <tr key={r.id} className="hover:bg-[rgba(var(--app-surface-muted),0.4)] transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Shield size={14} className="text-[rgb(var(--app-primary))]" />
                            <span className="font-medium text-[rgb(var(--app-text-primary))]">{r.candidateId}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted">{r.gender || '-'}</td>
                        <td className="px-4 py-3 text-muted">{r.ethnicity || '-'}</td>
                        <td className="px-4 py-3 text-muted">{r.veteranStatus || '-'}</td>
                        <td className="px-4 py-3 text-muted">{r.disabilityStatus || '-'}</td>
                        <td className="px-4 py-3 text-muted text-xs">
                          {new Date(r.collectedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { setSelected(r); setShowModal(true); }}
                              className="p-2 rounded-lg hover:bg-[rgba(var(--app-primary),0.1)] text-[rgb(var(--app-primary))] transition"
                              title="Edit"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(r.id)}
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
                Showing {filteredItems.length} of {items.length} record(s)
              </div>
            </div>
          )}
        </div>

        {/* Report Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-6">
            <div className="pb-4 border-b border-[rgba(var(--app-border-subtle))]">
              <div className="flex items-center gap-2">
                <BarChart3 size={20} className="text-[rgb(var(--app-primary))]" />
                <h2 className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">EEO Report</h2>
              </div>
              <p className="text-xs text-muted mt-1">Diversity metrics summary</p>
            </div>

            <div className="mt-4 space-y-6">
              {reportQ.isLoading && <div className="text-sm text-muted">Loading report...</div>}
              {reportQ.error && <div className="text-sm text-[rgb(var(--app-error))]">Failed to load report</div>}
              {report && (
                <>
                  <Aggregate title="Gender" items={report.byGender} />
                  <Aggregate title="Ethnicity" items={report.byEthnicity} />
                  <Aggregate title="Veteran Status" items={report.byVeteranStatus} />
                  <Aggregate title="Disability Status" items={report.byDisabilityStatus} />
                  <p className="text-xs text-muted pt-4 border-t border-[rgba(var(--app-border-subtle))]">
                    Generated {new Date(report.generatedAt).toLocaleString()}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

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

function Aggregate({ title, items }: { title: string; items: { label: string; count: number; percent?: number }[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-[rgb(var(--app-text-primary))] mb-3">{title}</h3>
      <div className="space-y-3">
        {items.map((i, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">{i.label}</span>
              <span className="font-medium text-[rgb(var(--app-text-primary))]">
                {i.count} {i.percent != null ? `(${i.percent}%)` : ''}
              </span>
            </div>
            <div className="h-2 rounded-full bg-[rgba(var(--app-border-subtle),0.5)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[rgb(var(--app-primary))] transition-all"
                style={{ width: `${i.percent ?? Math.min(100, i.count * 10)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EditModal({ selected, onClose, onSave, saving }: {
  selected: EeoRecord | null;
  onClose: () => void;
  onSave: (payload: Partial<EeoRecord>) => void | Promise<void>;
  saving?: boolean;
}) {
  const [candidateId, setCandidateId] = useState(selected?.candidateId || '');
  const [gender, setGender] = useState(selected?.gender || '');
  const [ethnicity, setEthnicity] = useState(selected?.ethnicity || '');
  const [veteranStatus, setVeteranStatus] = useState(selected?.veteranStatus || '');
  const [disabilityStatus, setDisabilityStatus] = useState(selected?.disabilityStatus || '');
  const [errors, setErrors] = useState<{ candidateId?: string }>({});

  const validate = () => {
    const newErrors: { candidateId?: string } = {};
    if (!candidateId.trim()) newErrors.candidateId = 'Candidate ID is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({
      candidateId: candidateId.trim(),
      gender: gender.trim() || undefined,
      ethnicity: ethnicity.trim() || undefined,
      veteranStatus: veteranStatus.trim() || undefined,
      disabilityStatus: disabilityStatus.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-lg">
        <div className="pb-4 border-b border-[rgba(var(--app-border-subtle))]">
          <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">
            {selected?.id ? 'Edit EEO Record' : 'New EEO Record'}
          </h2>
          <p className="text-sm text-muted mt-1">
            Equal Employment Opportunity data collection
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

          <div className="grid grid-cols-2 gap-4">
            <Field label="Gender" htmlFor="gender">
              <input
                id="gender"
                type="text"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="input"
                placeholder="Optional"
              />
            </Field>

            <Field label="Ethnicity" htmlFor="ethnicity">
              <input
                id="ethnicity"
                type="text"
                value={ethnicity}
                onChange={(e) => setEthnicity(e.target.value)}
                className="input"
                placeholder="Optional"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Veteran Status" htmlFor="veteranStatus">
              <input
                id="veteranStatus"
                type="text"
                value={veteranStatus}
                onChange={(e) => setVeteranStatus(e.target.value)}
                className="input"
                placeholder="Optional"
              />
            </Field>

            <Field label="Disability Status" htmlFor="disabilityStatus">
              <input
                id="disabilityStatus"
                type="text"
                value={disabilityStatus}
                onChange={(e) => setDisabilityStatus(e.target.value)}
                className="input"
                placeholder="Optional"
              />
            </Field>
          </div>

          <div className="p-3 rounded-lg bg-[rgba(var(--app-primary),0.1)] border border-[rgba(var(--app-primary),0.3)]">
            <p className="text-xs text-muted">
              <strong className="text-[rgb(var(--app-text-primary))]">Note:</strong> EEO data is collected voluntarily and kept confidential. It's used solely for compliance and diversity reporting.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-[rgba(var(--app-border-subtle))] flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Record'}
          </Button>
        </div>
      </div>
    </div>
  );
}
