import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

type Result = {
  type: 'candidate' | 'job' | 'client' | 'offer';
  id: string;
  label: string;
  subtitle?: string;
};

export default function GlobalSearch() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    if (!q) {
      setResults([]);
      setOpen(false);
      return;
    }
    timeoutRef.current = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data || []);
        setOpen(true);
      } catch (e) {
        setResults([]);
        setOpen(false);
      }
    }, 300);
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [q]);

  const hrefFor = (r: Result) => {
    switch (r.type) {
      case 'candidate': return `/candidates/${r.id}`;
      case 'job': return `/jobs/${r.id}`;
      case 'client': return `/clients?focus=${r.id}`; // basic link; could be client details page
      case 'offer': return `/offers/${r.id}`;
      default: return '/';
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--app-text-secondary))]" size={18} />
      <input
        ref={inputRef}
        type="text"
        placeholder="Search across candidates, jobs, clients..."
        className="input pl-11 pr-12"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => q && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
      />
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border bg-[rgb(var(--app-surface))] p-2 shadow">
          <ul>
            {results.map((r) => (
              <li key={`${r.type}-${r.id}`}>
                <Link to={hrefFor(r)} className="flex items-center justify-between rounded px-3 py-2 hover:bg-[rgb(var(--app-surface-muted))]">
                  <div>
                    <div className="text-sm font-medium">{r.label}</div>
                    {r.subtitle && <div className="text-xs text-muted">{r.subtitle}</div>}
                  </div>
                  <span className="text-xs px-2 py-1 rounded border">{r.type}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
