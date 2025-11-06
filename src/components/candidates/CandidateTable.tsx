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
  visibleColumns: Set<'name' | 'contact' | 'skills' | 'experience' | 'status' | 'actions'>;
  columnWidths: Partial<Record<'name' | 'contact' | 'skills' | 'experience' | 'status' | 'actions', number>>;
  onColumnResize?: (id: 'name' | 'contact' | 'skills' | 'experience' | 'status', width: number) => void;
}

export default function CandidateTable({ candidates, onEdit, onDelete, selectedIds, onToggleOne, onToggleAll, visibleColumns, columnWidths, onColumnResize }: Props) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      AVAILABLE: 'bg-green-500/20 text-green-400 border-green-500/30',
      PLACED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      INTERVIEWING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      INACTIVE: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return colors[status] || colors.INACTIVE;
  };

  // For large datasets, render a virtualized list to keep scrolling smooth
  if (candidates.length > 100) {
    const parentRef = useRef<HTMLDivElement | null>(null);
    const rowVirtualizer = useVirtualizer({
      count: candidates.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => 88, // approximate row height
      overscan: 8,
    });

    return (
      <div className="card">
        <div className="px-4 py-3 border-b border-dark-200 flex text-sm font-semibold sticky top-0 bg-dark-100 z-10">
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
          {visibleColumns.has('status') && <div className="w-1/6">Status</div>}
          {visibleColumns.has('actions') && <div className="w-[100px]">Actions</div>}
        </div>
        <div ref={parentRef} className="relative h-[600px] overflow-auto">
          <div style={{ height: rowVirtualizer.getTotalSize() }} />
          <div className="absolute top-0 left-0 right-0">
            {rowVirtualizer.getVirtualItems().map(virtualRow => {
              const candidate = candidates[virtualRow.index];
              return (
                <div
                  key={candidate.id}
                  className="flex items-start border-b border-dark-200 hover:bg-dark-50 transition-colors px-4"
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
                    <div className="w-1/4 py-4 pr-2">
                      <Link to={`/candidates/${candidate.id}`} className="font-medium text-primary-400 hover:underline">
                        {candidate.fullName}
                      </Link>
                      <p className="text-sm text-dark-600">{candidate.visaStatus}</p>
                    </div>
                  )}
                  {visibleColumns.has('contact') && (
                    <div className="w-1/4 py-4 pr-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail size={14} className="text-dark-600" />
                          <span>{candidate.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone size={14} className="text-dark-600" />
                          <span>{candidate.phone}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {visibleColumns.has('skills') && (
                    <div className="w-1/4 py-4 pr-2">
                      <div className="flex flex-wrap gap-1">
                        {candidate.primarySkills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {candidate.primarySkills.length > 3 && (
                          <span className="px-2 py-1 bg-dark-200 text-dark-600 text-xs rounded-full">
                            +{candidate.primarySkills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {visibleColumns.has('experience') && (
                    <div className="w-1/6 py-4 pr-2">
                      <span className="font-medium">{candidate.totalExperience} years</span>
                    </div>
                  )}
                  {visibleColumns.has('status') && (
                    <div className="w-1/6 py-4 pr-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(candidate.status)}`}>
                        {candidate.status}
                      </span>
                    </div>
                  )}
                  {visibleColumns.has('actions') && (
                    <div className="w-[100px] py-4 flex gap-2">
                      <button
                        onClick={() => onEdit(candidate)}
                        className="p-2 hover:bg-primary-500/20 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} className="text-primary-500" />
                      </button>
                      <button
                        onClick={() => onDelete(candidate.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {candidates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-dark-600">No candidates found</p>
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
  const wStatus = columnWidths.status ?? 140;
  const selectionW = 48;

  const startResize = (id: 'name' | 'contact' | 'skills' | 'experience' | 'status', startX: number, startW: number) => {
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
    <div className="card overflow-x-auto">
      <table className="w-full">
        <colgroup>
          <col style={{ width: selectionW }} />
          {visibleColumns.has('name') && <col style={{ width: wName }} />}
          {visibleColumns.has('contact') && <col style={{ width: wContact }} />}
          {visibleColumns.has('skills') && <col style={{ width: wSkills }} />}
          {visibleColumns.has('experience') && <col style={{ width: wExp }} />}
          {visibleColumns.has('status') && <col style={{ width: wStatus }} />}
          {visibleColumns.has('actions') && <col />}
        </colgroup>
        <thead className="sticky top-0 bg-dark-100 z-10">
          <tr className="border-b border-dark-200">
            <th className="text-left py-4 px-4 font-semibold w-10 sticky left-0 bg-dark-100 z-20">
              <input
                type="checkbox"
                aria-label="Select all"
                checked={candidates.length > 0 && candidates.every(c => selectedIds.has(c.id))}
                onChange={(e) => onToggleAll(e.target.checked)}
              />
            </th>
            {visibleColumns.has('name') && (
              <th className="text-left py-4 px-4 font-semibold sticky bg-dark-100 z-10" style={{ left: selectionW }}>
                <div className="relative">
                  Name
                  <span
                    className="absolute right-0 top-0 h-full w-1 cursor-col-resize"
                    onMouseDown={(e) => startResize('name', e.clientX, wName)}
                  />
                </div>
              </th>
            )}
            {visibleColumns.has('contact') && (
              <th className="text-left py-4 px-4 font-semibold">
                <div className="relative">
                  Contact
                  <span className="absolute right-0 top-0 h-full w-1 cursor-col-resize" onMouseDown={(e) => startResize('contact', e.clientX, wContact)} />
                </div>
              </th>
            )}
            {visibleColumns.has('skills') && (
              <th className="text-left py-4 px-4 font-semibold">
                <div className="relative">
                  Skills
                  <span className="absolute right-0 top-0 h-full w-1 cursor-col-resize" onMouseDown={(e) => startResize('skills', e.clientX, wSkills)} />
                </div>
              </th>
            )}
            {visibleColumns.has('experience') && (
              <th className="text-left py-4 px-4 font-semibold">
                <div className="relative">
                  Experience
                  <span className="absolute right-0 top-0 h-full w-1 cursor-col-resize" onMouseDown={(e) => startResize('experience', e.clientX, wExp)} />
                </div>
              </th>
            )}
            {visibleColumns.has('status') && (
              <th className="text-left py-4 px-4 font-semibold">
                <div className="relative">
                  Status
                  <span className="absolute right-0 top-0 h-full w-1 cursor-col-resize" onMouseDown={(e) => startResize('status', e.clientX, wStatus)} />
                </div>
              </th>
            )}
            {visibleColumns.has('actions') && <th className="text-left py-4 px-4 font-semibold">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => (
            <tr key={candidate.id} className="border-b border-dark-200 hover:bg-dark-50 transition-colors">
              <td className="py-4 px-4 sticky left-0 bg-dark-100 z-10">
                <input
                  type="checkbox"
                  aria-label={`Select ${candidate.fullName}`}
                  checked={selectedIds.has(candidate.id)}
                  onChange={() => onToggleOne(candidate.id)}
                />
              </td>
              {visibleColumns.has('name') && (
                <td className="py-4 px-4 sticky bg-dark-50" style={{ left: selectionW }}>
                  <div>
                    <Link to={`/candidates/${candidate.id}`} className="font-medium text-primary-400 hover:underline">
                      {candidate.fullName}
                    </Link>
                    <p className="text-sm text-dark-600">{candidate.visaStatus}</p>
                  </div>
                </td>
              )}
              {visibleColumns.has('contact') && (
                <td className="py-4 px-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={14} className="text-dark-600" />
                      <span>{candidate.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={14} className="text-dark-600" />
                      <span>{candidate.phone}</span>
                    </div>
                  </div>
                </td>
              )}
              {visibleColumns.has('skills') && (
                <td className="py-4 px-4">
                  <div className="flex flex-wrap gap-1">
                    {candidate.primarySkills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {candidate.primarySkills.length > 3 && (
                      <span className="px-2 py-1 bg-dark-200 text-dark-600 text-xs rounded-full">
                        +{candidate.primarySkills.length - 3}
                      </span>
                    )}
                  </div>
                </td>
              )}
              {visibleColumns.has('experience') && (
                <td className="py-4 px-4">
                  <span className="font-medium">{candidate.totalExperience} years</span>
                </td>
              )}
              {visibleColumns.has('status') && (
                <td className="py-4 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(candidate.status)}`}>
                    {candidate.status}
                  </span>
                </td>
              )}
              {visibleColumns.has('actions') && (
                <td className="py-4 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(candidate)}
                      className="p-2 hover:bg-primary-500/20 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} className="text-primary-500" />
                    </button>
                    <button
                      onClick={() => onDelete(candidate.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      
      {candidates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-dark-600">No candidates found</p>
        </div>
      )}
    </div>
  );
}
