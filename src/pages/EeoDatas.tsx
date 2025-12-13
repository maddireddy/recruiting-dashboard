import { useMemo, useState } from 'react';
import { useList, useCreate, useUpdate, useDelete } from '../services/hooks';
import { eeoService } from '../services/eeo.service';
import type { EeoRecord, EeoReport } from '../types/eeo';

export default function EeoDatasPage() {
  const tenantId = localStorage.getItem('tenantId') || undefined;
  const [selected, setSelected] = useState<EeoRecord | null>(null);

  const listQ = useList<EeoRecord[]>('eeo-records', () => eeoService.list(tenantId), tenantId);
  const createM = useCreate<Partial<EeoRecord>, EeoRecord>('eeo-records', eeoService.create, tenantId);
  const updateM = useUpdate<Partial<EeoRecord>, EeoRecord>('eeo-records', eeoService.update, tenantId);
  const deleteM = useDelete('eeo-records', eeoService.delete, tenantId);

  const reportQ = useList<EeoReport>('eeo-report', () => eeoService.report(tenantId), tenantId);

  const items = useMemo(() => listQ.data || [], [listQ.data]);
  const report = useMemo(() => reportQ.data, [reportQ.data]);

  const handleSave = async (payload: Partial<EeoRecord>) => {
    if (selected) {
      await updateM.mutateAsync({ id: selected.id, data: payload });
    } else {
      await createM.mutateAsync(payload);
    }
    setSelected(null);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">EEO Data</h1>
        <button className="btn-primary" onClick={() => setSelected(null)}>New Record</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div className="overflow-x-auto bg-white rounded border">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-2">Candidate</th>
                  <th className="text-left p-2">Gender</th>
                  <th className="text-left p-2">Ethnicity</th>
                  <th className="text-left p-2">Veteran</th>
                  <th className="text-left p-2">Disability</th>
                  <th className="text-left p-2">Collected</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td className="p-2">{r.candidateId}</td>
                    <td className="p-2">{r.gender || '-'}</td>
                    <td className="p-2">{r.ethnicity || '-'}</td>
                    <td className="p-2">{r.veteranStatus || '-'}</td>
                    <td className="p-2">{r.disabilityStatus || '-'}</td>
                    <td className="p-2">{new Date(r.collectedAt).toLocaleString()}</td>
                    <td className="p-2 space-x-2">
                      <button className="btn-muted" onClick={() => setSelected(r)}>Edit</button>
                      <button className="btn-muted text-red-500" onClick={async () => { await deleteM.mutateAsync(r.id); }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="card p-4">
            <h2 className="font-semibold mb-2">EEO Report</h2>
            {reportQ.isLoading && <div>Loading…</div>}
            {reportQ.error && <div className="text-red-500">Failed to load report</div>}
            {report && (
              <div className="space-y-4">
                <Aggregate title="Gender" items={report.byGender} />
                <Aggregate title="Ethnicity" items={report.byEthnicity} />
                <Aggregate title="Veteran Status" items={report.byVeteranStatus} />
                <Aggregate title="Disability Status" items={report.byDisabilityStatus} />
                <p className="text-xs text-muted">Generated {new Date(report.generatedAt).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <EditModal
        open={selected !== null}
        initial={selected || undefined}
        onClose={() => setSelected(null)}
        onSave={handleSave}
        saving={createM.isPending || updateM.isPending}
      />
    </div>
  );
}

function Aggregate({ title, items }: { title: string; items: { label: string; count: number; percent?: number }[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-1">{title}</h3>
      <div className="space-y-1">
        {items.map((i, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="h-3 rounded bg-indigo-500" style={{ width: `${i.percent ?? Math.min(100, i.count)}%` }} />
            <div className="text-sm">{i.label} — {i.count}{i.percent != null ? ` (${i.percent}%)` : ''}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EditModal({ open, initial, onClose, onSave, saving }: {
  open: boolean;
  initial?: Partial<EeoRecord>;
  onClose: () => void;
  onSave: (payload: Partial<EeoRecord>) => void | Promise<void>;
  saving?: boolean;
}) {
  const [gender, setGender] = useState(initial?.gender || '');
  const [ethnicity, setEthnicity] = useState(initial?.ethnicity || '');
  const [veteranStatus, setVeteranStatus] = useState(initial?.veteranStatus || '');
  const [disabilityStatus, setDisabilityStatus] = useState(initial?.disabilityStatus || '');

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded shadow-lg w-full max-w-lg">
        <div className="p-4 border-b">
          <h2 className="font-semibold">{initial?.id ? 'Edit EEO Record' : 'New EEO Record'}</h2>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Gender</label>
              <input value={gender} onChange={(e) => setGender(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm mb-1">Ethnicity</label>
              <input value={ethnicity} onChange={(e) => setEthnicity(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Veteran Status</label>
              <input value={veteranStatus} onChange={(e) => setVeteranStatus(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm mb-1">Disability Status</label>
              <input value={disabilityStatus} onChange={(e) => setDisabilityStatus(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
          </div>
        </div>
        <div className="p-4 border-t flex justify-end space-x-2">
          <button className="px-3 py-2 rounded bg-gray-100" onClick={onClose}>Cancel</button>
          <button
            className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={saving}
            onClick={() => onSave({ gender, ethnicity, veteranStatus, disabilityStatus })}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
