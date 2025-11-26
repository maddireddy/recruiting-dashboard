import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { documentService } from '../../services/document.service';

interface Props {
  id: string;
  fileType?: string;
  fileName?: string;
  onClose: () => void;
}

export default function DocumentPreview({ id, fileType, fileName, onClose }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { blob } = await documentService.fetchBlob(id);
        if (!active) return;
        const objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      } catch (err: any) {
        setError(err?.message || 'Failed to load preview');
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-100 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-200">
          <h2 className="text-lg font-bold">Preview - {fileName || 'Document'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-dark-200 rounded">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          {loading && <p className="text-sm text-dark-600">Loading preview...</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
          {!loading && !error && url && (
            <div className="w-full h-[80vh]">
              {fileType && fileType.toLowerCase().includes('image') ? (
                <img src={url} alt={fileName} className="max-w-full max-h-full mx-auto block" />
              ) : fileType && fileType.toLowerCase().includes('pdf') ? (
                <iframe src={url} title={fileName} className="w-full h-full border-0" />
              ) : (
                // Fallback to iframe for other types
                <iframe src={url} title={fileName} className="w-full h-full border-0" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
