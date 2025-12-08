import React, { useState, useEffect } from 'react';
import { bulkApi } from '../../api/bulkApi';
import type { BulkOperationResponse } from '../../api/bulkApi';

interface ProgressModalProps {
  operationId: string;
  onClose: () => void;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({ operationId, onClose }) => {
  const [operation, setOperation] = useState<BulkOperationResponse | null>(null);
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await bulkApi.getOperationStatus(operationId);
        setOperation(status);

        if (
          status.status === 'COMPLETED' ||
          status.status === 'FAILED' ||
          status.status === 'PARTIAL_SUCCESS'
        ) {
          setPolling(false);
        }
      } catch (err) {
        console.error('Failed to fetch operation status', err);
      }
    };

    fetchStatus();

    if (polling) {
      const interval = setInterval(fetchStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [operationId, polling]);

  if (!operation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const isComplete =
    operation.status === 'COMPLETED' ||
    operation.status === 'FAILED' ||
    operation.status === 'PARTIAL_SUCCESS';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">
          {isComplete ? 'Operation Complete' : 'Processing...'}
        </h2>

        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Progress</span>
            <span className="text-gray-600">{operation.percentComplete}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                operation.status === 'FAILED' ? 'bg-red-600' : 'bg-blue-600'
              }`}
              style={{ width: `${operation.percentComplete}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{operation.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{operation.successful}</div>
            <div className="text-sm text-gray-600">Success</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{operation.failed}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
        </div>

        <div
          className={`text-center py-3 rounded-lg mb-6 ${
            operation.status === 'COMPLETED'
              ? 'bg-green-100 text-green-800'
              : operation.status === 'FAILED'
              ? 'bg-red-100 text-red-800'
              : operation.status === 'PARTIAL_SUCCESS'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          <span className="font-semibold">{operation.status.replace('_', ' ')}</span>
        </div>

        {operation.downloadUrl && (
          <a
            href={operation.downloadUrl}
            download
            className="block w-full text-center bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition mb-4"
          >
            Download Export File
          </a>
        )}

        {isComplete && (
          <button
            onClick={onClose}
            className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}
