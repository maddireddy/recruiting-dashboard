import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'subtle' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export default function Button({ variant = 'primary', size = 'md', className, ...props }: Props) {
  const base = 'inline-flex items-center justify-center rounded-xl transition font-medium focus:outline-none focus:ring-2 focus:ring-[rgba(var(--app-primary-from),0.35)] disabled:opacity-50';
  const sizes: Record<Size, string> = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-base',
  };
  const variants: Record<Variant, string> = {
    primary: 'bg-[rgb(var(--app-primary))] text-white shadow-sm hover:brightness-105',
    subtle: 'bg-[rgba(var(--app-primary-from),0.10)] text-[rgb(var(--app-text-primary))] hover:bg-[rgba(var(--app-primary-from),0.18)]',
    ghost: 'bg-transparent text-[rgb(var(--app-text-primary))] hover:bg-[rgba(var(--app-primary-from),0.08)]',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  return <button className={clsx(base, sizes[size], variants[variant], className)} {...props} />;
}
