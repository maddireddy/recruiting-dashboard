import { useMemo, useState } from 'react';
import { useList, useCreate, useUpdate, useDelete } from '../services/hooks';
import { candidateSourcingService } from '../services/candidateSourcing.service';
import type { CandidateSourcingTask, SourcingStatus } from '../types/candidateSourcing';

export default function CandidateSourcingsPage() {
  const tenantId = localStorage.getItem('tenantId') || undefined;
  const [selected, setSelected] = useState<CandidateSourcingTask | null>(null);

  const listQ = useList<CandidateSourcingTask[]>('candidate-sourcings', () => candidateSourcingService.list(tenantId), tenantId);
  const createM = useCreate<Partial<CandidateSourcingTask>, CandidateSourcingTask>('candidate-sourcings', candidateSourcingService.create, tenantId);
  const updateM = useUpdate<Partial<CandidateSourcingTask>, CandidateSourcingTask>('candidate-sourcings', candidateSourcingService.update, tenantId);
  const deleteM = useDelete('candidate-sourcings', candidateSourcingService.delete, tenantId);

  const items = useMemo(() => listQ.data || [], [listQ.data]);

  const handleSave = async (payload: Partial<CandidateSourcingTask>) => {
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
        <h1 className="text-xl font-semibold">Candidate Sourcings</h1>
        <button className="btn-primary" onClick={() => setSelected(null)}>New Task</button>
      </div>

      {listQ.isLoading && <div className="card">Loading…</div>}
      {listQ.error && <div className="card text-red-500">Failed to load</div>}

      <div className="overflow-x-auto bg-white rounded border">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-2">Title</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Priority</th>
              <th className="text-left p-2">Due</th>
              <th className="text-left p-2">Tags</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id} className="border-b">
                <td className="p-2 font-medium">{t.title}</td>
                <td className="p-2">{t.status}</td>
                <td className="p-2">{t.priority || '-'}</td>
                <td className="p-2">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '-'}</td>
                <td className="p-2">{(t.tags || []).join(', ')}</td>
                <td className="p-2 space-x-2">
                  <button className="btn-muted" onClick={() => setSelected(t)}>Edit</button>
                  <button className="btn-muted text-red-500" onClick={async () => { await deleteM.mutateAsync(t.id); }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

function EditModal({ open, initial, onClose, onSave, saving }: {
  open: boolean;
  initial?: Partial<CandidateSourcingTask>;
  onClose: () => void;
  onSave: (payload: Partial<CandidateSourcingTask>) => void | Promise<void>;
  saving?: boolean;
}) {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [status, setStatus] = useState<SourcingStatus>((initial?.status as SourcingStatus) || 'pending');
  const [priority, setPriority] = useState(initial?.priority || 'medium');
  const [dueDate, setDueDate] = useState(initial?.dueDate || '');
  const [tags, setTags] = useState((initial?.tags || []).join(', '));

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded shadow-lg w-full max-w-lg">
        <div className="p-4 border-b">
          <h2 className="font-semibold">{initial?.id ? 'Edit Task' : 'New Task'}</h2>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded px-3 py-2" rows={4} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as SourcingStatus)} className="w-full border rounded px-3 py-2">
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className="w-full border rounded px-3 py-2">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm mb-1">Tags</label>
              <input value={tags} onChange={(e) => setTags(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="comma, separated" />
            </div>
          </div>
        </div>
        <div className="p-4 border-t flex justify-end space-x-2">
          <button className="px-3 py-2 rounded bg-gray-100" onClick={onClose}>Cancel</button>
          <button
            className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={saving}
            onClick={() => onSave({ title, description, status, priority: priority as any, dueDate, tags: tags.split(',').map(t => t.trim()).filter(Boolean) })}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
