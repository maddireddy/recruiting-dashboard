import { ReactNode } from 'react';
import clsx from 'clsx';

/**
 * EmptyState Component
 * Displays when there is no data to show in a list/table/grid
 * Per Master Prompt: All empty states must have icon, title, description, and optional CTA
 */

export interface EmptyStateProps {
  /** Icon component (from lucide-react recommended) */
  icon: ReactNode;
  /** Main heading */
  title: string;
  /** Descriptive text explaining the empty state */
  description: string;
  /** Optional CTA button */
  action?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Variant for different use cases */
  variant?: 'default' | 'compact';
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  variant = 'default',
}: EmptyStateProps) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center',
        variant === 'default' ? 'py-16 px-4' : 'py-8 px-4',
        className
      )}
    >
      {/* Icon Circle */}
      <div
        className={clsx(
          'flex items-center justify-center rounded-full bg-[rgba(var(--app-primary),0.1)] text-[rgb(var(--app-primary))]',
          variant === 'default' ? 'h-20 w-20' : 'h-16 w-16'
        )}
      >
        {icon}
      </div>

      {/* Title */}
      <h3
        className={clsx(
          'font-semibold text-[rgb(var(--app-text-primary))]',
          variant === 'default' ? 'mt-6 text-lg' : 'mt-4 text-base'
        )}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className={clsx(
          'text-muted max-w-md',
          variant === 'default' ? 'mt-2 text-sm' : 'mt-1 text-xs'
        )}
      >
        {description}
      </p>

      {/* Action Button */}
      {action && <div className={clsx(variant === 'default' ? 'mt-8' : 'mt-6')}>{action}</div>}
    </div>
  );
}

/**
 * Specialized empty state for tables
 */
export function TableEmptyState(props: Omit<EmptyStateProps, 'variant'>) {
  return <EmptyState {...props} variant="default" />;
}

/**
 * Specialized empty state for search results
 */
export function SearchEmptyState(props: Omit<EmptyStateProps, 'variant'>) {
  return <EmptyState {...props} variant="default" />;
}

/**
 * Specialized empty state for cards/widgets (more compact)
 */
export function CardEmptyState(props: Omit<EmptyStateProps, 'variant'>) {
  return <EmptyState {...props} variant="compact" />;
}
