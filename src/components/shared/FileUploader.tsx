import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

import api from '../../services/api';

interface FileUploaderProps {
  candidateId: string;
  /** Callback receives either a public URL or an S3 object key if provided by backend. */
  onUploadSuccess: (payload: { fileUrl?: string; s3Key?: string }) => void;
}

export const FileUploader = ({ candidateId, onUploadSuccess }: FileUploaderProps) => {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Max size is 5MB.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('candidateId', candidateId);
    formData.append('type', 'RESUME');

    try {
      const response = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = response.data as { fileUrl?: string; s3Key?: string };
      const fileUrl = data?.fileUrl;
      const s3Key = data?.s3Key;
      if (fileUrl || s3Key) {
        onUploadSuccess({ fileUrl, s3Key });
        toast.success('Resume uploaded successfully');
      } else {
        toast.error('Upload succeeded but no file URL returned');
      }
    } catch (error) {
      console.error('[FileUploader] upload error', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [candidateId, onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-[rgb(var(--app-primary-from))] bg-[rgba(var(--app-primary-from),0.08)]' : 'border-[rgba(var(--app-border-subtle))] hover:border-[rgb(var(--app-primary-from))]'
      }`}
    >
      <input {...getInputProps()} />

      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--app-primary-from))]" />
          <p className="text-sm text-muted">Uploading to Cloud...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <UploadCloud className="h-10 w-10 text-muted" />
          <p className="text-sm font-medium text-[rgb(var(--app-text-primary))]">Click or drag resume here</p>
          <p className="text-xs text-muted">PDF or DOCX up to 5MB</p>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
