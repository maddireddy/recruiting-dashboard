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
  params: Record<string, string | string[]>;
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
  onSaveView: (name: string, params: Record<string, string | string[]>) => void;
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
      <div className={`absolute inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <aside className={`sidebar-shell absolute right-0 top-0 h-full w-full max-w-md border-l transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-[rgba(var(--app-border-subtle))] px-6 py-4">
          <h3 className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">Filters</h3>
          <button onClick={onClose} className="rounded-lg border border-transparent px-3 py-1 text-muted transition hover:border-[rgba(var(--app-border-subtle))]">
            ✕
          </button>
        </div>
        <div className="h-[calc(100%-152px)] space-y-6 overflow-y-auto px-6 py-5">
          {/* Status */}
          <section>
            <h4 className="mb-2 text-sm font-semibold text-[rgb(var(--app-text-primary))] uppercase tracking-wide">Status</h4>
            <div className="flex flex-wrap gap-2">
              {ALL_STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => toggleStatus(s)}
                  className={`chip ${local.status?.includes(s) ? 'chip-active' : ''}`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </section>

          {/* Client */}
          <section>
            <h4 className="mb-2 text-sm font-semibold text-[rgb(var(--app-text-primary))] uppercase tracking-wide">Client</h4>
            <input
              className="input"
              placeholder="Client name"
              value={local.client || ''}
              onChange={(e) => setLocal({ ...local, client: e.target.value })}
            />
          </section>

          {/* Skills */}
          <section>
            <h4 className="mb-2 text-sm font-semibold text-[rgb(var(--app-text-primary))] uppercase tracking-wide">Skills (comma separated)</h4>
            <input
              className="input"
              placeholder="e.g. React, Node, AWS"
              value={(local.skills || []).join(', ')}
              onChange={(e) => setLocal({ ...local, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
            />
          </section>

          {/* Experience */}
          <section>
            <h4 className="mb-2 text-sm font-semibold text-[rgb(var(--app-text-primary))] uppercase tracking-wide">Experience (years)</h4>
            <div className="flex gap-3">
              <input
                type="number"
                className="input"
                placeholder="Min"
                value={local.minExp ?? ''}
                onChange={(e) => setLocal({ ...local, minExp: e.target.value ? Number(e.target.value) : undefined })}
              />
              <input
                type="number"
                className="input"
                placeholder="Max"
                value={local.maxExp ?? ''}
                onChange={(e) => setLocal({ ...local, maxExp: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
          </section>

          {/* Start Date Range */}
          <section>
            <h4 className="mb-2 text-sm font-semibold text-[rgb(var(--app-text-primary))] uppercase tracking-wide">Start Date Range</h4>
            <div className="flex gap-3">
              <input
                type="date"
                className="input"
                value={local.startDateFrom || ''}
                onChange={(e) => setLocal({ ...local, startDateFrom: e.target.value || undefined })}
              />
              <input
                type="date"
                className="input"
                value={local.startDateTo || ''}
                onChange={(e) => setLocal({ ...local, startDateTo: e.target.value || undefined })}
              />
            </div>
          </section>

          {/* Saved Views */}
          <section>
            <h4 className="mb-2 text-sm font-semibold text-[rgb(var(--app-text-primary))] uppercase tracking-wide">Saved Views</h4>
            <div className="flex gap-2">
              <select
                className="input flex-1"
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
                className="input flex-1"
                placeholder="View name"
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
              />
              <button
                className="btn-primary"
                onClick={() => {
                  if (viewName.trim()) onSaveView(viewName.trim(), toParams(local));
                  setViewName('');
                }}
              >
                Save
              </button>
            </div>
          </section>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-[rgba(var(--app-border-subtle))] px-6 py-4">
          <button onClick={clear} className="btn-muted" type="button">Clear</button>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-muted" type="button">Cancel</button>
            <button onClick={apply} className="btn-primary" type="button">Apply</button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function toParams(f: JobFilters): Record<string, string> {
  const p: Record<string, string> = {};
  if (f.status && f.status.length) p.status = f.status.join(',');
  if (f.client) p.client = f.client;
  if (f.skills && f.skills.length) p.skills = f.skills.join(',');
  if (typeof f.minExp === 'number') p.minExp = String(f.minExp);
  if (typeof f.maxExp === 'number') p.maxExp = String(f.maxExp);
  if (f.startDateFrom) p.startDateFrom = f.startDateFrom;
  if (f.startDateTo) p.startDateTo = f.startDateTo;
  return p;
}
