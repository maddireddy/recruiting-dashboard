import { Edit, Trash2, Mail, Phone } from 'lucide-react';
import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Candidate } from '../../types';
import { Link } from 'react-router-dom';

interface Props {
  candidates: Candidate[];
  onEdit: (candidate: Candidate) => void;
  onDelete: (id: string) => void;
  selectedIds: Set<string>;
  onToggleOne: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
  visibleColumns: Set<'name' | 'contact' | 'skills' | 'experience' | 'availability' | 'status' | 'actions'>;
  columnWidths: Partial<Record<'name' | 'contact' | 'skills' | 'experience' | 'availability' | 'status' | 'actions', number>>;
  onColumnResize?: (id: 'name' | 'contact' | 'skills' | 'experience' | 'availability' | 'status', width: number) => void;
}

type StatusToken = {
  key: string;
  label: string;
  className: string;
};

const STATUS_VARIANTS: Record<string, string> = {
  AVAILABLE: 'bg-emerald-500/12 text-emerald-400 border-emerald-400/50',
  AVAILABLE_SOON: 'bg-emerald-500/12 text-emerald-400 border-emerald-400/50',
  INTERVIEWING: 'bg-amber-500/14 text-amber-400 border-amber-400/55',
  INTERVIEW_SCHEDULED: 'bg-amber-500/14 text-amber-400 border-amber-400/55',
  PLACED: 'bg-sky-500/14 text-sky-400 border-sky-400/55',
  ON_HOLD: 'bg-purple-500/14 text-purple-400 border-purple-400/55',
  NOT_AVAILABLE: 'bg-rose-500/14 text-rose-400 border-rose-400/55',
  WITHDRAWN: 'bg-rose-500/14 text-rose-400 border-rose-400/55',
  INACTIVE: 'bg-slate-500/15 text-slate-600 border-slate-500/45',
};

const availabilityToken = (availability?: string | null): StatusToken | null => {
  if (!availability) return null;
  const key = availability.trim().toUpperCase();
  if (!key) return null;
  return {
    key,
    label: key.replaceAll('_', ' ').toLowerCase().replace(/^(\w)/, (s) => s.toUpperCase()),
    className: STATUS_VARIANTS[key] ?? STATUS_VARIANTS.INACTIVE,
  };
};

const prettify = (value: string) =>
  value
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/(^|\s)([a-z])/g, (_, space, letter) => `${space}${letter.toUpperCase()}`);

const statusToken = (status?: string | null): StatusToken => {
  const key = (status ?? '').trim().toUpperCase();
  if (!key) {
    return {
      key: 'UNSPECIFIED',
      label: 'Status pending',
      className: STATUS_VARIANTS.INACTIVE,
    };
  }
  return {
    key,
    label: prettify(key),
    className: STATUS_VARIANTS[key] ?? STATUS_VARIANTS.INACTIVE,
  };
};

const buildStateTokens = (candidate: Candidate) => {
  const availability = availabilityToken(candidate.availability);
  const status = statusToken(candidate.status);
  return { status, availability };
};

