import { useMemo, useState } from 'react';
import { Plus, FileText, Edit, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { InterviewGuide } from '../types/interviewGuide';
import { listInterviewGuides, createInterviewGuide, updateInterviewGuide, deleteInterviewGuide } from '../services/interviewGuide.service';
import { useList, useCreate, useUpdate, useDelete } from '../services/hooks';
import InterviewGuideModal from '../components/interviews/InterviewGuideModal';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';

export default function InterviewGuides() {
  const tenantId = useMemo(() => localStorage.getItem('tenantId') || undefined, []);
  const [selected, setSelected] = useState<InterviewGuide | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading, refetch } = useList<InterviewGuide[]>('interviewGuides', () => listInterviewGuides(tenantId), tenantId);
  const { mutateAsync: create } = useCreate('interviewGuides', (payload: Partial<InterviewGuide>) => createInterviewGuide(payload as any, tenantId), tenantId);
  const { mutateAsync: update } = useUpdate('interviewGuides', (id: string, payload: Partial<InterviewGuide>) => updateInterviewGuide({ id, ...payload }, tenantId), tenantId);
  const { mutateAsync: remove } = useDelete('interviewGuides', (id: string) => deleteInterviewGuide(id, tenantId), tenantId);

  const handleSave = async (guide: Partial<InterviewGuide>) => {
    try {
      if (selected) {
        await update({ id: selected.id, data: guide });
      } else {
        await create(guide);
      }
      setShowModal(false);
      setSelected(null);
      refetch();
    } catch (e: any) {
      throw e;
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await remove(id);
      toast.success('Guide deleted successfully');
      refetch();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete guide');
    }
  };

  const guides = data || [];

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader title="Interview Guides" subtitle="Manage interview guide templates" />
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-10 px-6 py-8">
      <PageHeader
        title="Interview Guides"
        subtitle="Create structured interview templates with sections and questions to ensure consistent candidate evaluation across your hiring team"
        actions={
          <Button variant="primary" size="md" onClick={() => { setSelected(null); setShowModal(true); }}>
            <Plus size={16} />
            <span className="ml-2">Create Guide</span>
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/15">
              <FileText className="text-indigo-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Total Guides</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">{guides.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/15">
              <BookOpen className="text-purple-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Total Sections</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">
                {guides.reduce((sum, guide) => sum + (guide.sections?.length || 0), 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/15">
              <FileText className="text-cyan-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Total Questions</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">
                {guides.reduce((sum, guide) => 
                  sum + (guide.sections?.reduce((s, section) => s + (section.questions?.length || 0), 0) || 0), 0
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="card space-y-3">
          <div className="h-4 w-40 animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
          <div className="h-4 w-full animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
          <div className="h-4 w-3/4 animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && guides.length === 0 && (
        <div className="card flex flex-col items-center justify-center gap-4 text-center py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-[rgba(var(--app-border-subtle))] text-muted">
            <FileText size={28} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No interview guides yet</h3>
            <p className="max-w-sm text-sm text-muted">
              Create your first interview guide with structured sections and questions to standardize your hiring process.
            </p>
          </div>
          <button onClick={() => { setSelected(null); setShowModal(true); }} type="button" className="btn-primary">
            <Plus size={16} />
            Create your first guide
          </button>
        </div>
      )}

      {/* Guides List */}
      {!isLoading && guides.length > 0 && (
        <div className="grid gap-4">
          {guides.map((guide: InterviewGuide) => (
            <article key={guide.id} className="card border-transparent transition hover:border-[rgba(var(--app-primary-from),0.45)]">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(var(--app-primary-from),0.15)]">
                        <FileText className="text-[rgb(var(--app-primary-from))]" size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">{guide.name}</h3>
                        {guide.role && (
                          <p className="text-sm text-muted">For: {guide.role}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelected(guide);
                        setShowModal(true);
                      }}
                      type="button"
                      className="btn-muted px-3 py-2 text-sm"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(guide.id, guide.name)}
                      type="button"
                      className="rounded-lg border border-transparent px-3 py-2 text-sm text-red-400 transition hover:border-red-400/40 hover:bg-red-500/10"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Sections Preview */}
                {guide.sections && guide.sections.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Sections & Questions</p>
                    <div className="grid gap-2">
                      {guide.sections.map((section, idx) => (
                        <div key={idx} className="rounded-lg border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted))] p-3">
                          <p className="font-medium text-[rgb(var(--app-text-primary))] mb-1">{section.title}</p>
                          <p className="text-sm text-muted">
                            {section.questions?.length || 0} question{section.questions?.length !== 1 ? 's' : ''}
                          </p>
                          {section.questions && section.questions.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {section.questions.slice(0, 3).map((question, qIdx) => (
                                <li key={qIdx} className="text-sm text-muted">• {question}</li>
                              ))}
                              {section.questions.length > 3 && (
                                <li className="text-sm text-muted italic">... and {section.questions.length - 3} more</li>
                              )}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <InterviewGuideModal
          guide={selected}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}
