import React, { useState } from 'react';

interface ExportFieldsModalProps {
  onClose: () => void;
  onExport: (fields: string[]) => void;
}

const DEFAULT_FIELDS: Array<{ key: string; label: string }> = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'status', label: 'Status' },
  { key: 'currentLocation', label: 'Location' },
  { key: 'skills', label: 'Skills' },
  { key: 'experience', label: 'Experience (years)' },
  { key: 'expectedSalary', label: 'Expected Salary' },
];

export const ExportFieldsModal: React.FC<ExportFieldsModalProps> = ({ onClose, onExport }) => {
  const userId = localStorage.getItem('userId') || 'anonymous';
  const storageKey = `exportFields:${userId}`;
  const initial = (() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) as string[] : DEFAULT_FIELDS.map(f => f.key);
    } catch {
      return DEFAULT_FIELDS.map(f => f.key);
    }
  })();
  const [selected, setSelected] = useState<string[]>(initial);

  const toggleField = (key: string) => {
    setSelected(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected.length) {
      alert('Select at least one field');
      return;
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(selected));
    } catch {}
    onExport(selected);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-6">Choose Export Fields</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {DEFAULT_FIELDS.map((field) => (
              <label key={field.key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.includes(field.key)}
                  onChange={() => toggleField(field.key)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {field.label}
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
              Export
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
