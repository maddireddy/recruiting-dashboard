import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { candidateService } from "../services/candidate.service";
import { jobService } from "../services/job.service";
import type { Candidate } from "../types/candidate";
import type { Job } from "../types/job";
import PageHeader from "../components/ui/PageHeader";

type Embedding = number[];

async function loadEmbeddingModel() {
  const { pipeline } = await import("@xenova/transformers");
  return pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
}

function cosineSimilarity(a: Embedding, b: Embedding) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length && i < b.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}

function textForCandidate(c: Candidate) {
  return [c.name, c.skills?.join(", ") ?? "", c.summary ?? ""].join(". ");
}

function textForJob(j: Job) {
  return [j.title, j.location ?? "", j.description ?? "", j.skills?.join(", ") ?? ""].join(". ");
}

export default function Rediscovery() {
  const { data: candidates = [] } = useQuery({
    queryKey: ["candidates"],
    queryFn: () => candidateService.getAll(),
  });
  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => jobService.getAll(),
  });

  const [modelReady, setModelReady] = useState(false);
  const [embedder, setEmbedder] = useState<any>(null);
  const [candidateEmbeds, setCandidateEmbeds] = useState<Record<string, Embedding>>({});
  const [jobEmbeds, setJobEmbeds] = useState<Record<string, Embedding>>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      const m = await loadEmbeddingModel();
      if (!mounted) return;
      setEmbedder(m);
      setModelReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    (async () => {
      if (!embedder || candidates.length === 0) return;
      const next: Record<string, Embedding> = {};
      for (const c of candidates) {
        const t = textForCandidate(c);
        const res: number[] | number[][] = await embedder(t, { pooling: "mean" });
        const arr = Array.isArray(res[0]) ? (res as number[][])[0] : (res as number[]);
        next[String((c as any).id ?? c._id ?? c.name)] = arr as Embedding;
      }
      setCandidateEmbeds(next);
    })();
  }, [embedder, candidates]);

  useEffect(() => {
    (async () => {
      if (!embedder || jobs.length === 0) return;
      const next: Record<string, Embedding> = {};
      for (const j of jobs) {
        const t = textForJob(j);
        const res: number[] | number[][] = await embedder(t, { pooling: "mean" });
        const arr = Array.isArray(res[0]) ? (res as number[][])[0] : (res as number[]);
        next[String((j as any).id ?? j._id ?? j.title)] = arr as Embedding;
      }
      setJobEmbeds(next);
    })();
  }, [embedder, jobs]);

  const rankedMatches = useMemo(() => {
    const out: Array<{ candidate: Candidate; job: Job; score: number }> = [];
    for (const c of candidates) {
      const ce = candidateEmbeds[String((c as any).id ?? c._id ?? c.name)];
      if (!ce) continue;
      for (const j of jobs) {
        const je = jobEmbeds[String((j as any).id ?? j._id ?? j.title)];
        if (!je) continue;
        const score = cosineSimilarity(ce, je);
        out.push({ candidate: c, job: j, score });
      }
    }
    return out.sort((a, b) => b.score - a.score).slice(0, 50);
  }, [candidates, jobs, candidateEmbeds, jobEmbeds]);

  return (
    <div className="p-6">
      <PageHeader title="Rediscovery" subtitle="Find matching candidates for active jobs using semantic embeddings" />
      {!modelReady && <p className="text-sm opacity-70">Loading embedding model…</p>}
      <div className="grid grid-cols-1 gap-4 mt-4">
        {rankedMatches.map(({ candidate, job, score }, idx) => (
          <div className="card" key={`${(candidate as any).id}-${(job as any).id}-${idx}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{candidate.name}</div>
                <div className="text-xs opacity-70">{candidate.skills?.join(", ")}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{job.title}</div>
                <div className="text-xs opacity-70">{job.location}</div>
              </div>
            </div>
            <div className="mt-2 text-xs">Match score: {(score * 100).toFixed(1)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
