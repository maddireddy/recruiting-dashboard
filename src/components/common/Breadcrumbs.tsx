import { Link, useLocation } from 'react-router-dom';

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const parts = pathname.split('/').filter(Boolean);

  const buildPath = (idx: number) => '/' + parts.slice(0, idx + 1).join('/');

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-600 mb-4">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link to="/" className="hover:underline">Home</Link>
        </li>
        {parts.map((p, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="text-gray-400">/</span>
            {i < parts.length - 1 ? (
              <Link to={buildPath(i)} className="hover:underline capitalize">
                {decodeURIComponent(p)}
              </Link>
            ) : (
              <span className="font-medium capitalize">{decodeURIComponent(p)}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
