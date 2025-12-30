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
  /** Theme variant for label styling */
  variant?: 'default' | 'light';
}

export default function Field({ label, htmlFor, error, hint, children, required = false, className, variant = 'default' }: FieldProps) {
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;
  const labelColorClass = variant === 'light' ? 'text-[#64748B]' : 'text-[rgb(var(--app-text-primary))]';
  
  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      {/* Label with required asterisk per Master Prompt */}
      <label htmlFor={htmlFor} className={clsx('text-sm font-medium flex items-center gap-1', labelColorClass)}>
        {label}
        {required && <span className="ml-1 text-[#E74C3C]" aria-label="required">*</span>}
      </label>

      {children}

      {/* Helper text (only shown if no error) */}
      {hint && !error && <p className="text-xs text-[#94A3B8]">{hint}</p>}

      {/* Error message (uses new error color variable) */}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-[#E74C3C] font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
