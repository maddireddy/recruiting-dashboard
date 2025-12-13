import React from 'react';
import clsx from 'clsx';

export interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  error?: string;
  emptyText?: string;
  page?: number;
  pageSize?: number;
  total?: number;
  onSort?: (key: string) => void;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  onPageChange?: (page: number) => void;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  loading,
  error,
  emptyText = 'No data',
  page = 1,
  pageSize = 10,
  total,
  onSort,
  sortKey,
  sortDir,
  onPageChange,
}: TableProps<T>) {
  const pages = total && pageSize ? Math.max(1, Math.ceil(total / pageSize)) : 1;

  return (
    <div className="rounded-xl border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface))]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(var(--app-border-subtle))]">
              {columns.map((c) => (
                <th key={String(c.key)} className="px-4 py-3 text-left font-semibold text-muted">
                  <button
                    className={clsx('flex items-center gap-1', c.sortable && 'hover:text-[rgb(var(--app-text-primary))]')}
                    onClick={() => c.sortable && onSort?.(String(c.key))}
                  >
                    {c.title}
                    {sortKey === c.key && (
                      <span aria-hidden className="text-xs">{sortDir === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center text-muted">Loading…</td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center text-red-500">{error}</td>
              </tr>
            )}
            {!loading && !error && data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center text-muted">{emptyText}</td>
              </tr>
            )}
            {!loading && !error && data.map((row, idx) => (
              <tr key={idx} className="border-t border-[rgba(var(--app-border-subtle))]">
                {columns.map((c) => (
                  <td key={String(c.key)} className="px-4 py-3">
                    {c.render ? c.render(row) : String(row[c.key as keyof T] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 text-sm text-muted">
          <div>
            Page {page} of {pages}
          </div>
          <div className="flex gap-2">
            <button
              className="btn btn-outline btn-sm"
              disabled={page <= 1}
              onClick={() => onPageChange?.(Math.max(1, page - 1))}
            >
              Prev
            </button>
            <button
              className="btn btn-outline btn-sm"
              disabled={page >= pages}
              onClick={() => onPageChange?.(Math.min(pages, page + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Table;
