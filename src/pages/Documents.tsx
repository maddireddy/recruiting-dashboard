import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../services/document.service';
import DocumentUploadModal from '../components/documents/DocumentUploadModal';
import { Plus, FileText, Download, Trash2 } from 'lucide-react';
import type { Document } from '../types/document';

const getFileIcon = (fileType: string) => {
  if (!fileType) return '📎';
  const type = fileType.toLowerCase();
  if (type.includes('pdf')) return '📄';
  if (type.includes('word') || type.includes('document') || type.includes('docx')) return '📝';
  if (type.includes('excel') || type.includes('spreadsheet') || type.includes('xlsx') || type.includes('csv')) return '📊';
  if (type.includes('powerpoint') || type.includes('presentation') || type.includes('pptx')) return '📈';
  if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg') || type.includes('gif')) return '�️';
  if (type.includes('text') || type.includes('txt')) return '📃';
  if (type.includes('zip') || type.includes('rar') || type.includes('tar') || type.includes('gz')) return '�️';
  if (type.includes('audio') || type.includes('mp3') || type.includes('wav')) return '🎵';
  if (type.includes('video') || type.includes('mp4') || type.includes('mov') || type.includes('avi')) return '🎬';
  return '📎';
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
};

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const [showUploadModal, setShowUploadModal] = useState(false);

  const documentsQuery = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentService.getAll(0, 100).then(r => r.data.content || [])
  });

  const uploadDocument = useMutation({
    mutationFn: (formData: FormData) => documentService.upload(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setShowUploadModal(false);
    }
  });

  const deleteDocument = useMutation({
    mutationFn: (id: string) => documentService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] })
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-dark-600">Manage all uploaded documents</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded transition"
        >
          <Plus size={18} />
          Upload Document
        </button>
      </div>

      {documentsQuery.isLoading && <p>Loading documents...</p>}
      {documentsQuery.error && <p className="text-red-500">Error loading documents</p>}

      {documentsQuery.data && documentsQuery.data.length === 0 && (
        <div className="text-center py-12 bg-dark-100 rounded-lg border border-dark-200">
          <FileText size={48} className="mx-auto mb-4 text-dark-600" />
          <p className="text-dark-600">No documents uploaded yet</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="mt-4 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded transition"
          >
            Upload Your First Document
          </button>
        </div>
      )}

      {documentsQuery.data && documentsQuery.data.length > 0 && (
        <div className="grid gap-3">
          {documentsQuery.data.map((doc: Document) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 bg-dark-100 rounded-lg border border-dark-200 hover:border-primary-500 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <span className="text-3xl">{getFileIcon(doc.fileType)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-lg truncate">{doc.originalFileName}</p>
                  <div className="flex items-center gap-4 text-sm text-dark-600 mt-1">
                    <span className="px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded text-xs">
                      {doc.documentType.replace('_', ' ')}
                    </span>
                    <span>{doc.relatedEntityType}</span>
                    <span>•</span>
                    <span>{formatFileSize(doc.fileSize)}</span>
                    <span>•</span>
                    <span>Uploaded by {doc.uploadedBy}</span>
                    <span>•</span>
                    <span>{new Date(doc.createdAt!).toLocaleDateString()}</span>
                  </div>
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {doc.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-dark-300 text-dark-600 text-xs rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => documentService.download(doc.id!)}
                  className="p-2 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 rounded transition"
                  title="Download"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this document?')) {
                      deleteDocument.mutate(doc.id!);
                    }
                  }}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUploadModal && (
        <DocumentUploadModal
          entityType="GENERAL"
          entityId="general"
          onUpload={(formData) => uploadDocument.mutate(formData)}
          onClose={() => setShowUploadModal(false)}
        />
      )}
    </div>
  );
}
