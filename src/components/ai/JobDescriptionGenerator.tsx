import { useState } from 'react';
import { motion } from 'framer-motion';

async function getGenerator() {
  const { pipeline } = await import('@xenova/transformers');
  return pipeline('text-generation', 'Xenova/distilgpt2');
}

async function getSentiment() {
  const { pipeline } = await import('@xenova/transformers');
  return pipeline('sentiment-analysis');
}

export default function JobDescriptionGenerator() {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [result, setResult] = useState<string>('');
  const [biasScore, setBiasScore] = useState<number | null>(null);

  const generate = async () => {
    try {
      setLoading(true);
      const generator = await getGenerator();
      const out = await generator(text, { max_length: 300, temperature: 0.7 });
      const generated = (out as any)[0]?.generated_text || '';
      setResult(generated);
      const sentiment = await getSentiment();
      const bias = await sentiment(generated);
      setBiasScore(((bias as any)[0]?.score as number) ?? null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card space-y-4">
      <h2 className="text-lg font-semibold">AI Job Description Generator</h2>
      <textarea className="input w-full" rows={4} placeholder="Prompt: role, level, skills…" value={text} onChange={(e) => setText(e.target.value)} />
      <button className="btn btn-primary" disabled={loading || !text} onClick={generate}>Generate</button>
      {loading && <p className="text-sm text-muted">Generating… (runs in browser)</p>}
      {result && (
        <div className="space-y-2">
          <p className="text-sm text-muted">Bias score: {biasScore ?? 'n/a'}</p>
          <pre className="bg-[rgb(var(--app-surface-muted))] p-3 rounded text-sm whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </motion.div>
  );
}
