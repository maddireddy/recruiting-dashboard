import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../../services/document.service';
import type { Document } from '../../types/document';
import { FileText, Download, Trash2 } from 'lucide-react';

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

  const documentsQuery = useQuery({
    queryKey: ['documents', entityType, entityId],
  queryFn: () => documentService.getByEntityType(entityType, entityId).then((r: any) => r.data)
  });

  const deleteDocument = useMutation({
    mutationFn: (id: string) => documentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', entityType, entityId] });
    }
  });

  if (documentsQuery.isLoading) return <p className="text-sm text-dark-600">Loading documents...</p>;
  if (documentsQuery.error) return <p className="text-sm text-red-500">Error loading documents</p>;
  if (!documentsQuery.data || documentsQuery.data.length === 0) {
    return (
      <div className="text-center py-8 bg-dark-200 rounded border border-dark-300">
        <FileText size={32} className="mx-auto mb-2 text-dark-600" />
        <p className="text-sm text-dark-600">No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documentsQuery.data.map((doc: Document) => (
        <div
          key={doc.id}
          className="flex items-center justify-between p-3 bg-dark-200 rounded border border-dark-300 hover:border-primary-500 transition-colors"
        >
          <div className="flex items-center gap-3 flex-1">
            <span className="text-2xl">{getFileIcon(doc.fileType)}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{doc.originalFileName}</p>
              <div className="flex items-center gap-3 text-xs text-dark-600">
                <span>{doc.documentType.replace('_', ' ')}</span>
                <span>•</span>
                <span>{formatFileSize(doc.fileSize)}</span>
                <span>•</span>
                <span>{new Date(doc.createdAt!).toLocaleDateString()}</span>
              </div>
              {doc.tags && doc.tags.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {doc.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-primary-500/20 text-primary-400 text-xs rounded">
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
              className="p-2 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 rounded transition"
              title="Download"
            >
              <Download size={16} />
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
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
