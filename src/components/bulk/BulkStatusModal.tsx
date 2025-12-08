import React, { useState } from 'react';

interface BulkStatusModalProps {
  onClose: () => void;
  onUpdate: (newStatus: string) => void;
}

const STATUS_OPTIONS = [
  { value: 'APPLIED', label: 'Applied' },
  { value: 'SCREENING', label: 'Screening' },
  { value: 'INTERVIEW', label: 'Interview' },
  { value: 'OFFER', label: 'Offer' },
  { value: 'HIRED', label: 'Hired' },
  { value: 'REJECTED', label: 'Rejected' },
];

export const BulkStatusModal: React.FC<BulkStatusModalProps> = ({ onClose, onUpdate }) => {
  const [selectedStatus, setSelectedStatus] = useState('');

  const handleSubmit = () => {
    if (!selectedStatus) {
      alert('Please select a status');
      return;
    }
    onUpdate(selectedStatus);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Update Status</h2>

        <div className="space-y-3 mb-6">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedStatus(option.value)}
              className={`w-full p-4 rounded-lg border-2 transition ${
                selectedStatus === option.value ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="font-medium">{option.label}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Update Status
          </button>
        </div>
      </div>
    </div>
  );
};
