import { useMemo, useState } from 'react';
import { useList, useCreate, useUpdate, useDelete } from '../services/hooks';
import { booleanSearchTemplateService } from '../services/booleanSearchTemplate.service';
import type { BooleanSearchTemplate } from '../types/booleanSearchTemplate';

export default function BooleanSearchTemplatesPage() {
  const tenantId = localStorage.getItem('tenantId') || undefined;

  const listQ = useList<BooleanSearchTemplate[]>('boolean-search-templates', () => booleanSearchTemplateService.list(tenantId), tenantId);
  const createM = useCreate<Partial<BooleanSearchTemplate>, BooleanSearchTemplate>('boolean-search-templates', booleanSearchTemplateService.create, tenantId);
  const updateM = useUpdate<Partial<BooleanSearchTemplate>, BooleanSearchTemplate>('boolean-search-templates', booleanSearchTemplateService.update, tenantId);
  const deleteM = useDelete('boolean-search-templates', booleanSearchTemplateService.delete, tenantId);

  const templates = useMemo(() => listQ.data || [], [listQ.data]);

  const [editing, setEditing] = useState<BooleanSearchTemplate | null>(null);
  const [form, setForm] = useState<Partial<BooleanSearchTemplate>>({ name: '', query: '', description: '' });

  const startEdit = (t: BooleanSearchTemplate) => {
    setEditing(t);
    setForm({ name: t.name, query: t.query, description: t.description, tags: t.tags });
  };

  const reset = () => {
    setEditing(null);
    setForm({ name: '', query: '', description: '', tags: [] });
  };

  const save = async () => {
    if (editing) {
      await updateM.mutateAsync({ id: editing.id, data: form });
    } else {
      await createM.mutateAsync(form);
    }
    reset();
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Boolean Search Templates</h1>
        <button className="btn btn-primary" onClick={() => reset()}>New Template</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="col-span-1 md:col-span-1">
          <div className="card p-4">
            <label className="block mb-2">Name</label>
            <input className="input input-bordered w-full mb-3" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <label className="block mb-2">Query</label>
            <textarea className="textarea textarea-bordered w-full mb-3" rows={6} value={form.query || ''} onChange={(e) => setForm({ ...form, query: e.target.value })} />
            <label className="block mb-2">Description</label>
            <textarea className="textarea textarea-bordered w-full mb-3" rows={3} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <label className="block mb-2">Tags (comma-separated)</label>
            <input className="input input-bordered w-full mb-3" value={(form.tags || []).join(', ')} onChange={(e) => setForm({ ...form, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} />
            <div className="flex gap-2">
              <button className="btn btn-primary" onClick={save}>{editing ? 'Update' : 'Create'}</button>
              {editing && <button className="btn" onClick={reset}>Cancel</button>}
            </div>
          </div>
        </div>
        <div className="col-span-1 md:col-span-2">
          <div className="card">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Query</th>
                  <th>Tags</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t: BooleanSearchTemplate) => (
                  <tr key={t.id}>
                    <td className="font-medium">{t.name}</td>
                    <td className="truncate max-w-[300px]" title={t.query}>{t.query}</td>
                    <td>{(t.tags || []).join(', ')}</td>
                    <td className="flex gap-2">
                      <button className="btn btn-sm" onClick={() => startEdit(t)}>Edit</button>
                      <button className="btn btn-sm btn-error" onClick={async () => { await deleteM.mutateAsync(t.id); }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
