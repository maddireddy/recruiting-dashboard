import { useState } from 'react';
import { Plus, Star, TrendingUp, Users } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';

export default function ScorecardsPage() {
  const [templates] = useState([
    { id: '1', name: 'Technical Interview', criteria: 5, avgScore: 4.2 },
    { id: '2', name: 'Culture Fit', criteria: 3, avgScore: 3.8 },
    { id: '3', name: 'Leadership Assessment', criteria: 7, avgScore: 4.5 },
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Interview Scorecards"
        subtitle="Create evaluation templates with weighted criteria for consistent candidate assessment"
        actions={
          <Button variant="primary" size="md">
            <Plus size={16} />
            <span className="ml-2">New Scorecard</span>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/15">
              <Star className="text-purple-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Total Templates</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">{templates.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/15">
              <TrendingUp className="text-green-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Avg Score</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">4.2</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15">
              <Users className="text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Evaluations</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">284</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <div key={template.id} className="card hover:border-indigo-400/30 transition cursor-pointer">
            <h3 className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">{template.name}</h3>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted">{template.criteria} criteria</span>
              <div className="flex items-center gap-1">
                <Star className="text-amber-400" size={16} fill="currentColor" />
                <span className="font-semibold text-[rgb(var(--app-text-primary))]">{template.avgScore}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
