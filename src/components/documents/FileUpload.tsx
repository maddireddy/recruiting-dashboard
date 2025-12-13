import { useState, useRef } from 'react';
import { Upload, X, File, CheckCircle } from 'lucide-react';

interface Props {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
  showProgress?: boolean;
  onCancel?: () => void;
}

export default function FileUpload({ onFileSelect, accept = '*', maxSize = 10, showProgress = true, onCancel }: Props) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleFileChange = (file: File) => {
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size exceeds ${maxSize}MB limit`);
      return;
    }

    setSelectedFile(file);
    // If parent supports progress, they can pass an uploader that reports progress
    // Simulate initial progress start; actual upload progress should be reported via onFileSelect callback's side-effect
    setProgress(0);
    onFileSelect(file);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const clearFile = () => {
    setSelectedFile(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <div
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          dragActive
            ? 'border-[rgba(var(--app-primary-from),0.6)] bg-[rgba(var(--app-primary-from),0.08)]'
            : 'border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] hover:border-[rgba(var(--app-primary-from),0.45)]'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input ref={inputRef} type="file" className="hidden" accept={accept} onChange={handleChange} />

        {!selectedFile ? (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface))] text-muted">
              <Upload size={28} />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">Drop file here or click to upload</p>
              <p className="text-sm text-muted">Supports PDF, Word, images, and more. Max size {maxSize}MB.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-4 text-left sm:flex-nowrap">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(var(--app-primary-from),0.12)] text-[rgb(var(--app-primary-from))]">
              <CheckCircle size={24} />
            </span>
            <File size={24} className="text-muted" />
            <div className="min-w-[12rem] flex-1">
              <p className="font-semibold text-[rgb(var(--app-text-primary))] line-clamp-2">{selectedFile.name}</p>
              <p className="text-sm text-muted">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              {showProgress && (
                <div className="mt-2 h-2 w-full rounded bg-[rgb(var(--app-surface-muted))]">
                  <div className="h-2 rounded bg-[rgb(var(--app-primary-from))]" style={{ width: `${progress}%` }} />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="rounded-lg border border-transparent p-2 text-sm text-red-400 transition hover:border-red-400"
            >
              <X size={18} />
              Clear
            </button>
            {showProgress && onCancel && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel();
                }}
                className="rounded-lg border p-2 text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
