import { useMemo, useState } from 'react';
import { useList, useCreate, useUpdate, useDelete } from '../services/hooks';
import { jdTemplateService } from '../services/jdTemplate.service';
import type { JobDescriptionTemplate } from '../types/jobDescriptionTemplate';

export default function JobDescriptionTemplatesPage() {
  const tenantId = localStorage.getItem('tenantId') || undefined;
  const [selected, setSelected] = useState<JobDescriptionTemplate | null>(null);

  const templatesQ = useList<JobDescriptionTemplate[]>('jd-templates', () => jdTemplateService.list(tenantId), tenantId);
  const createM = useCreate<Partial<JobDescriptionTemplate>, JobDescriptionTemplate>('jd-templates', jdTemplateService.create, tenantId);
  const updateM = useUpdate<Partial<JobDescriptionTemplate>, JobDescriptionTemplate>('jd-templates', jdTemplateService.update, tenantId);
  const deleteM = useDelete('jd-templates', jdTemplateService.delete, tenantId);

  const items = useMemo(() => templatesQ.data || [], [templatesQ.data]);

  const handleSave = async (payload: Partial<JobDescriptionTemplate>) => {
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
        <h1 className="text-xl font-semibold">Job Description Templates</h1>
        <button className="btn-primary" onClick={() => setSelected(null)}>New Template</button>
      </div>

      {templatesQ.isLoading && <div className="card">Loading…</div>}
      {templatesQ.error && <div className="card text-red-500">Failed to load</div>}

      <div className="overflow-x-auto bg-white rounded border">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Tags</th>
              <th className="text-left p-2">Updated</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id} className="border-b">
                <td className="p-2">{t.name}</td>
                <td className="p-2">{(t.tags || []).join(', ')}</td>
                <td className="p-2">{t.updatedAt ? new Date(t.updatedAt).toLocaleString() : '-'}</td>
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
  initial?: Partial<JobDescriptionTemplate>;
  onClose: () => void;
  onSave: (payload: Partial<JobDescriptionTemplate>) => void | Promise<void>;
  saving?: boolean;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [content, setContent] = useState(initial?.content || '');
  const [tags, setTags] = useState((initial?.tags || []).join(', '));

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded shadow-lg w-full max-w-xl">
        <div className="p-4 border-b">
          <h2 className="font-semibold">{initial?.id ? 'Edit Template' : 'New Template'}</h2>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Content</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full border rounded px-3 py-2" rows={6} />
          </div>
          <div>
            <label className="block text-sm mb-1">Tags (comma separated)</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div className="p-4 border-t flex justify-end space-x-2">
          <button className="px-3 py-2 rounded bg-gray-100" onClick={onClose}>Cancel</button>
          <button className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50" disabled={saving} onClick={() => onSave({ name, content, tags: tags.split(',').map((t) => t.trim()).filter(Boolean) })}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
