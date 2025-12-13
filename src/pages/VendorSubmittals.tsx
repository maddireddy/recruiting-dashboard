import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import type { VendorSubmittal } from '../types/vendorSubmittal';
import { vendorSubmittalService } from '../services/vendorSubmittal.service';
import { useList, useCreate, useUpdate, useDelete } from '../services/hooks';

export default function VendorSubmittals() {
  const tenantId = useMemo(() => localStorage.getItem('tenantId') || undefined, []);
  const [selected, setSelected] = useState<VendorSubmittal | null>(null);
  const [form, setForm] = useState<Partial<VendorSubmittal>>({});

  const { data, isLoading, refetch } = useList<VendorSubmittal[]>('vendorSubmittals', () => vendorSubmittalService.list(tenantId), tenantId);
  const { mutateAsync: create } = useCreate('vendorSubmittals', (payload: Partial<VendorSubmittal>) => vendorSubmittalService.create(payload, tenantId), tenantId);
  const { mutateAsync: update } = useUpdate('vendorSubmittals', (id: string, payload: Partial<VendorSubmittal>) => vendorSubmittalService.update(id, payload, tenantId), tenantId);
  const { mutateAsync: remove } = useDelete('vendorSubmittals', (id: string) => vendorSubmittalService.delete(id, tenantId), tenantId);

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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Vendor Submittals</h1>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setForm({}); }}>New</button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left">Vendor</th>
              <th className="p-2 text-left">Candidate</th>
              <th className="p-2 text-left">Job</th>
              <th className="p-2 text-left">Rate</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((item: VendorSubmittal) => (
              <tr key={item.id} className="border-t">
                <td className="p-2">{item.vendorName}</td>
                <td className="p-2">{item.candidateName || item.candidateId}</td>
                <td className="p-2">{item.jobTitle || item.jobId}</td>
                <td className="p-2">{item.rate ?? '-'}</td>
                <td className="p-2 capitalize">{item.status}</td>
                <td className="p-2 space-x-2">
                  <button className="btn btn-sm" onClick={() => { setSelected(item); setForm(item); }}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => onDelete(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {(selected !== null || Object.keys(form).length > 0) && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-md w-full max-w-md">
            <h2 className="text-lg font-medium mb-3">{selected ? 'Edit' : 'Create'} Submittal</h2>
            <div className="space-y-3">
              <input
                className="input w-full"
                placeholder="Vendor Name"
                value={form.vendorName || ''}
                onChange={(e) => setForm((f) => ({ ...f, vendorName: e.target.value }))}
              />
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
              <input
                className="input w-full"
                placeholder="Rate"
                type="number"
                value={form.rate ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, rate: Number(e.target.value) }))}
              />
              <select
                className="input w-full"
                value={form.status || 'submitted'}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as VendorSubmittal['status'] }))}
              >
                <option value="submitted">Submitted</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
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

