import { useMemo, useState } from 'react';
import { advancedSearchService, type CandidateSearchResult } from '../services/advancedSearch.service';
import { toast } from 'react-hot-toast';
import Table from '../components/common/Table';

export default function AdvancedSearch() {
  const [tenantId, setTenantId] = useState('default');
  const [query, setQuery] = useState('react developer AND (remote OR hybrid)');
  const [results, setResults] = useState<CandidateSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState('');
  const [minExp, setMinExp] = useState<number | ''>('');
  const [location, setLocation] = useState('');
  const columns = useMemo(() => ([
    { key: 'name', title: 'Name', sortable: true },
    { key: 'email', title: 'Email' },
    { key: 'location', title: 'Location' },
    { key: 'skills', title: 'Skills', render: (r: CandidateSearchResult) => (r.skills || []).join(', ') },
    { key: 'experienceYears', title: 'Experience (yrs)' },
  ]), []);

  const search = async () => {
    if (!query) return toast.error('Enter a query');
    try {
      setLoading(true);
      const data = await advancedSearchService.searchCandidates(query, tenantId);
      setResults(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast.error(e?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Advanced Candidate Search</h1>
      <div className="grid gap-2 max-w-2xl mb-4">
        <label className="block">
          <span className="text-sm">Tenant</span>
          <input className="input input-bordered w-full" value={tenantId} onChange={e => setTenantId(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm">Query</span>
          <textarea className="textarea textarea-bordered w-full" rows={3} value={query} onChange={e => setQuery(e.target.value)} />
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <label className="block">
            <span className="text-sm">Skills (comma)</span>
            <input className="input input-bordered w-full" value={skills} onChange={e => setSkills(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm">Min Experience (yrs)</span>
            <input className="input input-bordered w-full" type="number" value={minExp} onChange={e => setMinExp(e.target.value ? Number(e.target.value) : '')} />
          </label>
          <label className="block">
            <span className="text-sm">Location</span>
            <input className="input input-bordered w-full" value={location} onChange={e => setLocation(e.target.value)} />
          </label>
        </div>
        <button className="btn btn-primary" disabled={loading} onClick={search}>{loading ? 'Searching…' : 'Search'}</button>
      </div>
      <Table
        columns={columns}
        data={results}
        loading={loading}
        emptyText="No results"
      />
    </div>
  );
}
