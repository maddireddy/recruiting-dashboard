import { useState, type ChangeEvent } from 'react';
import { X } from 'lucide-react';
import FileUpload from './FileUpload';
import Field from '../../components/ui/Field';
import { z } from 'zod';

interface Props {
  entityType: string;
  entityId: string;
  onUpload: (formData: FormData) => void;
  onClose: () => void;
}

const DOCUMENT_TYPES = [
  'RESUME',
  'OFFER_LETTER',
  'CONTRACT',
  'JOB_DESCRIPTION',
  'INVOICE',
  'OTHER'
];

export default function DocumentUploadModal({ entityType, entityId, onUpload, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('RESUME');
  const [tags, setTags] = useState('');
  const [errors, setErrors] = useState<{ file?: string; documentType?: string }>({});

  const schema = z.object({
    file: z.custom<File>((val) => val instanceof File, { message: 'File is required' }),
    documentType: z.enum(['RESUME','OFFER_LETTER','CONTRACT','JOB_DESCRIPTION','INVOICE','OTHER']),
    tags: z.string().optional(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const parsed = schema.safeParse({ file, documentType, tags });
    if (!parsed.success) {
      const next: typeof errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof typeof errors;
        next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('relatedEntityType', entityType);
    formData.append('relatedEntityId', entityId);
    formData.append('documentType', documentType);
    formData.append('uploadedBy', localStorage.getItem('userEmail') || 'unknown');
    
    if (tags) {
      tags.split(',').forEach(tag => formData.append('tags', tag.trim()));
    }

    onUpload(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
      <div className="card w-full max-w-2xl max-h-[90vh] overflow-hidden p-0">
        <div className="sticky top-0 flex items-center justify-between border-b border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface))] px-6 py-4">
          <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">Upload Document</h2>
          <button onClick={onClose} type="button" className="rounded-lg border border-transparent p-2 text-muted transition hover:border-[rgba(var(--app-border-subtle))]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto px-6 py-6 max-h-[calc(90vh-72px)]">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold uppercase tracking-[0.18em] text-[rgb(var(--app-text-primary))]">File</label>
              <FileUpload onFileSelect={setFile} accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg" maxSize={10} />
              {errors.file && <p id="file-error" role="alert" className="mt-1 text-xs text-red-500">{errors.file}</p>}
            </div>

            <Field label="Document Type" htmlFor="documentType" error={errors.documentType}>
              <select id="documentType" value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="input" aria-invalid={!!errors.documentType} aria-describedby={errors.documentType ? 'documentType-error' : undefined}>
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type} value={type}>{type.replace('_', ' ')}</option>
                ))}
              </select>
            </Field>

            <Field label="Tags (comma-separated)" htmlFor="tags">
              <input id="tags" value={tags} placeholder="java, senior, remote" onChange={(e) => setTags(e.target.value)} className="input" />
            </Field>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-muted">
              Cancel
            </button>
            <button type="submit" disabled={!file} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
              Upload document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Using shared Field component from components/ui/Field
