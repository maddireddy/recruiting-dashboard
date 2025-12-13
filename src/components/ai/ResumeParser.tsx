import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCandidateStore } from '../../store/ai/candidateStore';

// Lazy import the transformers pipeline to avoid increasing initial bundle size
async function getNER() {
  const { pipeline } = await import('@xenova/transformers');
  return pipeline('token-classification', 'Xenova/bert-base-NER');
}

function extractEntity(entities: any[], label: string) {
  const found = entities.find((e) => e.entity_group === label || e.label === label);
  return found?.word || found?.entity || '';
}

function extractSkills(text: string): string[] {
  // naive skills extraction; replace with better model or dictionary
  const skills = ['JavaScript','TypeScript','React','Node','Python','AWS','SQL','CSS','HTML'];
  const lower = text.toLowerCase();
  return skills.filter((s) => lower.includes(s.toLowerCase()));
}

export default function ResumeParser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addCandidate = useCandidateStore((s) => s.addCandidate);

  const parseResume = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      const text = await file.text();
      const ner = await getNER();
      const entities = await ner(text);
      const candidate = {
        name: extractEntity(entities, 'PER'),
        email: extractEntity(entities, 'EMAIL'),
        phone: extractEntity(entities, 'PHONE'),
        skills: extractSkills(text),
        experience: text.slice(0, 500),
      };
      addCandidate(candidate);
    } catch (e: any) {
      setError(e?.message || 'Failed to parse resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card space-y-4">
      <h2 className="text-lg font-semibold">Resume Parser (AI)</h2>
      <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={(e) => { const f = e.target.files?.[0]; if (f) parseResume(f); }} />
      {loading && <p className="text-sm text-muted">Parsing…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </motion.div>
  );
}
