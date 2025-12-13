import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import type { InterviewGuide } from '../types/interviewGuide';
import { listInterviewGuides, createInterviewGuide, updateInterviewGuide, deleteInterviewGuide } from '../services/interviewGuide.service';
import { useList, useCreate, useUpdate, useDelete } from '../services/hooks';

export default function InterviewGuides() {
  const tenantId = useMemo(() => localStorage.getItem('tenantId') || undefined, []);
  const [selected, setSelected] = useState<InterviewGuide | null>(null);
  const [form, setForm] = useState<Partial<InterviewGuide>>({ sections: [] });

  const { data, isLoading, refetch } = useList<InterviewGuide[]>('interviewGuides', () => listInterviewGuides(tenantId), tenantId);
  const { mutateAsync: create } = useCreate('interviewGuides', (payload: Partial<InterviewGuide>) => createInterviewGuide(payload as any, tenantId), tenantId);
  const { mutateAsync: update } = useUpdate('interviewGuides', (id: string, payload: Partial<InterviewGuide>) => updateInterviewGuide({ id, ...payload }, tenantId), tenantId);
  const { mutateAsync: remove } = useDelete('interviewGuides', (id: string) => deleteInterviewGuide(id, tenantId), tenantId);

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
      setForm({ sections: [] });
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
        <h1 className="text-2xl font-semibold">Interview Guides</h1>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setForm({ sections: [] }); }}>New</button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((item: InterviewGuide) => (
              <tr key={item.id} className="border-t">
                <td className="p-2">{item.name}</td>
                <td className="p-2">{item.role}</td>
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
            <h2 className="text-lg font-medium mb-3">{selected ? 'Edit' : 'Create'} Guide</h2>
            <div className="space-y-3">
              <input
                className="input w-full"
                placeholder="Name"
                value={form.name || ''}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              <input
                className="input w-full"
                placeholder="Role"
                value={form.role || ''}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="btn" onClick={() => { setSelected(null); setForm({ sections: [] }); }}>Cancel</button>
              <button className="btn btn-primary" onClick={onSubmit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
