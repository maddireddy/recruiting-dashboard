import Label from './Label';
import clsx from 'clsx';

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  /** Mark field as required (shows red asterisk) - Per Master Prompt */
  required?: boolean;
  /** Additional CSS classes for wrapper */
  className?: string;
}

export default function Field({ label, htmlFor, error, hint, children, required = false, className }: FieldProps) {
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;
  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      {/* Label with required asterisk per Master Prompt */}
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="ml-1 text-[rgb(var(--app-error))]" aria-label="required">*</span>}
      </Label>

      {children}

      {/* Helper text (only shown if no error) */}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}

      {/* Error message (uses new error color variable) */}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-[rgb(var(--app-error))]">
          {error}
        </p>
      )}
    </div>
  );
}