export default function CandidateTable({ candidates, onEdit, onDelete, selectedIds, onToggleOne, onToggleAll, visibleColumns, columnWidths, onColumnResize }: Props) {
  // For large datasets, render a virtualized list to keep scrolling smooth
  const parentRef = useRef<HTMLDivElement | null>(null);
  const shouldVirtualize = candidates.length > 100;
  const rowVirtualizer = useVirtualizer({
    count: shouldVirtualize ? candidates.length : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 88,
    overscan: 8,
  });

  if (shouldVirtualize) {
    return (
      <div className="card overflow-hidden p-0">
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] px-5 py-4 text-xs font-semibold uppercase tracking-wider text-muted">
          <div className="w-10 pr-2">
            <input
              type="checkbox"
              aria-label="Select all"
              checked={candidates.length > 0 && candidates.every(c => selectedIds.has(c.id))}
              onChange={(e) => onToggleAll(e.target.checked)}
            />
          </div>
          {visibleColumns.has('name') && <div className="w-1/4">Name</div>}
          {visibleColumns.has('contact') && <div className="w-1/4">Contact</div>}
          {visibleColumns.has('skills') && <div className="w-1/4">Skills</div>}
          {visibleColumns.has('experience') && <div className="w-1/6">Experience</div>}
          {visibleColumns.has('availability') && <div className="w-1/6">Availability</div>}
          {visibleColumns.has('status') && <div className="w-1/6">Status</div>}
          {visibleColumns.has('actions') && <div className="w-[100px]">Actions</div>}
        </div>
        <div ref={parentRef} className="relative h-[600px] overflow-auto">
          <div style={{ height: rowVirtualizer.getTotalSize() }} />
          <div className="absolute top-0 left-0 right-0">
            {rowVirtualizer.getVirtualItems().map(virtualRow => {
              const candidate = candidates[virtualRow.index];
              const { status, availability } = buildStateTokens(candidate);
              return (
                <div
                  key={candidate.id}
                  className="group flex items-start border-b border-[rgba(var(--app-border-subtle))] px-5 transition-colors hover:bg-[rgb(var(--app-surface-muted))]"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div className="w-10 py-4 pr-2">
                    <input
                      type="checkbox"
                      aria-label={`Select ${candidate.fullName}`}
                      checked={selectedIds.has(candidate.id)}
                      onChange={() => onToggleOne(candidate.id)}
                    />
                  </div>
                  {visibleColumns.has('name') && (
                    <div className="w-1/4 py-4 pr-3">
                      <Link to={`/candidates/${candidate.id}`} className="font-medium text-[rgb(var(--app-text-primary))] transition hover:text-[rgb(var(--app-primary-from))]">
                        {candidate.fullName}
                      </Link>
                      <p className="text-xs text-muted uppercase tracking-wide">{candidate.visaStatus}</p>
                    </div>
                  )}
                  {visibleColumns.has('contact') && (
                    <div className="w-1/4 py-4 pr-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[13px] text-[rgb(var(--app-text-secondary))]">
                          <Mail size={14} className="text-muted" />
                          <span>{candidate.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[13px] text-[rgb(var(--app-text-secondary))]">
                          <Phone size={14} className="text-muted" />
                          <span>{candidate.phone}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {visibleColumns.has('skills') && (
                    <div className="w-1/4 py-4 pr-2">
                      <div className="flex flex-wrap gap-1.5">
                        {(candidate.primarySkills ?? []).slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="chip chip-active"
                          >
                            {skill}
                          </span>
                        ))}
                        {(candidate.primarySkills ?? []).length > 3 && (
                          <span className="chip">
                            +{(candidate.primarySkills ?? []).length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {visibleColumns.has('experience') && (
                    <div className="w-1/6 py-4 pr-2">
                      <span className="text-sm font-semibold text-[rgb(var(--app-text-primary))]">{candidate.totalExperience} years</span>
                    </div>
                  )}
                  {visibleColumns.has('availability') && (
                    <div className="w-1/6 py-4 pr-2">
                      {availability ? (
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide ${availability.className}`}>
                          {availability.label}
                        </span>
                      ) : (
                        <span className="text-xs text-muted">Not set</span>
                      )}
                    </div>
                  )}
                  {visibleColumns.has('status') && (
                    <div className="w-1/6 py-4 pr-2">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                  )}
                  {visibleColumns.has('actions') && (
                    <div className="flex w-[100px] gap-2 py-4">
                      <button
                        onClick={() => onEdit(candidate)}
                        className="rounded-lg border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] p-2 text-[rgb(var(--app-primary-from))] transition hover:border-[rgba(var(--app-primary-from),0.5)]"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(candidate.id)}
                        className="rounded-lg border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] p-2 text-red-400 transition hover:border-red-400/50"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {candidates.length === 0 && (
          <div className="py-12 text-center text-sm text-muted">
            <p>No candidates found</p>
          </div>
        )}
      </div>
    );
  }

  // Default: existing table rendering for smaller datasets
  // Column widths defaults and resize handler (table mode only)
  const wName = columnWidths.name ?? 260;
  const wContact = columnWidths.contact ?? 240;
  const wSkills = columnWidths.skills ?? 300;
  const wExp = columnWidths.experience ?? 140;
  const wAvailability = columnWidths.availability ?? 150;
  const wStatus = columnWidths.status ?? 140;
  const selectionW = 48;

  const startResize = (id: 'name' | 'contact' | 'skills' | 'experience' | 'availability' | 'status', startX: number, startW: number) => {
    if (!onColumnResize) return;
    const onMove = (e: MouseEvent) => {
      const delta = e.clientX - startX;
      const next = Math.max(100, startW + delta);
      onColumnResize(id, next);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div className="card overflow-hidden p-0">
      <table className="w-full min-w-[960px]">
        <colgroup>
          <col style={{ width: selectionW }} />
          {visibleColumns.has('name') && <col style={{ width: wName }} />}
          {visibleColumns.has('contact') && <col style={{ width: wContact }} />}
          {visibleColumns.has('skills') && <col style={{ width: wSkills }} />}
          {visibleColumns.has('experience') && <col style={{ width: wExp }} />}
          {visibleColumns.has('availability') && <col style={{ width: wAvailability }} />}
          {visibleColumns.has('status') && <col style={{ width: wStatus }} />}
          {visibleColumns.has('actions') && <col />}
        </colgroup>
        <thead className="sticky top-0 z-10 bg-[rgb(var(--app-surface-muted))] backdrop-blur">
          <tr className="border-b border-[rgba(var(--app-border-subtle))] text-left text-xs font-semibold uppercase tracking-wider text-muted">
            <th className="sticky left-0 w-12 px-4 py-4">
              <input
                type="checkbox"
                aria-label="Select all"
                checked={candidates.length > 0 && candidates.every(c => selectedIds.has(c.id))}
                onChange={(e) => onToggleAll(e.target.checked)}
              />
            </th>
            {visibleColumns.has('name') && (
              <th className="sticky left-12 bg-[rgb(var(--app-surface-muted))] px-4 py-4" style={{ left: selectionW }}>
                <div className="relative flex items-center justify-between gap-3">
                  <span>Name</span>
                  <span
                    className="h-7 w-[3px] rounded-full bg-transparent transition hover:bg-[rgb(var(--app-primary-from))]"
                    onMouseDown={(e) => startResize('name', e.clientX, wName)}
                  />
                </div>
              </th>
            )}
            {visibleColumns.has('contact') && (
              <th className="px-4 py-4">
                <div className="relative flex items-center justify-between gap-3">
                  <span>Contact</span>
                  <span className="h-7 w-[3px] rounded-full bg-transparent transition hover:bg-[rgb(var(--app-primary-from))]" onMouseDown={(e) => startResize('contact', e.clientX, wContact)} />
                </div>
              </th>
            )}
            {visibleColumns.has('skills') && (
              <th className="px-4 py-4">
                <div className="relative flex items-center justify-between gap-3">
                  <span>Skills</span>
                  <span className="h-7 w-[3px] rounded-full bg-transparent transition hover:bg-[rgb(var(--app-primary-from))]" onMouseDown={(e) => startResize('skills', e.clientX, wSkills)} />
                </div>
              </th>
            )}
            {visibleColumns.has('experience') && (
              <th className="px-4 py-4">
                <div className="relative flex items-center justify-between gap-3">
                  <span>Experience</span>
                  <span className="h-7 w-[3px] rounded-full bg-transparent transition hover:bg-[rgb(var(--app-primary-from))]" onMouseDown={(e) => startResize('experience', e.clientX, wExp)} />
                </div>
              </th>
            )}
            {visibleColumns.has('availability') && (
              <th className="px-4 py-4">
                <div className="relative flex items-center justify-between gap-3">
                  <span>Availability</span>
                  <span className="h-7 w-[3px] rounded-full bg-transparent transition hover:bg-[rgb(var(--app-primary-from))]" onMouseDown={(e) => startResize('availability', e.clientX, wAvailability)} />
                </div>
              </th>
            )}
            {visibleColumns.has('status') && (
              <th className="px-4 py-4">
                <div className="relative flex items-center justify-between gap-3">
                  <span>Status</span>
                  <span className="h-7 w-[3px] rounded-full bg-transparent transition hover:bg-[rgb(var(--app-primary-from))]" onMouseDown={(e) => startResize('status', e.clientX, wStatus)} />
                </div>
              </th>
            )}
            {visibleColumns.has('actions') && <th className="px-4 py-4">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(var(--app-border-subtle))] text-[rgb(var(--app-text-secondary))]">
          {candidates.map((candidate) => {
            const { status, availability } = buildStateTokens(candidate);
            return (
              <tr
                key={candidate.id}
                className="group transition hover:bg-[rgb(var(--app-surface-muted))]"
              >
              <td className="sticky left-0 z-10 bg-[rgb(var(--app-surface-muted))] px-4 py-4 backdrop-blur">
                <input
                  type="checkbox"
                  aria-label={`Select ${candidate.fullName}`}
                  checked={selectedIds.has(candidate.id)}
                  onChange={() => onToggleOne(candidate.id)}
                />
              </td>
              {visibleColumns.has('name') && (
                <td className="sticky bg-[rgb(var(--app-surface-muted))] px-4 py-4 backdrop-blur" style={{ left: selectionW }}>
                  <div className="space-y-1">
                    <Link to={`/candidates/${candidate.id}`} className="font-medium text-[rgb(var(--app-text-primary))] transition hover:text-[rgb(var(--app-primary-from))]">
                      {candidate.fullName}
                    </Link>
                    <p className="text-xs uppercase tracking-wide text-muted">{candidate.visaStatus}</p>
                  </div>
                </td>
              )}
              {visibleColumns.has('contact') && (
                <td className="px-4 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[13px] text-[rgb(var(--app-text-secondary))]">
                      <Mail size={14} className="text-muted" />
                      <span>{candidate.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[13px] text-[rgb(var(--app-text-secondary))]">
                      <Phone size={14} className="text-muted" />
                      <span>{candidate.phone}</span>
                    </div>
                  </div>
                </td>
              )}
              {visibleColumns.has('skills') && (
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {(candidate.primarySkills ?? []).slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="chip chip-active"
                      >
                        {skill}
                      </span>
                    ))}
                    {(candidate.primarySkills ?? []).length > 3 && (
                      <span className="chip">
                        +{(candidate.primarySkills ?? []).length - 3}
                      </span>
                    )}
                  </div>
                </td>
              )}
              {visibleColumns.has('experience') && (
                <td className="px-4 py-4">
                  <span className="text-sm font-semibold text-[rgb(var(--app-text-primary))]">{candidate.totalExperience} years</span>
                </td>
              )}
              {visibleColumns.has('availability') && (
                <td className="px-4 py-4">
                  {availability ? (
                    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide ${availability.className}`}>
                      {availability.label}
                    </span>
                  ) : (
                    <span className="text-xs text-muted">Not set</span>
                  )}
                </td>
              )}
              {visibleColumns.has('status') && (
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide ${status.className}`}>
                    {status.label}
                  </span>
                </td>
              )}
              {visibleColumns.has('actions') && (
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(candidate)}
                      className="rounded-lg border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] p-2 text-[rgb(var(--app-primary-from))] transition hover:border-[rgba(var(--app-primary-from),0.5)]"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(candidate.id)}
                      className="rounded-lg border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] p-2 text-red-400 transition hover:border-red-400/50"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          );
        })}
        </tbody>
      </table>
      {candidates.length === 0 && (
        <div className="py-12 text-center text-sm text-muted">
          <p>No candidates found</p>
        </div>
      )}
    </div>
  );
}
