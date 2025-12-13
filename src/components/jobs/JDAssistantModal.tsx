import { useState } from 'react';
import { aiApi } from '../../api/aiApi';
import toast from 'react-hot-toast';

type Props = {
  open: boolean;
  jobId?: string;
  initialJD?: string;
  onInsert: (newContent: string) => void;
  onClose: () => void;
};

const PRESETS = [
  { name: 'Concise', prompt: 'Rewrite the JD concisely keeping must-have requirements and benefits.' },
  { name: 'Inclusive', prompt: 'Adjust the JD to be inclusive, remove biased language, emphasize diverse candidates.' },
  { name: 'Role-focused', prompt: 'Refocus the JD on day-to-day responsibilities, outcomes, and success metrics.' },
];

export default function JDAssistantModal({ open, jobId, initialJD, onInsert, onClose }: Props) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  if (!open) return null;

  const run = async () => {
    try {
      setLoading(true);
      const payload = { prompt: `${prompt}\n\nOriginal JD:\n${initialJD ?? ''}`.trim(), jobId };
      const { content } = await aiApi.jdAssist(payload);
      setResult(content);
    } catch (e) {
      toast.error('AI generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">AI JD Assistant</h3>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Prompt</label>
            <textarea
              className="border rounded w-full px-3 py-2 mt-1 h-32"
              placeholder="Tell the assistant how to improve or rewrite the JD..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="flex gap-2 mt-2">
              {PRESETS.map((p) => (
                <button key={p.name} className="text-xs px-2 py-1 rounded border" onClick={() => setPrompt(p.prompt)}>
                  {p.name}
                </button>
              ))}
            </div>
            <button className="mt-3 px-3 py-2 bg-blue-600 text-white rounded" onClick={run} disabled={loading}>
              {loading ? 'Generating…' : 'Generate'}
            </button>
          </div>

          <div>
            <label className="text-sm font-medium">Preview</label>
            <textarea className="border rounded w-full px-3 py-2 mt-1 h-48" value={result} readOnly />
            <div className="flex justify-end mt-2">
              <button
                className="px-3 py-2 bg-green-600 text-white rounded"
                onClick={() => {
                  if (!result) return toast.error('No content to insert');
                  onInsert(result);
                  onClose();
                }}
              >
                Insert into JD
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
