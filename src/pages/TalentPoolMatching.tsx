import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { clientService } from "../services/client.service";
import { candidateService } from "../services/candidate.service";
import type { Client } from "../types/client";
import type { Candidate } from "../types/candidate";
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

function textForClient(c: Client) {
  return [c.name, c.industry ?? "", c.description ?? ""].join(". ");
}

function textForCandidate(c: Candidate) {
  return [c.name, c.skills?.join(", ") ?? "", c.summary ?? ""].join(". ");
}

export default function TalentPoolMatching() {
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientService.getAll(),
  });
  const { data: candidates = [] } = useQuery({
    queryKey: ["candidates"],
    queryFn: () => candidateService.getAll(),
  });

  const [embedder, setEmbedder] = useState<any>(null);
  const [modelReady, setModelReady] = useState(false);
  const [clientEmbeds, setClientEmbeds] = useState<Record<string, Embedding>>({});
  const [candidateEmbeds, setCandidateEmbeds] = useState<Record<string, Embedding>>({});

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
      if (!embedder || clients.length === 0) return;
      const next: Record<string, Embedding> = {};
      for (const c of clients) {
        const t = textForClient(c);
        const res: number[] | number[][] = await embedder(t, { pooling: "mean" });
        const arr = Array.isArray(res[0]) ? (res as number[][])[0] : (res as number[]);
        next[String((c as any).id ?? c._id ?? c.name)] = arr as Embedding;
      }
      setClientEmbeds(next);
    })();
  }, [embedder, clients]);

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

  const suggestions = useMemo(() => {
    const out: Array<{ client: Client; candidate: Candidate; score: number }> = [];
    for (const cl of clients) {
      const ce = clientEmbeds[String((cl as any).id ?? cl._id ?? cl.name)];
      if (!ce) continue;
      for (const cand of candidates) {
        const ke = candidateEmbeds[String((cand as any).id ?? cand._id ?? cand.name)];
        if (!ke) continue;
        const score = cosineSimilarity(ce, ke);
        out.push({ client: cl, candidate: cand, score });
      }
    }
    return out.sort((a, b) => b.score - a.score).slice(0, 50);
  }, [clients, candidates, clientEmbeds, candidateEmbeds]);

  return (
    <div className="p-6">
      <PageHeader title="Talent Pool Matching" subtitle="Suggest candidates into client pools by semantic affinity" />
      {!modelReady && <p className="text-sm opacity-70">Loading embedding model…</p>}
      <div className="grid grid-cols-1 gap-4 mt-4">
        {suggestions.map(({ client, candidate, score }, idx) => (
          <div className="card" key={`${(client as any).id}-${(candidate as any).id}-${idx}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{client.name}</div>
                <div className="text-xs opacity-70">{client.industry}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{candidate.name}</div>
                <div className="text-xs opacity-70">{candidate.skills?.join(", ")}</div>
              </div>
            </div>
            <div className="mt-2 text-xs">Affinity: {(score * 100).toFixed(1)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
