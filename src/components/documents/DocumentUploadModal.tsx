import { useState } from 'react';
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-100 rounded-lg max-w-xl w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-200">
          <h2 className="text-xl font-bold">Upload Document</h2>
          <button onClick={onClose} className="p-2 hover:bg-dark-200 rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FileUpload
            onFileSelect={setFile}
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
            maxSize={10}
          />

          <div>
            <label className="block text-sm font-medium mb-2">Document Type</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
              required
            >
              {DOCUMENT_TYPES.map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="java, senior, remote"
              className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-dark-200 hover:bg-dark-300 rounded transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
