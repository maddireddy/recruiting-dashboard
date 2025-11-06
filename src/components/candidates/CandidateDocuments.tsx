import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../../services/document.service';
import DocumentList from '../documents/DocumentList';
import DocumentUploadModal from '../documents/DocumentUploadModal';
import { Plus } from 'lucide-react';

interface Props {
  candidateId: string;
}

export default function CandidateDocuments({ candidateId }: Props) {
  const queryClient = useQueryClient();
  const [showUploadModal, setShowUploadModal] = useState(false);

  const uploadDocument = useMutation({
    mutationFn: (formData: FormData) => documentService.upload(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', 'CANDIDATE', candidateId] });
      setShowUploadModal(false);
    }
  });

  return (
    <div className="bg-dark-100 rounded-lg border border-dark-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Documents</h3>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-1 text-sm px-3 py-1 bg-primary-500 hover:bg-primary-600 rounded transition"
        >
          <Plus size={16} />
          Upload
        </button>
      </div>

      <DocumentList entityType="CANDIDATE" entityId={candidateId} />

      {showUploadModal && (
        <DocumentUploadModal
          entityType="CANDIDATE"
          entityId={candidateId}
          onUpload={(formData) => uploadDocument.mutate(formData)}
          onClose={() => setShowUploadModal(false)}
        />
      )}
    </div>
  );
}
