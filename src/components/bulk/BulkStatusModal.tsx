import React, { useState } from 'react';

interface BulkStatusModalProps {
  onClose: () => void;
  onUpdate: (newStatus: string) => void;
}

const STATUS_OPTIONS = [
  { value: 'APPLIED', label: 'Applied', color: 'bg-gray-100', tooltip: 'New applicant received' },
  { value: 'SCREENING', label: 'Screening', color: 'bg-blue-100', tooltip: 'Phone/intro screening stage' },
  { value: 'INTERVIEW', label: 'Interview', color: 'bg-yellow-100', tooltip: 'Interview(s) scheduled or ongoing' },
  { value: 'OFFER', label: 'Offer', color: 'bg-purple-100', tooltip: 'Offer extended to candidate' },
  { value: 'HIRED', label: 'Hired', color: 'bg-green-100', tooltip: 'Candidate accepted and onboarded' },
  { value: 'REJECTED', label: 'Rejected', color: 'bg-red-100', tooltip: 'Declined or not moving forward' },
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
              title={option.tooltip}
              className={`w-full p-4 rounded-lg border-2 transition flex items-center justify-between ${
                selectedStatus === option.value ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="font-medium">{option.label}</span>
              <span className={`px-2 py-1 rounded text-xs ${option.color}`}>{option.tooltip}</span>
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
