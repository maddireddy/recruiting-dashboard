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
      } catch (err: unknown) {
        const error = err instanceof Error ? err.message : String(err);
        setError(error || 'Failed to load preview');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface))] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[rgba(var(--app-border-subtle))] px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">Preview</h2>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">{fileName || 'Document'}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-transparent p-2 text-[rgb(var(--app-text-secondary))] transition hover:border-[rgba(var(--app-primary-from),0.4)] hover:text-[rgb(var(--app-primary-from))]"
          >
            <X size={18} />
          </button>
        </div>
        <div className="bg-[rgb(var(--app-surface-muted))] p-4">
          {loading && <p className="text-sm text-muted">Loading preview…</p>}
          {error && <p className="text-sm text-red-400">{error}</p>}
          {!loading && !error && url && (
            <div className="h-[80vh] w-full overflow-auto rounded-xl border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface))]">
              {fileType && fileType.toLowerCase().includes('image') ? (
                <img src={url} alt={fileName} className="mx-auto block max-h-full max-w-full" />
              ) : fileType && fileType.toLowerCase().includes('pdf') ? (
                <iframe src={url} title={fileName} className="h-full w-full border-0" />
              ) : (
                <iframe src={url} title={fileName} className="h-full w-full border-0" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
