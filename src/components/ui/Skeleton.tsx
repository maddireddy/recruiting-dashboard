export default function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[rgba(var(--app-border-subtle))] ${className}`}
      aria-hidden="true"
    />
  );
}
