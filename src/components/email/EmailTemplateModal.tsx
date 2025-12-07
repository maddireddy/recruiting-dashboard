import { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { emailService } from '../../services/email.service';
import type { EmailTemplate } from '../../types/email';
import { FormField } from '../common/FormField';

interface Props {
  template: EmailTemplate | null;
  onClose: () => void;
}

const TEMPLATE_OPTIONS: Array<{ value: EmailTemplate['templateType']; label: string }> = [
  { value: 'INTERVIEW_INVITE', label: 'Interview invite' },
  { value: 'STATUS_UPDATE', label: 'Status update' },
  { value: 'OFFER_LETTER', label: 'Offer letter' },
  { value: 'REMINDER', label: 'Reminder' },
  { value: 'WELCOME', label: 'Welcome' },
  { value: 'CUSTOM', label: 'Custom' },
];

export default function EmailTemplateModal({ template, onClose }: Props) {
  const queryClient = useQueryClient();

  const [templateName, setTemplateName] = useState(template?.templateName || '');
  const [templateType, setTemplateType] = useState<EmailTemplate['templateType']>(
    (template?.templateType as EmailTemplate['templateType']) || 'CUSTOM',
  );
  const [subject, setSubject] = useState(template?.subject || '');
  const [body, setBody] = useState(template?.body || '');
  const [variables, setVariables] = useState((template?.variables || []).join(', '));
  const [isActive, setIsActive] = useState(Boolean(template?.isActive));
  const [showPreview, setShowPreview] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  const createMutation = useMutation({
    mutationFn: (payload: Partial<EmailTemplate>) => emailService.createTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Template created');
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error?.message || 'Failed to create template');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<EmailTemplate> }) =>
      emailService.updateTemplate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Template updated');
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error?.message || 'Failed to update template');
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const payload: Partial<EmailTemplate> = {
      templateName,
      templateType,
      subject,
      body,
      variables: variables
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
      isActive,
    };

    if (template?.id) {
      updateMutation.mutate({ id: template.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const renderPreview = () => {
    const tokens = variables.split(',').map((token) => token.trim()).filter(Boolean);
    let preview = body || '';
    tokens.forEach((token, index) => {
      const placeholder = tokens.length > 0 ? `Sample${index + 1}` : 'Sample';
      const pattern = new RegExp(`{{\\s*${token}\\s*}}`, 'g');
      preview = preview.replace(pattern, placeholder);
    });
    preview = preview.replace(/{{\s*firstName\s*}}/g, 'John');
    preview = preview.replace(/{{\s*lastName\s*}}/g, 'Doe');
    return preview;
  };

  const sendTestEmail = async () => {
    if (!testEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(testEmail)) {
      toast.error('Please enter a valid test email');
      return;
    }
    const tokens = variables.split(',').map((token) => token.trim()).filter(Boolean);
    const payloadVars: Record<string, string> = {};
    tokens.forEach((token, index) => {
      payloadVars[token] = `Sample${index + 1}`;
    });

    try {
      setSendingTest(true);
      await emailService.sendTemplateEmail(testEmail, template?.templateName || templateName, payloadVars);
      toast.success('Test email sent');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send test email';
      toast.error(message);
    } finally {
      setSendingTest(false);
    }
  };

  const sendNow = async () => {
    const recipient = window.prompt('Enter recipient email to send this template to (comma-separated):');
    if (!recipient) return;
    const to = recipient.split(',').map((value) => value.trim()).filter(Boolean)[0];
    if (!to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
      toast.error('Invalid recipient email');
      return;
    }

    const tokens = variables.split(',').map((token) => token.trim()).filter(Boolean);
    const payloadVars: Record<string, string> = {};
    tokens.forEach((token, index) => {
      payloadVars[token] = `Sample${index + 1}`;
    });

    try {
      await emailService.sendTemplateEmail(to, template?.templateName || templateName, payloadVars);
      toast.success('Email sent');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send email';
      toast.error(message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
      <div className="card w-full max-w-3xl max-h-[90vh] overflow-hidden p-0">
        <div className="sticky top-0 flex items-center justify-between border-b border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface))] px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {template ? 'Edit template' : 'Create template'}
            </p>
            <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">Email template</h2>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg border border-transparent p-2 text-muted transition hover:border-[rgba(var(--app-border-subtle))]"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[calc(90vh-72px)] space-y-6 overflow-y-auto px-6 py-6">
          <FormField label="Template name" required>
            <input value={templateName} onChange={(event) => setTemplateName(event.target.value)} className="input" required />
          </FormField>

          <FormField label="Template type" required>
            <select
              value={templateType}
              onChange={(event) => setTemplateType(event.target.value as EmailTemplate['templateType'])}
              className="input"
              required
            >
              {TEMPLATE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Subject" required>
            <input value={subject} onChange={(event) => setSubject(event.target.value)} className="input" required />
          </FormField>

          <FormField label="Body" description="Supports HTML and template variables" spacing="sm" required>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={8}
              className="input min-h-[220px]"
              required
            />
          </FormField>

          <FormField label="Variables" description="Comma-separated list, e.g. firstName, jobTitle" spacing="sm">
            <input
              value={variables}
              onChange={(event) => setVariables(event.target.value)}
              placeholder="firstName, jobTitle"
              className="input"
            />
          </FormField>

          <label className="inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] px-3 py-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="h-4 w-4 rounded border-[rgba(var(--app-border-subtle))] accent-[rgb(var(--app-primary-from))]"
            />
            Active template
          </label>

          <div className="rounded-2xl border border-dashed border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => setShowPreview((value) => !value)} className="btn-muted">
                  {showPreview ? 'Hide preview' : 'Preview template'}
                </button>
                <span className="text-xs uppercase tracking-[0.18em] text-muted">
                  Variables: {variables ? variables : 'none'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(event) => setTestEmail(event.target.value)}
                  className="input md:w-56"
                />
                <button
                  type="button"
                  onClick={sendTestEmail}
                  disabled={createMutation.status === 'pending' || updateMutation.status === 'pending' || sendingTest}
                  className="btn-muted disabled:opacity-60"
                >
                  {sendingTest ? 'Sending…' : 'Send test'}
                </button>
                <button type="button" onClick={sendNow} className="btn-primary">
                  Send now
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-muted">
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.status === 'pending' || updateMutation.status === 'pending'}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {template ? 'Save changes' : 'Create template'}
            </button>
          </div>

          {showPreview && (
            <div className="space-y-3 rounded-2xl border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] p-4">
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">Preview</h4>
              <div className="prose prose-invert max-w-none text-sm" dangerouslySetInnerHTML={{ __html: renderPreview() }} />
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
