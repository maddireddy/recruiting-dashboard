import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { InterviewGuide } from '../../types/interviewGuide';
import { z } from 'zod';
import toast from 'react-hot-toast';

interface InterviewGuideModalProps {
  guide: InterviewGuide | null;
  onSave: (guide: Partial<InterviewGuide>) => Promise<void>;
  onClose: () => void;
}

const guideSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  role: z.string().optional(),
  sections: z.array(z.object({
    title: z.string().min(1, 'Section title required'),
    questions: z.array(z.string().min(1)),
  })).min(1, 'At least one section is required'),
});

export default function InterviewGuideModal({ guide, onSave, onClose }: InterviewGuideModalProps) {
  const [form, setForm] = useState<Partial<InterviewGuide>>({
    name: guide?.name || '',
    role: guide?.role || '',
    sections: guide?.sections || [{ title: '', questions: [''] }],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (guide) {
      setForm({
        name: guide.name,
        role: guide.role || '',
        sections: guide.sections || [{ title: '', questions: [''] }],
      });
    }
  }, [guide]);

  const handleSubmit = async () => {
    try {
      guideSchema.parse(form);
      setErrors({});
      setSaving(true);
      await onSave(form);
      toast.success(guide ? 'Guide updated successfully' : 'Guide created successfully');
      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          fieldErrors[err.path.join('.')] = err.message;
        });
        setErrors(fieldErrors);
        toast.error('Please fix the errors in the form');
      } else {
        toast.error('Failed to save guide');
      }
    } finally {
      setSaving(false);
    }
  };

  const addSection = () => {
    setForm({
      ...form,
      sections: [...(form.sections || []), { title: '', questions: [''] }],
    });
  };

  const removeSection = (index: number) => {
    const sections = [...(form.sections || [])];
    sections.splice(index, 1);
    setForm({ ...form, sections });
  };

  const updateSection = (index: number, title: string) => {
    const sections = [...(form.sections || [])];
    sections[index] = { ...sections[index], title };
    setForm({ ...form, sections });
  };

  const addQuestion = (sectionIndex: number) => {
    const sections = [...(form.sections || [])];
    sections[sectionIndex].questions.push('');
    setForm({ ...form, sections });
  };

  const removeQuestion = (sectionIndex: number, questionIndex: number) => {
    const sections = [...(form.sections || [])];
    sections[sectionIndex].questions.splice(questionIndex, 1);
    setForm({ ...form, sections });
  };

  const updateQuestion = (sectionIndex: number, questionIndex: number, value: string) => {
    const sections = [...(form.sections || [])];
    sections[sectionIndex].questions[questionIndex] = value;
    setForm({ ...form, sections });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
      <div className="card w-full max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="sticky top-0 flex items-center justify-between border-b border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface))] px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {guide ? 'Edit Guide' : 'Create Guide'}
            </p>
            <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">Interview Guide</h2>
          </div>
          <button onClick={onClose} type="button" className="rounded-lg border border-transparent p-2 text-muted transition hover:border-[rgba(var(--app-border-subtle))]">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-1">
                  Guide Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input w-full"
                  placeholder="e.g., Senior Software Engineer Technical Interview"
                />
                {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-1">
                  Role/Position
                </label>
                <input
                  type="text"
                  value={form.role || ''}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="input w-full"
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">Interview Sections</h3>
                <button type="button" onClick={addSection} className="btn-muted px-3 py-2 text-sm">
                  <Plus size={16} />
                  Add Section
                </button>
              </div>

              {(form.sections || []).map((section, sectionIndex) => (
                <div key={sectionIndex} className="rounded-lg border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted))] p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-1">
                        Section Title <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateSection(sectionIndex, e.target.value)}
                        className="input w-full"
                        placeholder="e.g., Technical Skills Assessment"
                      />
                    </div>
                    {(form.sections?.length || 0) > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSection(sectionIndex)}
                        className="mt-6 rounded-lg border border-transparent p-2 text-red-400 transition hover:border-red-400/40 hover:bg-red-500/10"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  {/* Questions */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-[rgb(var(--app-text-primary))]">Questions</p>
                    {section.questions.map((question, questionIndex) => (
                      <div key={questionIndex} className="flex items-start gap-2">
                        <div className="flex-1">
                          <textarea
                            value={question}
                            onChange={(e) => updateQuestion(sectionIndex, questionIndex, e.target.value)}
                            className="input w-full resize-none"
                            rows={2}
                            placeholder="Enter interview question..."
                          />
                        </div>
                        {section.questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(sectionIndex, questionIndex)}
                            className="rounded-lg border border-transparent p-2 text-muted transition hover:border-red-400/40 hover:text-red-400"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addQuestion(sectionIndex)}
                      className="btn-muted px-3 py-1.5 text-xs"
                    >
                      <Plus size={14} />
                      Add Question
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface))] px-6 py-4">
          <button onClick={onClose} type="button" className="btn-muted">
            Cancel
          </button>
          <button onClick={handleSubmit} type="button" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : guide ? 'Update Guide' : 'Create Guide'}
          </button>
        </div>
      </div>
    </div>
  );
}
