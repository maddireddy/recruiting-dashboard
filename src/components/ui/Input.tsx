import clsx from 'clsx';
import type { InputHTMLAttributes } from 'react';

export default function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const base = 'input rounded-xl bg-[rgb(var(--app-surface-muted))] border border-[rgba(var(--app-border-subtle))] px-3 py-2 text-[rgb(var(--app-text-primary))] placeholder-[rgb(var(--app-text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--app-primary-from),0.35)]';
  return <input className={clsx(base, className)} {...props} />;
}
