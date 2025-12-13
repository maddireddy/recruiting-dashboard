import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { candidateService } from '../services/candidate.service';
import { jobService } from '../services/job.service';

type CorpusItem = { id: string; text: string; embedding?: number[] };

export default function SemanticSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ id: string; text: string; score: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'candidates' | 'jobs' | 'demo'>('demo');

  // Lazy import transformers to keep bundle lean
  const getEmbeddings = async (text: string) => {
    const { pipeline } = await import('@xenova/transformers');
    const embed = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const output = await embed(text, { pooling: 'mean', normalize: true });
    // output is a Float32Array
    return Array.from(output.data as any as Float32Array);
  };

  const cosine = (a: number[], b: number[]) => {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      na += a[i] * a[i];
      nb += b[i] * b[i];
    }
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
  };

  const corpusDemo: CorpusItem[] = [
    { id: '1', text: 'Senior React developer with TypeScript and Vite experience.' },
    { id: '2', text: 'Backend engineer experienced in Node.js, PostgreSQL, and Kafka.' },
    { id: '3', text: 'Machine learning engineer familiar with transformers and ONNX.' },
  ];

  // Fetch real data
  const { data: candidateList } = useQuery({
    queryKey: ['semantic', 'candidates'],
    queryFn: () => candidateService.getAll(1, 50),
    staleTime: 5 * 60 * 1000,
  });
  const { data: jobList } = useQuery({
    queryKey: ['semantic', 'jobs'],
    queryFn: () => jobService.getAll(1, 50),
    staleTime: 5 * 60 * 1000,
  });

  const corpusFromSource: CorpusItem[] = useMemo(() => {
    if (source === 'candidates' && Array.isArray(candidateList)) {
      return candidateList.map((c: any) => ({ id: String(c.id ?? c._id ?? c.email ?? Math.random()), text: `${c.name ?? ''} ${c.title ?? ''} ${c.skills?.join(', ') ?? ''}`.trim() }));
    }
    if (source === 'jobs' && Array.isArray(jobList)) {
      return jobList.map((j: any) => ({ id: String(j.id ?? j._id ?? j.title ?? Math.random()), text: `${j.title ?? ''} ${j.description ?? ''}`.trim() }));
    }
    return corpusDemo;
  }, [source, candidateList, jobList]);

  useEffect(() => {
    // Precompute embeddings for current corpus, with localStorage cache
    (async () => {
      const cacheKey = `semantic.cache.${source}`;
      const cacheRaw = localStorage.getItem(cacheKey);
      const cache: Record<string, number[]> = cacheRaw ? JSON.parse(cacheRaw) : {};
      for (const item of corpusFromSource) {
        if (!cache[item.id]) {
          cache[item.id] = await getEmbeddings(item.text);
        }
        item.embedding = cache[item.id];
      }
      try { localStorage.setItem(cacheKey, JSON.stringify(cache)); } catch {}
    })();
  }, [source, corpusFromSource]);

  const onSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      const q = await getEmbeddings(query);
      const ranked = corpusFromSource
        .map((item) => ({ id: item.id, text: item.text, score: cosine(q, item.embedding || []) }))
        .sort((a, b) => b.score - a.score);
      setResults(ranked);
    } catch (e: any) {
      setError(e?.message || 'Failed to run semantic search');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Semantic Search</h1>
      <div className="flex gap-2">
        <select
          value={source}
          onChange={(e) => setSource(e.target.value as any)}
          className="rounded border px-2 py-2"
        >
          <option value="demo">Demo</option>
          <option value="candidates">Candidates</option>
          <option value="jobs">Jobs</option>
        </select>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe the candidate or job..."
          className="flex-1 rounded border px-3 py-2"
        />
        <button
          onClick={onSearch}
          disabled={loading}
          className="rounded bg-emerald-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <ul className="space-y-2">
        {results.map((r) => (
          <li key={r.id} className="rounded border px-3 py-2">
            <p className="font-medium">{r.text}</p>
            <p className="text-sm text-gray-500">score: {r.score.toFixed(3)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
