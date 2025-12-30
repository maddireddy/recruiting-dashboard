import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card } from '../components/ui/card';

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
      <PageHeader title="Interview Intelligence" subtitle="Analyze interview notes for sentiment and summary." />
      <p className="text-muted">Analyze interview notes for sentiment and summary.</p>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="input w-full min-h-[160px]"
          placeholder="Paste interview notes..."
        />
      </motion.div>
      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={analyze} disabled={loading || !text.trim()}>
          {loading ? 'Analyzing...' : 'Analyze'}
        </Button>
      </div>
      {sentiment && (
        <Card className="mt-4">
          <div className="font-medium">Sentiment</div>
          <div className="text-sm mt-1">{sentiment}</div>
        </Card>
      )}
      {summary && (
        <Card className="mt-4">
          <div className="font-medium">Summary</div>
          <div className="text-sm mt-1">{summary}</div>
        </Card>
      )}
    </div>
  );
}
