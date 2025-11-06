import { Link } from 'react-router-dom';

export interface TimelineItem {
  id: string;
  date: string; // ISO
  title: string;
  subtitle?: string;
  statusColor?: string; // tailwind color classes
  href?: string;
  chip?: string;
}

export default function Timeline({ title, items }: { title: string; items: TimelineItem[] }) {
  const sorted = [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return (
    <div className="bg-dark-100 rounded-lg border border-dark-200 p-4">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ol className="relative ml-3">
        {sorted.map((it, idx) => (
          <li key={it.id + idx} className="mb-6 pl-6">
            <span className="absolute -left-0.5 mt-1.5 h-3 w-3 rounded-full bg-primary-500 border-2 border-dark-100" />
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-dark-500 w-36">{new Date(it.date).toLocaleString()}</span>
                <span className="font-medium">{it.title}</span>
                {it.chip && (
                  <span className={`px-2 py-0.5 text-xs rounded-full border ${it.statusColor || 'bg-dark-200 border-dark-300 text-dark-400'}`}>
                    {it.chip}
                  </span>
                )}
                {it.href && (
                  <Link to={it.href} className="text-primary-400 hover:underline text-sm">Open</Link>
                )}
              </div>
              {it.subtitle && <div className="text-sm text-dark-600">{it.subtitle}</div>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
