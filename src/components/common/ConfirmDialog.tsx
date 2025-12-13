import { useState } from 'react';

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmDialog({ open, title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-gray-700 mt-2">{message}</p>
        <div className="flex justify-end gap-2 mt-6">
          <button className="px-3 py-2 rounded border" onClick={onClose} disabled={loading}>{cancelText}</button>
          <button
            className="px-3 py-2 rounded bg-red-600 text-white"
            onClick={async () => {
              setLoading(true);
              await onConfirm();
              setLoading(false);
              onClose();
            }}
            disabled={loading}
          >
            {loading ? 'Processing…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
