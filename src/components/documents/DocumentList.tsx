import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { documentService } from '../../services/document.service';
import type { Document } from '../../types/document';
import { FileText, Download, Trash2 } from 'lucide-react';
import DocumentPreview from './DocumentPreview';

interface Props {
  entityType: string;
  entityId: string;
}

const getFileIcon = (fileType: string) => {
  if (!fileType) return '📎';
  const type = fileType.toLowerCase();
  if (type.includes('pdf')) return '📄';
  if (type.includes('word') || type.includes('document') || type.includes('docx')) return '📝';
  if (type.includes('excel') || type.includes('spreadsheet') || type.includes('xlsx') || type.includes('csv')) return '📊';
  if (type.includes('powerpoint') || type.includes('presentation') || type.includes('pptx')) return '📈';
  if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg') || type.includes('gif')) return '🖼️';
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

export default function DocumentList({ entityType, entityId }: Props) {
  const queryClient = useQueryClient();
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  const documentsQuery = useQuery({
    queryKey: ['documents', entityType, entityId],
    queryFn: () => documentService.getByEntityType(entityType, entityId).then((r: { data: Document[] }) => r.data)
  });

  const deleteDocument = useMutation({
    mutationFn: (id: string) => documentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', entityType, entityId] });
    }
  });

  if (documentsQuery.isLoading) return <p className="text-sm text-muted">Loading documents…</p>;
  if (documentsQuery.error) return <p className="text-sm text-red-400">Error loading documents</p>;
  if (!documentsQuery.data || documentsQuery.data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] px-6 py-10 text-center">
        <FileText size={32} className="text-muted" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[rgb(var(--app-text-primary))]">No documents yet</p>
          <p className="text-xs text-muted">Upload resumes, compliance packets, and samples to keep this profile complete.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documentsQuery.data.map((doc: Document) => (
        <div
          key={doc.id}
          className="flex items-center justify-between gap-4 rounded-xl border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] px-4 py-3 transition hover:border-[rgba(var(--app-primary-from),0.45)]"
        >
          <div className="flex items-center gap-3 flex-1">
            <span className="text-2xl">{getFileIcon(doc.fileType)}</span>
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium text-[rgb(var(--app-text-primary))]">{doc.originalFileName}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                <span>{doc.documentType.replace('_', ' ')}</span>
                <span>•</span>
                <span>{formatFileSize(doc.fileSize)}</span>
                <span>•</span>
                <span>{new Date(doc.createdAt!).toLocaleDateString()}</span>
              </div>
              {doc.tags && doc.tags.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {doc.tags.map(tag => (
                    <span key={tag} className="rounded-full border border-[rgba(var(--app-primary-from),0.4)] bg-[rgba(var(--app-primary-from),0.08)] px-2 py-0.5 text-xs font-medium text-[rgb(var(--app-primary-from))]">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => documentService.download(doc.id!)}
              className="rounded-lg border border-transparent bg-[rgba(var(--app-primary-from),0.12)] p-2 text-[rgb(var(--app-primary-from))] transition hover:border-[rgba(var(--app-primary-from),0.45)] hover:bg-[rgba(var(--app-primary-from),0.18)]"
              title="Download"
            >
              <Download size={16} />
            </button>
            <button
              onClick={() => setPreviewDoc(doc)}
              className="rounded-lg border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface))] p-2 text-[rgb(var(--app-text-secondary))] transition hover:border-[rgba(var(--app-primary-from),0.4)] hover:text-[rgb(var(--app-primary-from))]"
              title="Preview"
            >
              👁️
            </button>
            <button
              onClick={() => {
                if (confirm('Delete this document?')) {
                  deleteDocument.mutate(doc.id!, {
                    onSuccess: () => {
                      // notify parent via invalidation already handled
                    },
                    onError: (err: unknown) => {
                      const message = err instanceof Error ? err.message : 'Failed to delete document';
                      alert(message);
                    }
                  });
                }
              }}
              className="rounded-lg border border-transparent bg-rose-500/15 p-2 text-rose-400 transition hover:border-rose-400/50 hover:bg-rose-500/25"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
      {previewDoc && (
        <DocumentPreview
          id={previewDoc.id!}
          fileType={previewDoc.fileType}
          fileName={previewDoc.originalFileName}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
}

