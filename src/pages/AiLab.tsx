import { Link } from 'react-router-dom';

export default function AiLab() {
  const tools = [
    { path: '/ai/semantic-search', title: 'Semantic Search', desc: 'Embed and rank candidates/jobs by similarity.' },
    { path: '/ai/resume-parser', title: 'Resume Parser', desc: 'Extract entities from resumes using NER.' },
    { path: '/ai/jd-generator', title: 'JD Generator', desc: 'Generate job descriptions and analyze bias.' },
  ];
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">AI Lab</h1>
      <p className="text-muted">Explore AI-powered tools to accelerate recruiting workflows.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tools.map((t) => (
          <Link key={t.path} to={t.path} className="rounded border p-4 hover:bg-gray-50">
            <h2 className="text-lg font-medium">{t.title}</h2>
            <p className="text-sm text-gray-600">{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
