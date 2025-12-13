import { useMemo, useState } from 'react';
import { useList, useCreate, useDelete } from '../services/hooks';
import { Plus, FileText, Download, Trash2, ShieldCheck } from 'lucide-react';
import DocumentUploadModal from '../components/documents/DocumentUploadModal';
import { documentService } from '../services/document.service';
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
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Get tenant ID from localStorage
  const tenantId = localStorage.getItem('tenantId') || undefined;

  // Use standardized hooks
  const documentsQ = useList<Document[]>('documents', (tid) => documentService.getAll(0, 100, tid), tenantId);
  const createM = useCreate('documents', documentService.upload, tenantId);
  const deleteM = useDelete('documents', documentService.delete, tenantId);

  // notify on delete result
  const handleDelete = async (id: string) => {
    try {
      await deleteM.mutateAsync(id);
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const documents = useMemo(() => documentsQ.data || [], [documentsQ.data]);
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }), []);

  return (
    <div className="space-y-10 px-6 py-8">
      <header className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(var(--app-border-subtle))] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            <ShieldCheck size={14} />
            Secure Vault
          </div>
          <h1 className="text-3xl font-semibold text-[rgb(var(--app-text-primary))]">Documents</h1>
          <p className="max-w-2xl text-sm text-muted">Store contracts, resumes, and compliance records in one place. Manage access, audit trails, and lightning-fast downloads.</p>
        </div>
        <button onClick={() => setShowUploadModal(true)} type="button" className="btn-primary">
          <Plus size={18} />
          Upload document
        </button>
      </header>

      {documentsQ.isLoading && (
        <div className="card space-y-3">
          <div className="h-4 w-48 animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
          <div className="h-4 w-full animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
        </div>
      )}

      {documentsQ.error && (
        <div className="card border-red-400/40 bg-red-500/5 text-red-300">
          Unable to load documents right now. Please try again shortly.
        </div>
      )}

      {documentsQ.data && documents.length === 0 && !documentsQ.isLoading && (
        <div className="card flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-[rgba(var(--app-border-subtle))] text-muted">
            <FileText size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">No documents uploaded yet</h3>
            <p className="max-w-sm text-sm text-muted">Upload resumes, offer letters, or compliance paperwork to keep your pipeline aligned.</p>
          </div>
          <button onClick={() => setShowUploadModal(true)} type="button" className="btn-primary">
            <Plus size={16} />
            Upload your first document
          </button>
        </div>
      )}

      {documents.length > 0 && (
        <section className="grid gap-4">
          {documents.map((doc: Document) => (
            <article key={doc.id} className="card flex flex-col gap-4 border-transparent transition hover:border-[rgba(var(--app-primary-from),0.45)] md:flex-row md:items-center md:justify-between">
              <div className="flex w-full flex-1 items-start gap-4">
                <span className="text-4xl drop-shadow-sm">{getFileIcon(doc.fileType)}</span>
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col gap-1">
                    <h3 className="truncate text-lg font-semibold text-[rgb(var(--app-text-primary))]">{doc.originalFileName}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                      <span className="chip chip-active text-[rgb(var(--app-primary-text))]">{doc.documentType.replace('_', ' ')}</span>
                      <span className="chip surface-muted">{doc.relatedEntityType}</span>
                      <span>{formatFileSize(doc.fileSize)}</span>
                      <span>•</span>
                      <span>Uploaded by {doc.uploadedBy}</span>
                      <span>•</span>
                      <span>{dateFormatter.format(new Date(doc.createdAt!))}</span>
                    </div>
                  </div>
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {doc.tags.map((tag) => (
                        <span key={tag} className="chip surface-muted text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2 self-end md:self-center">
                <button
                  onClick={() => documentService.download(doc.id!)}
                  type="button"
                  className="btn-muted px-3 py-2 text-sm"
                  title="Download"
                >
                  <Download size={16} />
                  Download
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this document?')) {
                      handleDelete(doc.id!);
                    }
                  }}
                  type="button"
                  className="btn-muted px-3 py-2 text-sm text-red-400 hover:border-red-400 hover:text-red-300"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      {showUploadModal && (
        <DocumentUploadModal
          entityType="GENERAL"
          entityId="general"
          onUpload={async (formData) => {
            try {
              await createM.mutateAsync(formData);
              setShowUploadModal(false);
            } catch (error) {
              console.error('Failed to upload document:', error);
            }
          }}
          onClose={() => setShowUploadModal(false)}
        />
      )}
    </div>
  );
}
