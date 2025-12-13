import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { jobService } from '../../services/job.service';
import { candidateService } from '../../services/candidate.service';
import { clientService } from '../../services/client.service';

export default function GlobalSearchBar() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const jobsQuery = useQuery({
    queryKey: ['global-search', 'jobs', q],
    queryFn: () => jobService.search({ q }).then(r => r || []),
    enabled: open && q.length >= 2,
  });
  const candidatesQuery = useQuery({
    queryKey: ['global-search', 'candidates', q],
    queryFn: () => candidateService.search?.({ q }).then((r: any) => r || []),
    enabled: open && q.length >= 2,
  });
  const clientsQuery = useQuery({
    queryKey: ['global-search', 'clients', q],
    queryFn: () => clientService.search(q).then((r: any) => r.data.content || []),
    enabled: open && q.length >= 2,
  });

  const results = [
    ...(jobsQuery.data || []).map((j: any) => ({ type: 'job', id: j.id, title: j.title })),
    ...(candidatesQuery.data || []).map((c: any) => ({ type: 'candidate', id: c.id, title: c.fullName })),
    ...(clientsQuery.data || []).map((cl: any) => ({ type: 'client', id: cl.id, title: cl.name })),
  ].slice(0, 8);

  return (
    <div className="relative w-full max-w-xl">
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="Search jobs, candidates, clients…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && q.length >= 2 && (
        <div className="absolute z-30 mt-1 w-full bg-white border rounded shadow">
          {results.length === 0 ? (
            <div className="p-3 text-sm text-gray-600">No results</div>
          ) : (
            <ul>
              {results.map((r, idx) => (
                <li key={idx}>
                  <button
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 grid grid-cols-[80px_1fr] gap-2 text-sm"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (r.type === 'job') navigate(`/jobs/${r.id}`);
                      if (r.type === 'candidate') navigate(`/candidates/${r.id}`);
                      if (r.type === 'client') navigate(`/clients?selected=${r.id}`);
                    }}
                  >
                    <span className="text-gray-500 uppercase text-xs">{r.type}</span>
                    <span>{r.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
