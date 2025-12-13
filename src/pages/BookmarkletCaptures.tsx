import { useMemo, useState } from 'react';
import { useList, useCreate, useUpdate, useDelete } from '../services/hooks';
import { bookmarkletCaptureService } from '../services/bookmarkletCapture.service';
import type { BookmarkletCapture } from '../types/bookmarkletCapture';

export default function BookmarkletCapturesPage() {
  const tenantId = localStorage.getItem('tenantId') || undefined;
  const [selected, setSelected] = useState<BookmarkletCapture | null>(null);

  const listQ = useList<BookmarkletCapture[]>('bookmarklet-captures', () => bookmarkletCaptureService.list(tenantId), tenantId);
  const createM = useCreate<Partial<BookmarkletCapture>, BookmarkletCapture>('bookmarklet-captures', bookmarkletCaptureService.create, tenantId);
  const updateM = useUpdate<Partial<BookmarkletCapture>, BookmarkletCapture>('bookmarklet-captures', bookmarkletCaptureService.update, tenantId);
  const deleteM = useDelete('bookmarklet-captures', bookmarkletCaptureService.delete, tenantId);

  const items = useMemo(() => listQ.data || [], [listQ.data]);

  const handleSave = async (payload: Partial<BookmarkletCapture>) => {
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
        <h1 className="text-xl font-semibold">Bookmarklet Captures</h1>
        <button className="btn-primary" onClick={() => setSelected(null)}>New Capture</button>
      </div>

      {listQ.isLoading && <div className="card">Loading…</div>}
      {listQ.error && <div className="card text-red-500">Failed to load</div>}

      <div className="overflow-x-auto bg-white rounded border">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-2">Title</th>
              <th className="text-left p-2">Source URL</th>
              <th className="text-left p-2">Captured</th>
              <th className="text-left p-2">Tags</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-b">
                <td className="p-2 font-medium">{c.title || '-'}</td>
                <td className="p-2 truncate max-w-[40ch]">
                  <a className="text-blue-600 hover:underline" href={c.sourceUrl} target="_blank" rel="noreferrer">{c.sourceUrl}</a>
                </td>
                <td className="p-2">{new Date(c.capturedAt).toLocaleString()}</td>
                <td className="p-2">{(c.tags || []).join(', ')}</td>
                <td className="p-2 space-x-2">
                  <button className="btn-muted" onClick={() => setSelected(c)}>View/Edit</button>
                  <button className="btn-muted text-red-500" onClick={async () => { await deleteM.mutateAsync(c.id); }}>Delete</button>
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
  initial?: Partial<BookmarkletCapture>;
  onClose: () => void;
  onSave: (payload: Partial<BookmarkletCapture>) => void | Promise<void>;
  saving?: boolean;
}) {
  const [title, setTitle] = useState(initial?.title || '');
  const [sourceUrl, setSourceUrl] = useState(initial?.sourceUrl || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [tags, setTags] = useState((initial?.tags || []).join(', '));
  const [rawHtml, setRawHtml] = useState(initial?.rawHtml || '');

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded shadow-lg w-full max-w-2xl">
        <div className="p-4 border-b">
          <h2 className="font-semibold">{initial?.id ? 'View/Edit Capture' : 'New Capture'}</h2>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm mb-1">Source URL</label>
              <input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded px-3 py-2" rows={3} />
          </div>
          <div>
            <label className="block text-sm mb-1">Tags</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="comma, separated" />
          </div>
          <div>
            <label className="block text-sm mb-1">Raw HTML (optional)</label>
            <textarea value={rawHtml} onChange={(e) => setRawHtml(e.target.value)} className="w-full border rounded px-3 py-2 font-mono text-xs" rows={8} />
          </div>
        </div>
        <div className="p-4 border-t flex justify-end space-x-2">
          <button className="px-3 py-2 rounded bg-gray-100" onClick={onClose}>Close</button>
          <button
            className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={saving}
            onClick={() => onSave({ title, sourceUrl, description, tags: tags.split(',').map(t => t.trim()).filter(Boolean), rawHtml })}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
