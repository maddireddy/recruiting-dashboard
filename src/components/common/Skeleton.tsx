export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-10 bg-gray-100 rounded mb-2" />
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="animate-pulse grid gap-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="h-24 bg-gray-100 rounded" />
      ))}
    </div>
  );
}
