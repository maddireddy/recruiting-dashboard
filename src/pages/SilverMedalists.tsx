import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import type { SilverMedalist } from '../types/silverMedalist';
import { listSilverMedalists, createSilverMedalist, updateSilverMedalist, deleteSilverMedalist, reengageSilverMedalist } from '../services/silverMedalist.service';
import { useList, useCreate, useUpdate, useDelete } from '../services/hooks';

export default function SilverMedalists() {
  const tenantId = useMemo(() => localStorage.getItem('tenantId') || undefined, []);
  const [selected, setSelected] = useState<SilverMedalist | null>(null);
  const [form, setForm] = useState<Partial<SilverMedalist>>({});

  const { data, isLoading, refetch } = useList<SilverMedalist[]>('silverMedalists', () => listSilverMedalists(tenantId), tenantId);
  const { mutateAsync: create } = useCreate('silverMedalists', (payload: Partial<SilverMedalist>) => createSilverMedalist(payload as any, tenantId), tenantId);
  const { mutateAsync: update } = useUpdate('silverMedalists', (id: string, payload: Partial<SilverMedalist>) => updateSilverMedalist({ id, ...payload }, tenantId), tenantId);
  const { mutateAsync: remove } = useDelete('silverMedalists', (id: string) => deleteSilverMedalist(id, tenantId), tenantId);

  const onSubmit = async () => {
    try {
      if (selected) {
        await update({ id: selected.id, data: form });
        toast.success('Updated');
      } else {
        await create(form);
        toast.success('Created');
      }
      setSelected(null);
      setForm({});
      refetch();
    } catch (e: any) {
      toast.error(e?.message || 'Action failed');
    }
  };

  const onDelete = async (id: string) => {
    try {
      await remove(id);
      toast.success('Deleted');
      refetch();
    } catch (e: any) {
      toast.error(e?.message || 'Delete failed');
    }
  };

  const onReengage = async (item: SilverMedalist) => {
    try {
      await reengageSilverMedalist(item.id, tenantId);
      toast.success('Re-engagement triggered');
      refetch();
    } catch (e: any) {
      toast.error(e?.message || 'Re-engage failed');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Silver Medalists</h1>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setForm({}); }}>New</button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left">Candidate</th>
              <th className="p-2 text-left">Job</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Notes</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((item: SilverMedalist) => (
              <tr key={item.id} className="border-t">
                <td className="p-2">{item.candidateName || item.candidateId}</td>
                <td className="p-2">{item.jobTitle || item.jobId}</td>
                <td className="p-2 capitalize">{item.status}</td>
                <td className="p-2">{item.notes}</td>
                <td className="p-2 space-x-2">
                  <button className="btn btn-sm" onClick={() => { setSelected(item); setForm(item); }}>Edit</button>
                  <button className="btn btn-sm btn-secondary" onClick={() => onReengage(item)}>Re-engage</button>
                  <button className="btn btn-sm btn-danger" onClick={() => onDelete(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Simple Modal */}
      {(selected !== null || Object.keys(form).length > 0) && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-md w-full max-w-md">
            <h2 className="text-lg font-medium mb-3">{selected ? 'Edit' : 'Create'} Silver Medalist</h2>
            <div className="space-y-3">
              <input
                className="input w-full"
                placeholder="Candidate ID"
                value={form.candidateId || ''}
                onChange={(e) => setForm((f) => ({ ...f, candidateId: e.target.value }))}
              />
              <input
                className="input w-full"
                placeholder="Job ID"
                value={form.jobId || ''}
                onChange={(e) => setForm((f) => ({ ...f, jobId: e.target.value }))}
              />
              <select
                className="input w-full"
                value={form.status || 'pending'}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as SilverMedalist['status'] }))}
              >
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="reengaged">Reengaged</option>
                <option value="archived">Archived</option>
              </select>
              <textarea
                className="input w-full"
                placeholder="Notes"
                value={form.notes || ''}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="btn" onClick={() => { setSelected(null); setForm({}); }}>Cancel</button>
              <button className="btn btn-primary" onClick={onSubmit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
