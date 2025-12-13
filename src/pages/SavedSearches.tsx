import { useMemo, useState } from 'react';
import { useList, useCreate, useUpdate, useDelete } from '../services/hooks';
import { savedSearchService } from '../services/savedSearch.service';
import type { SavedSearch } from '../types/savedSearch';

export default function SavedSearchesPage() {
  const tenantId = localStorage.getItem('tenantId') || undefined;
  const [selected, setSelected] = useState<SavedSearch | null>(null);

  const searchesQ = useList<SavedSearch[]>('saved-searches', () => savedSearchService.list(tenantId), tenantId);
  const createM = useCreate<Partial<SavedSearch>, SavedSearch>('saved-searches', savedSearchService.create, tenantId);
  const updateM = useUpdate<Partial<SavedSearch>, SavedSearch>('saved-searches', savedSearchService.update, tenantId);
  const deleteM = useDelete('saved-searches', savedSearchService.delete, tenantId);

  const items = useMemo(() => searchesQ.data || [], [searchesQ.data]);

  const handleSave = async (payload: Partial<SavedSearch>) => {
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
        <h1 className="text-xl font-semibold">Saved Searches</h1>
        <button className="btn-primary" onClick={() => setSelected(null)}>New Saved Search</button>
      </div>

      {searchesQ.isLoading && <div className="card">Loading…</div>}
      {searchesQ.error && <div className="card text-red-500">Failed to load</div>}

      <div className="overflow-x-auto bg-white rounded border">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Query</th>
              <th className="text-left p-2">Updated</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id} className="border-b">
                <td className="p-2">{s.name}</td>
                <td className="p-2 truncate max-w-[40ch]">{s.query}</td>
                <td className="p-2">{s.updatedAt ? new Date(s.updatedAt).toLocaleString() : '-'}</td>
                <td className="p-2 space-x-2">
                  <button className="btn-muted" onClick={() => setSelected(s)}>Edit</button>
                  <button className="btn-muted text-red-500" onClick={async () => { await deleteM.mutateAsync(s.id); }}>Delete</button>
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
  initial?: Partial<SavedSearch>;
  onClose: () => void;
  onSave: (payload: Partial<SavedSearch>) => void | Promise<void>;
  saving?: boolean;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [query, setQuery] = useState(initial?.query || '');

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded shadow-lg w-full max-w-lg">
        <div className="p-4 border-b">
          <h2 className="font-semibold">{initial?.id ? 'Edit Saved Search' : 'New Saved Search'}</h2>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Query</label>
            <textarea value={query} onChange={(e) => setQuery(e.target.value)} className="w-full border rounded px-3 py-2" rows={4} />
          </div>
        </div>
        <div className="p-4 border-t flex justify-end space-x-2">
          <button className="px-3 py-2 rounded bg-gray-100" onClick={onClose}>Cancel</button>
          <button className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50" disabled={saving} onClick={() => onSave({ name, query })}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
