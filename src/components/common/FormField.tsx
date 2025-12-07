import type { ReactNode } from 'react';

export type FormFieldProps = {
  label: string;
  children: ReactNode;
  required?: boolean;
  description?: string;
  spacing?: 'sm' | 'md';
  error?: string | null;
};

export function FormField({ label, children, required, description, spacing = 'md', error }: FormFieldProps) {
  const gapClass = spacing === 'sm' ? 'gap-1.5' : 'gap-2';

  return (
    <label className={`flex flex-col ${gapClass} text-sm text-[rgb(var(--app-text-primary))]`}>
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
        {required ? ' *' : ''}
      </span>
      {description && <span className="text-xs leading-relaxed text-muted">{description}</span>}
      {children}
      {error ? <span className="text-xs font-medium text-red-400">{error}</span> : null}
    </label>
  );
}

export function FieldGroup({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{title}</p>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
