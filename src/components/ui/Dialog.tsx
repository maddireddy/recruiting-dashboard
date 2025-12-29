import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className={`relative w-full mx-4 rounded-2xl border border-app-border-subtle bg-app-surface-elevated shadow-2xl ${sizeClasses[size]}`}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 text-app-text-secondary hover:text-app-text-primary transition"
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          {title && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-app-text-primary">
                {title}
              </h2>
              {description && (
                <p className="mt-1 text-sm text-app-text-secondary">
                  {description}
                </p>
              )}
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
