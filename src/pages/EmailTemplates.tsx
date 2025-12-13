import { useMemo, useState, Suspense, lazy } from 'react';
import { useList, useDelete } from '../services/hooks';
import { Plus, Edit, Trash2, Mail, Sparkles } from 'lucide-react';
import { emailService } from '../services/email.service';
import type { EmailTemplate } from '../types/email';

const EmailTemplateModal = lazy(() => import('../components/email/EmailTemplateModal'));

export default function EmailTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showModal, setShowModal] = useState(false);
  const tenantId = useMemo(() => localStorage.getItem('tenantId') || undefined, []);

  const templatesQuery = useList<EmailTemplate[]>('email-templates', () => emailService.getAllTemplates(), tenantId);

  const { mutateAsync: remove } = useDelete('email-templates', (id: string) => emailService.deleteTemplate(id), tenantId);

  const templates = useMemo(() => templatesQuery.data || [], [templatesQuery.data]);

  return (
    <div className="space-y-8 px-6 py-8">
      <header className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(var(--app-border-subtle))] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            <Mail size={14} />
            Messaging Studio
          </div>
          <h1 className="text-3xl font-semibold text-[rgb(var(--app-text-primary))]">Email Templates</h1>
          <p className="max-w-2xl text-sm text-muted">
            Craft reusable outreach, interview reminders, and onboarding sequences while keeping variables organized.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedTemplate(null);
            setShowModal(true);
          }}
          type="button"
          className="btn-primary"
        >
          <Plus size={18} />
          Create template
        </button>
      </header>

      {templatesQuery.isLoading && (
        <div className="card space-y-3">
          <div className="h-4 w-48 animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
          <div className="h-4 w-full animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
          <div className="h-4 w-2/3 animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
        </div>
      )}

      {!templatesQuery.isLoading && templatesQuery.error && (
        <div className="card border-red-400/40 bg-red-500/5 text-red-300">
          Unable to load templates. Please try again shortly.
        </div>
      )}

      {!templatesQuery.isLoading && !templatesQuery.error && templates.length === 0 && (
        <div className="card flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-[rgba(var(--app-border-subtle))] text-muted">
            <Sparkles size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">No email templates yet</h3>
            <p className="max-w-sm text-sm text-muted">Kickstart engagement with a polished welcome note or an interview confirmation template.</p>
          </div>
          <button onClick={() => setShowModal(true)} type="button" className="btn-primary">
            <Plus size={16} />
            Create your first template
          </button>
        </div>
      )}

      {templates.length > 0 && (
        <section className="grid gap-4">
          {templates.map((template: EmailTemplate) => (
            <article
              key={template.id}
              className="card flex flex-col gap-4 border-transparent transition hover:border-[rgba(var(--app-primary-from),0.45)]"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">{template.templateName}</h3>
                    <span className="chip surface-muted text-xs">{template.templateType.replace('_', ' ')}</span>
                    {template.isActive && <span className="chip chip-active text-xs">Active</span>}
                  </div>
                  <p className="text-sm text-muted">
                    <span className="font-semibold text-[rgb(var(--app-text-primary))]">Subject:</span> {template.subject}
                  </p>
                  <p className="text-sm text-muted line-clamp-2">{template.body}</p>
                  {template.variables && template.variables.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {template.variables.map((variable) => (
                        <span key={variable} className="chip surface-muted font-mono text-xs">
                          {`{{${variable}}}`}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowModal(true);
                    }}
                    type="button"
                    className="btn-muted px-3 py-2 text-sm"
                    title="Edit"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this template?')) {
                        remove(template.id!);
                      }
                    }}
                    type="button"
                    className="btn-muted px-3 py-2 text-sm text-red-400 hover:border-red-400 hover:text-red-300"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {showModal && (
        <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center z-50">Loading…</div>}>
          <EmailTemplateModal
            template={selectedTemplate}
            onClose={() => setShowModal(false)}
          />
        </Suspense>
      )}
    </div>
  );
}
