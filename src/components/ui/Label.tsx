import clsx from 'clsx';
import { LabelHTMLAttributes } from 'react';

export default function Label({ className, children, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={clsx('text-sm font-semibold text-[rgb(var(--app-text-primary))] flex items-center gap-1', className)} {...props}>
      {children}
    </label>
  );
}
