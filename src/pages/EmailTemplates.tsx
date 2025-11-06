import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emailService } from '../services/email.service';
import type { EmailTemplate } from '../types/email';
import { Suspense, lazy, useState } from 'react';
import { Plus, Edit, Trash2, Mail } from 'lucide-react';

const EmailTemplateModal = lazy(() => import('../components/email/EmailTemplateModal'));

export default function EmailTemplatesPage() {
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showModal, setShowModal] = useState(false);

  const templatesQuery = useQuery({
    queryKey: ['email-templates'],
    queryFn: () => emailService.getAllTemplates().then(r => r.data)
  });

  const deleteTemplate = useMutation({
    mutationFn: (id: string) => emailService.deleteTemplate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['email-templates'] })
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Email Templates</h1>
          <p className="text-dark-600">Manage your email notification templates</p>
        </div>
        <button
          onClick={() => {
            setSelectedTemplate(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded transition"
        >
          <Plus size={18} />
          Create Template
        </button>
      </div>

      {templatesQuery.isLoading && <p>Loading templates...</p>}
      {templatesQuery.error && <p className="text-red-500">Error loading templates</p>}

      {templatesQuery.data && templatesQuery.data.length === 0 && (
        <div className="text-center py-12 bg-dark-100 rounded-lg border border-dark-200">
          <Mail size={48} className="mx-auto mb-4 text-dark-600" />
          <p className="text-dark-600">No email templates yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded transition"
          >
            Create Your First Template
          </button>
        </div>
      )}

      {templatesQuery.data && templatesQuery.data.length > 0 && (
        <div className="grid gap-4">
          {templatesQuery.data.map((template: EmailTemplate) => (
            <div
              key={template.id}
              className="bg-dark-100 rounded-lg border border-dark-200 p-5 hover:border-primary-500 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{template.templateName}</h3>
                    <span className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded">
                      {template.templateType.replace('_', ' ')}
                    </span>
                    {template.isActive && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-dark-600 mb-2">
                    <strong>Subject:</strong> {template.subject}
                  </p>
                  <p className="text-sm text-dark-500 line-clamp-2">{template.body}</p>
                  {template.variables && template.variables.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {template.variables.map(variable => (
                        <span key={variable} className="px-2 py-0.5 bg-dark-300 text-dark-600 text-xs rounded font-mono">
                          {`{{${variable}}}`}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowModal(true);
                    }}
                    className="p-2 bg-dark-200 hover:bg-dark-300 rounded transition"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this template?')) {
                        deleteTemplate.mutate(template.id!);
                      }
                    }}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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
