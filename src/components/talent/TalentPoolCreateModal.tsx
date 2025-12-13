import { useState } from 'react';
import { talentPoolApi } from '../../api/talentPoolApi';
import toast from 'react-hot-toast';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export default function TalentPoolCreateModal({ open, onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string>('');
  const [loading, setLoading] = useState(false);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">Create Talent Pool</h3>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span className="text-sm">Name</span>
            <input className="border rounded px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Description</span>
            <textarea className="border rounded px-3 py-2" value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Tags (comma separated)</span>
            <input className="border rounded px-3 py-2" value={tags} onChange={(e) => setTags(e.target.value)} />
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button className="px-3 py-2 rounded border" onClick={onClose}>Cancel</button>
          <button
            className="px-3 py-2 rounded bg-blue-600 text-white"
            onClick={async () => {
              if (!name.trim()) return toast.error('Pool name is required');
              setLoading(true);
              try {
                await talentPoolApi.create({ name, description, tags: tags.split(',').map(t => t.trim()).filter(Boolean) });
                toast.success('Pool created');
                onCreated?.();
                onClose();
              } catch (e) {
                toast.error('Failed to create pool');
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            {loading ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
