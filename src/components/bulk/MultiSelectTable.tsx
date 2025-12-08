import React, { useState, useMemo } from 'react';

export interface TableColumn<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface MultiSelectTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  keyExtractor: (item: T) => string;
  onSelectionChange: (selectedIds: string[]) => void;
}

export function MultiSelectTable<T>({
  data,
  columns,
  keyExtractor,
  onSelectionChange,
}: MultiSelectTableProps<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allIds = useMemo(() => data.map(keyExtractor), [data, keyExtractor]);

  const isAllSelected = selectedIds.size > 0 && selectedIds.size === data.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < data.length;

  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
      onSelectionChange([]);
    } else {
      const newSet = new Set(allIds);
      setSelectedIds(newSet);
      onSelectionChange(Array.from(newSet));
    }
  };

  const toggleRow = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
    onSelectionChange(Array.from(newSet));
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 border-b text-left">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(input) => {
                  if (input) input.indeterminate = isSomeSelected;
                }}
                onChange={toggleAll}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 border-b text-left font-semibold text-gray-700">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            const id = keyExtractor(item);
            return (
              <tr
                key={id}
                className={`hover:bg-gray-50 transition ${selectedIds.has(id) ? 'bg-blue-50' : ''}`}
              >
                <td className="px-4 py-3 border-b">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(id)}
                    onChange={() => toggleRow(id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 border-b">
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {data.length === 0 && (
        <div className="text-center py-12 text-gray-500">No data available</div>
      )}
    </div>
  );
}
