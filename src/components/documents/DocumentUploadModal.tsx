import { useState, type ChangeEvent } from 'react';
import { X } from 'lucide-react';
import FileUpload from './FileUpload';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file');
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
            <FileUpload onFileSelect={setFile} accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg" maxSize={10} />

            <SelectField
              label="Document Type"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              options={DOCUMENT_TYPES.map((type) => ({ value: type, label: type.replace('_', ' ') }))}
            />

            <Field
              label="Tags (comma-separated)"
              value={tags}
              placeholder="java, senior, remote"
              onChange={(e) => setTags(e.target.value)}
            />
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

type FieldProps = {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
};

function Field({ label, value, onChange, placeholder }: FieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold uppercase tracking-[0.18em] text-[rgb(var(--app-text-primary))]">{label}</label>
      <input value={value} onChange={onChange} placeholder={placeholder} className="input" />
    </div>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
};

function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold uppercase tracking-[0.18em] text-[rgb(var(--app-text-primary))]">{label}</label>
      <select value={value} onChange={onChange} className="input">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
