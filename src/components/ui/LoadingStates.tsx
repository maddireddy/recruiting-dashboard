import clsx from 'clsx';

/**
 * Loading States Component Library
 * Provides skeleton loaders for different UI patterns
 * Per Master Prompt: All data fetching must show loading states
 */

export interface SkeletonProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Base Skeleton component
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-lg bg-[rgba(var(--app-border-subtle))]',
        className
      )}
    />
  );
}

// ========================================
// TABLE SKELETON
// ========================================

export interface TableSkeletonProps {
  /** Number of rows to display */
  rows?: number;
  /** Number of columns */
  columns?: number;
  /** Show table header */
  showHeader?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Skeleton loader for data tables
 * Use while fetching table data
 */
export function TableSkeleton({
  rows = 10,
  columns = 5,
  showHeader = true,
  className,
}: TableSkeletonProps) {
  return (
    <div className={clsx('space-y-3', className)}>
      {/* Header Row */}
      {showHeader && (
        <div className="flex gap-4">
          {[...Array(columns)].map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-10 flex-1" />
          ))}
        </div>
      )}

      {/* Data Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-4">
          {[...Array(columns)].map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-16 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Simpler table skeleton with single column rows
 */
export function SimpleTableSkeleton({ rows = 10, className }: { rows?: number; className?: string }) {
  return (
    <div className={clsx('space-y-3', className)}>
      {[...Array(rows)].map((_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  );
}

// ========================================
// CARD SKELETON
// ========================================

export interface CardSkeletonProps {
  /** Number of cards to display */
  count?: number;
  /** Card height */
  height?: 'sm' | 'md' | 'lg';
  /** Grid columns (responsive) */
  columns?: 1 | 2 | 3 | 4;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Skeleton loader for card grids
 * Use while fetching card data (e.g., talent pools, jobs)
 */
export function CardSkeleton({
  count = 6,
  height = 'md',
  columns = 3,
  className,
}: CardSkeletonProps) {
  const heights = {
    sm: 'h-32',
    md: 'h-48',
    lg: 'h-64',
  };

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={clsx('grid gap-4', gridCols[columns], className)}>
      {[...Array(count)].map((_, i) => (
        <Skeleton key={i} className={heights[height]} />
      ))}
    </div>
  );
}

/**
 * Skeleton for detailed card content (with header, body, footer sections)
 */
export function DetailedCardSkeleton({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={clsx('grid gap-6 md:grid-cols-2 lg:grid-cols-3', className)}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="card space-y-4">
          {/* Header */}
          <Skeleton className="h-8 w-3/4" />
          {/* Body */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          {/* Footer */}
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ========================================
// FORM SKELETON
// ========================================

export interface FormSkeletonProps {
  /** Number of form fields */
  fields?: number;
  /** Show submit button */
  showButton?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Skeleton loader for forms
 * Use while loading form data for editing
 */
export function FormSkeleton({ fields = 6, showButton = true, className }: FormSkeletonProps) {
  return (
    <div className={clsx('space-y-6', className)}>
      {[...Array(fields)].map((_, i) => (
        <div key={i} className="space-y-2">
          {/* Label */}
          <Skeleton className="h-5 w-32" />
          {/* Input */}
          <Skeleton className="h-12 w-full" />
        </div>
      ))}

      {showButton && (
        <div className="flex gap-3 pt-4">
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-12 w-24" />
        </div>
      )}
    </div>
  );
}

// ========================================
// STATS SKELETON
// ========================================

export interface StatsSkeletonProps {
  /** Number of stat cards */
  count?: number;
  /** Grid columns (responsive) */
  columns?: 2 | 3 | 4;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Skeleton loader for dashboard stats
 * Use while loading dashboard metrics
 */
export function StatsSkeleton({ count = 4, columns = 4, className }: StatsSkeletonProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
  };

  return (
    <div className={clsx('grid gap-4', gridCols[columns], className)}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="card">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <Skeleton className="h-12 w-12 rounded-xl" />
            {/* Text */}
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ========================================
// LIST SKELETON
// ========================================

export interface ListSkeletonProps {
  /** Number of list items */
  items?: number;
  /** Show avatar/icon */
  showAvatar?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Skeleton loader for lists
 * Use while loading activity feeds, notifications, etc.
 */
export function ListSkeleton({ items = 8, showAvatar = true, className }: ListSkeletonProps) {
  return (
    <div className={clsx('space-y-4', className)}>
      {[...Array(items)].map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          {/* Avatar/Icon */}
          {showAvatar && <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />}
          {/* Content */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ========================================
// PAGE SKELETON
// ========================================

/**
 * Full page skeleton with header and content
 * Use for initial page load
 */
export function PageSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx('space-y-8', className)}>
      {/* Page Header */}
      <div className="space-y-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-96" />
      </div>

      {/* Stats Row */}
      <StatsSkeleton count={4} />

      {/* Content Area */}
      <div className="card">
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}

// ========================================
// CHART SKELETON
// ========================================

export interface ChartSkeletonProps {
  /** Chart height */
  height?: number;
  /** Show legend */
  showLegend?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Skeleton loader for charts
 * Use while loading chart/graph data
 */
export function ChartSkeleton({ height = 300, showLegend = true, className }: ChartSkeletonProps) {
  return (
    <div className={clsx('card space-y-4', className)}>
      {/* Chart Title */}
      <Skeleton className="h-6 w-48" />

      {/* Legend */}
      {showLegend && (
        <div className="flex gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      )}

      {/* Chart Area */}
      <Skeleton className="w-full" style={{ height: `${height}px` }} />
    </div>
  );
}

// ========================================
// PROFILE SKELETON
// ========================================

/**
 * Skeleton loader for profile/details pages
 * Use while loading candidate/job/user details
 */
export function ProfileSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx('space-y-6', className)}>
      {/* Header Section */}
      <div className="card">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <Skeleton className="h-24 w-24 rounded-full flex-shrink-0" />
          {/* Info */}
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs/Sections */}
      <div className="flex gap-4 border-b border-[rgba(var(--app-border-subtle))]">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-28" />
      </div>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================================
// KANBAN SKELETON
// ========================================

/**
 * Skeleton loader for Kanban boards
 * Use while loading submission pipeline
 */
export function KanbanSkeleton({ columns = 4, className }: { columns?: number; className?: string }) {
  return (
    <div className={clsx('flex gap-4 overflow-x-auto', className)}>
      {[...Array(columns)].map((_, colIndex) => (
        <div key={colIndex} className="flex-shrink-0 w-80 space-y-3">
          {/* Column Header */}
          <Skeleton className="h-12 w-full" />
          {/* Cards */}
          {[...Array(3)].map((_, cardIndex) => (
            <Skeleton key={cardIndex} className="h-32 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}
