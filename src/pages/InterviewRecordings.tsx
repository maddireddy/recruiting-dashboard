import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import type { InterviewRecording } from '../types/interviewRecording';
import { listInterviewRecordings, createInterviewRecording, updateInterviewRecording, deleteInterviewRecording } from '../services/interviewRecording.service';
import { useList, useCreate, useUpdate, useDelete } from '../services/hooks';

export default function InterviewRecordings() {
  const tenantId = useMemo(() => localStorage.getItem('tenantId') || undefined, []);
  const [selected, setSelected] = useState<InterviewRecording | null>(null);
  const [form, setForm] = useState<Partial<InterviewRecording>>({});

  const { data, isLoading, refetch } = useList<InterviewRecording[]>('interviewRecordings', () => listInterviewRecordings(tenantId), tenantId);
  const { mutateAsync: create } = useCreate('interviewRecordings', (payload: Partial<InterviewRecording>) => createInterviewRecording(payload as any, tenantId), tenantId);
  const { mutateAsync: update } = useUpdate('interviewRecordings', (id: string, payload: Partial<InterviewRecording>) => updateInterviewRecording({ id, ...payload }, tenantId), tenantId);
  const { mutateAsync: remove } = useDelete('interviewRecordings', (id: string) => deleteInterviewRecording(id, tenantId), tenantId);

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
        <h1 className="text-2xl font-semibold">Interview Recordings</h1>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setForm({}); }}>New</button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left">Candidate</th>
              <th className="p-2 text-left">Interview</th>
              <th className="p-2 text-left">Duration (s)</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((item: InterviewRecording) => (
              <tr key={item.id} className="border-t">
                <td className="p-2">{item.candidateName || item.candidateId}</td>
                <td className="p-2">{item.interviewId}</td>
                <td className="p-2">{item.durationSeconds ?? '-'}</td>
                <td className="p-2 space-x-2">
                  <a className="btn btn-sm" href={item.url} target="_blank" rel="noreferrer">Play</a>
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
            <h2 className="text-lg font-medium mb-3">{selected ? 'Edit' : 'Create'} Recording</h2>
            <div className="space-y-3">
              <input
                className="input w-full"
                placeholder="Candidate ID"
                value={form.candidateId || ''}
                onChange={(e) => setForm((f) => ({ ...f, candidateId: e.target.value }))}
              />
              <input
                className="input w-full"
                placeholder="Interview ID"
                value={form.interviewId || ''}
                onChange={(e) => setForm((f) => ({ ...f, interviewId: e.target.value }))}
              />
              <input
                className="input w-full"
                placeholder="URL"
                value={form.url || ''}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              />
              <input
                className="input w-full"
                placeholder="Duration Seconds"
                type="number"
                value={form.durationSeconds ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, durationSeconds: Number(e.target.value) }))}
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
