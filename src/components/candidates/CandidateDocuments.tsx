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
    <section className="card space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">Documents</h3>
          <p className="text-sm text-muted">Store resumes, work samples, and compliance paperwork.</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn-primary inline-flex items-center gap-2 px-3 py-1.5 text-sm"
        >
          <Plus size={16} />
          Upload
        </button>
      </header>

      <DocumentList entityType="CANDIDATE" entityId={candidateId} />

      {showUploadModal && (
        <DocumentUploadModal
          entityType="CANDIDATE"
          entityId={candidateId}
          onUpload={(formData) => uploadDocument.mutate(formData)}
          onClose={() => setShowUploadModal(false)}
        />
      )}
    </section>
  );
}
