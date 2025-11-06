import { useEffect, useState } from 'react';
import type { JobStatus } from '../../types/job';

export type JobFilters = {
  status?: JobStatus[];
  client?: string;
  skills?: string[];
  minExp?: number;
  maxExp?: number;
  startDateFrom?: string; // ISO date (yyyy-mm-dd)
  startDateTo?: string;   // ISO date
};

export interface SavedView {
  name: string;
  params: Record<string, any>;
}

const ALL_STATUSES: JobStatus[] = ['OPEN', 'IN_PROGRESS', 'INTERVIEW', 'OFFERED', 'CLOSED'];

export default function JobFiltersSidebar({
  open,
  initial,
  onClose,
  onApply,
  savedViews,
  onSaveView,
  onApplyView,
}: {
  open: boolean;
  initial: JobFilters;
  onClose: () => void;
  onApply: (filters: JobFilters) => void;
  savedViews: SavedView[];
  onSaveView: (name: string, params: Record<string, any>) => void;
  onApplyView: (view: SavedView) => void;
}) {
  const [local, setLocal] = useState<JobFilters>(initial);
  const [viewName, setViewName] = useState('');

  useEffect(() => {
    if (open) setLocal(initial);
  }, [open, initial]);

  const toggleStatus = (s: JobStatus) => {
    const cur = new Set(local.status || []);
    if (cur.has(s)) cur.delete(s); else cur.add(s);
    setLocal({ ...local, status: Array.from(cur) as JobStatus[] });
  };

  const apply = () => onApply(local);
  const clear = () => setLocal({});

  return (
    <div className={`fixed inset-0 z-40 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      {/* Backdrop */}
      <div className={`absolute inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      {/* Panel */}
      <aside className={`absolute right-0 top-0 h-full w-full max-w-md bg-dark-100 border-l border-dark-300 transform transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b border-dark-300 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Filters</h3>
          <button onClick={onClose} className="text-dark-600 hover:text-white">✕</button>
        </div>
        <div className="p-4 space-y-5 overflow-y-auto h-[calc(100%-140px)]">
          {/* Status */}
          <section>
            <h4 className="font-medium mb-2">Status</h4>
            <div className="flex flex-wrap gap-2">
              {ALL_STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => toggleStatus(s)}
                  className={`px-2 py-1 rounded border ${local.status?.includes(s) ? 'bg-primary-500/20 border-primary-500 text-primary-300' : 'bg-dark-200 border-dark-300 text-dark-500'}`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </section>

          {/* Client */}
          <section>
            <h4 className="font-medium mb-2">Client</h4>
            <input
              className="w-full bg-dark-200 border border-dark-300 rounded px-3 py-2"
              placeholder="Client name"
              value={local.client || ''}
              onChange={(e) => setLocal({ ...local, client: e.target.value })}
            />
          </section>

          {/* Skills */}
          <section>
            <h4 className="font-medium mb-2">Skills (comma separated)</h4>
            <input
              className="w-full bg-dark-200 border border-dark-300 rounded px-3 py-2"
              placeholder="e.g. React, Node, AWS"
              value={(local.skills || []).join(', ')}
              onChange={(e) => setLocal({ ...local, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
            />
          </section>

          {/* Experience */}
          <section>
            <h4 className="font-medium mb-2">Experience (years)</h4>
            <div className="flex gap-3">
              <input
                type="number"
                className="w-full bg-dark-200 border border-dark-300 rounded px-3 py-2"
                placeholder="Min"
                value={local.minExp ?? ''}
                onChange={(e) => setLocal({ ...local, minExp: e.target.value ? Number(e.target.value) : undefined })}
              />
              <input
                type="number"
                className="w-full bg-dark-200 border border-dark-300 rounded px-3 py-2"
                placeholder="Max"
                value={local.maxExp ?? ''}
                onChange={(e) => setLocal({ ...local, maxExp: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
          </section>

          {/* Start Date Range */}
          <section>
            <h4 className="font-medium mb-2">Start Date Range</h4>
            <div className="flex gap-3">
              <input
                type="date"
                className="w-full bg-dark-200 border border-dark-300 rounded px-3 py-2"
                value={local.startDateFrom || ''}
                onChange={(e) => setLocal({ ...local, startDateFrom: e.target.value || undefined })}
              />
              <input
                type="date"
                className="w-full bg-dark-200 border border-dark-300 rounded px-3 py-2"
                value={local.startDateTo || ''}
                onChange={(e) => setLocal({ ...local, startDateTo: e.target.value || undefined })}
              />
            </div>
          </section>

          {/* Saved Views */}
          <section>
            <h4 className="font-medium mb-2">Saved Views</h4>
            <div className="flex gap-2">
              <select
                className="flex-1 bg-dark-200 border border-dark-300 rounded px-3 py-2"
                onChange={(e) => {
                  const view = savedViews.find(v => v.name === e.target.value);
                  if (view) onApplyView(view);
                }}
                defaultValue=""
              >
                <option value="" disabled>Select a view</option>
                {savedViews.map(v => (
                  <option key={v.name} value={v.name}>{v.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 mt-2">
              <input
                className="flex-1 bg-dark-200 border border-dark-300 rounded px-3 py-2"
                placeholder="View name"
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
              />
              <button
                className="px-3 py-2 bg-primary-500 hover:bg-primary-600 rounded"
                onClick={() => {
                  if (viewName.trim()) onSaveView(viewName.trim(), toParams(local));
                  setViewName('');
                }}
              >Save</button>
            </div>
          </section>
        </div>
        <div className="p-4 border-t border-dark-300 flex justify-between gap-2">
          <button onClick={clear} className="px-4 py-2 bg-dark-200 hover:bg-dark-300 rounded">Clear</button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 bg-dark-200 hover:bg-dark-300 rounded">Cancel</button>
            <button onClick={apply} className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded">Apply</button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function toParams(f: JobFilters): Record<string, any> {
  const p: Record<string, any> = {};
  if (f.status && f.status.length) p.status = f.status.join(',');
  if (f.client) p.client = f.client;
  if (f.skills && f.skills.length) p.skills = f.skills.join(',');
  if (typeof f.minExp === 'number') p.minExp = String(f.minExp);
  if (typeof f.maxExp === 'number') p.maxExp = String(f.maxExp);
  if (f.startDateFrom) p.startDateFrom = f.startDateFrom;
  if (f.startDateTo) p.startDateTo = f.startDateTo;
  return p;
}
