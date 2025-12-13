import React, { useMemo, useState } from 'react';
import { BulkEmailModal } from './BulkEmailModal';
import { BulkStatusModal } from './BulkStatusModal';
import { ProgressModal } from './ProgressModal';
import { bulkApi } from '../../api/bulkApi';
import { useAuthStore } from '../../store/authStore';
import { ExportFieldsModal } from './ExportFieldsModal';

interface BulkActionBarProps {
  selectedCount: number;
  selectedIds: string[];
  onClearSelection: () => void;
  onActionComplete: () => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  selectedIds,
  onClearSelection,
  onActionComplete,
}) => {
  const userRole = useAuthStore((s) => s.user?.role ?? 'RECRUITER');
  const canBulkEmail = useMemo(() => ['ADMIN','RECRUITER'].includes(userRole), [userRole]);
  const canBulkStatus = useMemo(() => ['ADMIN','RECRUITER'].includes(userRole), [userRole]);
  const canBulkExport = useMemo(() => ['ADMIN','RECRUITER'].includes(userRole), [userRole]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [progressOperationId, setProgressOperationId] = useState<string | null>(null);
  const [showExportFields, setShowExportFields] = useState<{
    visible: boolean;
    format: 'CSV' | 'EXCEL';
  }>({ visible: false, format: 'CSV' });

  const handleExport = (format: 'CSV' | 'EXCEL') => {
    setShowExportFields({ visible: true, format });
  };

  const runExportWithFields = async (fields: string[]) => {
    try {
      const response = await bulkApi.exportData({
        candidateIds: selectedIds,
        format: showExportFields.format,
        fields,
      });
      setShowExportFields({ visible: false, format: 'CSV' });
      setProgressOperationId(response.id);
    } catch (err) {
      alert('Export failed');
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const response = await bulkApi.updateStatus({
        candidateIds: selectedIds,
        newStatus,
      });
      setShowStatusModal(false);
      setProgressOperationId(response.id);
    } catch (err) {
      alert('Status update failed');
    }
  };

  const handleEmailSend = async (subject: string, body: string, options?: { sendIndividually?: boolean; templateId?: string }) => {
    try {
      const response = await bulkApi.sendEmail({
        candidateIds: selectedIds,
        subject,
        body,
        sendIndividually: options?.sendIndividually,
        templateId: options?.templateId,
      });
      setShowEmailModal(false);
      setProgressOperationId(response.id);
    } catch (err) {
      alert('Email send failed');
    }
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-lg">{selectedCount} selected</span>
              <button onClick={onClearSelection} className="text-gray-600 hover:text-gray-800 text-sm">
                Clear selection
              </button>
            </div>

            <div className="flex items-center gap-3">
              {canBulkStatus && (
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Update Status
                </button>
              )}

              {canBulkEmail && (
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Send Email
                </button>
              )}

              {canBulkExport && (
                <div className="relative group">
                  <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
                    Export ▾
                  </button>
                  <div className="absolute bottom-full mb-2 right-0 bg-white border rounded-lg shadow-lg hidden group-hover:block">
                    <button onClick={() => handleExport('CSV')} className="block w-full text-left px-4 py-2 hover:bg-gray-50">
                      Export as CSV
                    </button>
                    <button onClick={() => handleExport('EXCEL')} className="block w-full text-left px-4 py-2 hover:bg-gray-50">
                      Export as Excel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showEmailModal && <BulkEmailModal onClose={() => setShowEmailModal(false)} onSend={handleEmailSend} />}

      {showStatusModal && <BulkStatusModal onClose={() => setShowStatusModal(false)} onUpdate={handleStatusUpdate} />}

      {progressOperationId && (
        <ProgressModal
          operationId={progressOperationId}
          onClose={() => {
            setProgressOperationId(null);
            onClearSelection();
            onActionComplete();
          }}
        />
      )}

      {showExportFields.visible && (
        <ExportFieldsModal
          onClose={() => setShowExportFields({ visible: false, format: 'CSV' })}
          onExport={runExportWithFields}
        />
      )}
    </>
  );
};
