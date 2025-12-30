import { Link } from 'react-router-dom';
import { Sparkles, CheckCircle } from 'lucide-react';
import { getAIConfig, getActiveAIModel } from '../lib/aiConfig';

export default function AiLab() {
  const aiConfig = getAIConfig();
  const activeModel = getActiveAIModel();
  const isAdvancedAIEnabled = aiConfig.gpt51CodexMaxEnabled && aiConfig.enabledForAllClients;

  const tools = [
    { path: '/ai/semantic-search', title: 'Semantic Search', desc: 'Embed and rank candidates/jobs by similarity.' },
    { path: '/ai/resume-parser', title: 'Resume Parser', desc: 'Extract entities from resumes using NER.' },
    { path: '/ai/jd-generator', title: 'JD Generator', desc: 'Generate job descriptions and analyze bias.' },
  ];
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">AI Lab</h1>
          <p className="text-muted">Explore AI-powered tools to accelerate recruiting workflows.</p>
        </div>
        {isAdvancedAIEnabled && (
          <div className="flex items-center gap-2 rounded-lg border border-[#27ae60] bg-[#27ae60]/10 px-4 py-2 text-sm font-medium text-[#27ae60]">
            <CheckCircle size={16} />
            <span>{activeModel} Active</span>
          </div>
        )}
      </div>

      {isAdvancedAIEnabled && (
        <div className="rounded-xl border border-[rgba(var(--app-primary-from),0.2)] bg-[rgba(var(--app-primary-from),0.05)] p-5">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 text-[rgb(var(--app-primary-from))]" />
            <div className="flex-1">
              <h3 className="font-semibold text-[rgb(var(--app-text-primary))]">GPT-5.1-Codex-Max Enabled</h3>
              <p className="mt-1 text-sm text-muted">
                You're using our most advanced AI model with enhanced reasoning and analysis capabilities.
                All tools below are powered by GPT-5.1-Codex-Max for optimal performance.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tools.map((t) => (
          <Link key={t.path} to={t.path} className="rounded border p-4 hover:bg-gray-50 transition">
            <h2 className="text-lg font-medium">{t.title}</h2>
            <p className="text-sm text-gray-600">{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
