import { useState } from "react";

async function loadPipelines() {
  const { pipeline } = await import("@xenova/transformers");
  const sentiment = await pipeline("sentiment-analysis", "Xenova/distilbert-base-uncased-finetuned-sst-2-english");
  const summarize = await pipeline("summarization", "Xenova/t5-small");
  return { sentiment, summarize };
}

export default function InterviewIntelligence() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ label: string; score: number; summary: string } | null>(null);

  async function analyze() {
    setLoading(true);
    try {
      const { sentiment, summarize } = await loadPipelines();
      const sres: any = await sentiment(text);
      const label = Array.isArray(sres) ? sres[0]?.label ?? "neutral" : sres.label ?? "neutral";
      const score = Array.isArray(sres) ? sres[0]?.score ?? 0 : sres.score ?? 0;
      const sumres: any = await summarize(text, { max_length: 80, min_length: 30 });
      const summary = Array.isArray(sumres) ? sumres[0]?.summary_text ?? "" : sumres.summary_text ?? "";
      setResult({ label, score, summary });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="section-title">Interview Intelligence</h1>
      <div className="card mt-4">
        <textarea
          className="input w-full h-40"
          placeholder="Paste an interview transcript or response…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="mt-3 flex gap-2">
          <button className="btn" disabled={loading || !text.trim()} onClick={analyze}>
            {loading ? "Analyzing…" : "Analyze"}
          </button>
        </div>
      </div>
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="card">
            <div className="font-medium">Sentiment</div>
            <div className="text-sm mt-1">{result.label} ({(result.score * 100).toFixed(1)}%)</div>
          </div>
          <div className="card">
            <div className="font-medium">Summary</div>
            <div className="text-sm mt-1">{result.summary}</div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function InterviewIntelligence() {
  const [text, setText] = useState('');
  const [sentiment, setSentiment] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!text.trim()) return toast.error('Enter interview notes');
    setLoading(true);
    try {
      const { pipeline } = await import('@xenova/transformers');
      const sentimentPipe = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
      const summarizer = await pipeline('summarization', 'Xenova/distilbart-cnn-6-6');
      const s = await sentimentPipe(text);
      setSentiment((s as any)[0]?.label ?? null);
      const sum = await summarizer(text, { max_length: 120, min_length: 60 });
      setSummary((sum as any)[0]?.summary_text ?? null);
    } catch (e: any) {
      toast.error(e?.message || 'AI analysis failed');
      setSentiment(null);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Interview Intelligence</h1>
      <p className="text-muted">Analyze interview notes for sentiment and summary.</p>
      <motion.textarea initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        value={text} onChange={(e) => setText(e.target.value)}
        className="w-full rounded border p-3 min-h-[160px]" placeholder="Paste interview notes..." />
      <motion.button whileTap={{ scale: 0.98 }} onClick={analyze} disabled={loading || !text.trim()}
        className="rounded bg-emerald-600 px-4 py-2 text-white disabled:opacity-50">
        {loading ? 'Analyzing...' : 'Analyze'}
      </motion.button>
      {sentiment && <p className="text-sm">Sentiment: <span className="font-medium">{sentiment}</span></p>}
      {summary && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded border p-3">
          <p className="text-sm text-gray-600">Summary</p>
          <p>{summary}</p>
        </motion.div>
      )}
    </div>
  );
}
