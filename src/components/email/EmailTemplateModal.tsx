import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { emailService } from '../../services/email.service';
import type { EmailTemplate } from '../../types/email';

interface Props {
  template: EmailTemplate | null;
  onClose: () => void;
}

export default function EmailTemplateModal({ template, onClose }: Props) {
  const queryClient = useQueryClient();

  const [templateName, setTemplateName] = useState(template?.templateName || '');
  const [templateType, setTemplateType] = useState<EmailTemplate['templateType']>(
    (template?.templateType as EmailTemplate['templateType']) || 'CUSTOM'
  );
  const [subject, setSubject] = useState(template?.subject || '');
  const [body, setBody] = useState(template?.body || '');
  const [variables, setVariables] = useState((template?.variables || []).join(', '));
  const [isActive, setIsActive] = useState(!!template?.isActive);
  const [showPreview, setShowPreview] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  const createMutation = useMutation({
    mutationFn: (payload: Partial<EmailTemplate>) => emailService.createTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create template');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<EmailTemplate> }) =>
      emailService.updateTemplate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update template');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<EmailTemplate> = {
      templateName,
      templateType,
      subject,
      body,
      variables: variables
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
      isActive,
    };

    if (template?.id) {
      updateMutation.mutate({ id: template.id, payload }, {
        onSuccess: () => toast.success('Template updated'),
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => toast.success('Template created'),
      });
    }
  };

  const renderPreview = () => {
    // Build a replacement map from variables with sample values
    const vars = variables.split(',').map(v => v.trim()).filter(Boolean);
    let preview = body || '';
    vars.forEach((v, idx) => {
      const placeholder = vars.length > 0 ? `Sample${idx + 1}` : 'Sample';
      const re = new RegExp(`{{\s*${v}\s*}}`, 'g');
      preview = preview.replace(re, placeholder);
    });
    // Also replace common placeholders
    preview = preview.replace(/{{\s*firstName\s*}}/g, 'John');
    preview = preview.replace(/{{\s*lastName\s*}}/g, 'Doe');
    return preview;
  };

  const sendTestEmail = async () => {
    if (!testEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(testEmail)) {
      toast.error('Please enter a valid test email');
      return;
    }
    const vars = variables.split(',').map(v => v.trim()).filter(Boolean);
    const payloadVars: Record<string,string> = {};
    vars.forEach((v, i) => { payloadVars[v] = `Sample${i+1}`; });
    try {
      setSendingTest(true);
      await emailService.sendTemplateEmail(testEmail, template?.templateName || templateName, payloadVars);
      toast.success('Test email sent');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  const sendNow = async () => {
    // Prompt for recipient(s) and send immediately using template name
    const recipient = window.prompt('Enter recipient email to send this template to (comma-separated):');
    if (!recipient) return;
    const to = recipient.split(',').map(s => s.trim()).filter(Boolean)[0];
    if (!to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
      toast.error('Invalid recipient email');
      return;
    }
    // Use same sample vars
    const vars = variables.split(',').map(v => v.trim()).filter(Boolean);
    const payloadVars: Record<string,string> = {};
    vars.forEach((v, i) => { payloadVars[v] = `Sample${i+1}`; });
    try {
      await emailService.sendTemplateEmail(to, template?.templateName || templateName, payloadVars);
      toast.success('Email sent');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send email');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-100 rounded-lg max-w-2xl w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-200">
          <h2 className="text-xl font-bold">{template ? 'Edit Template' : 'Create Template'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-dark-200 rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Template Name</label>
            <input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Template Type</label>
            <select
              value={templateType}
              onChange={(e) => setTemplateType(e.target.value as EmailTemplate['templateType'])}
              className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
              required
            >
              <option value="INTERVIEW_INVITE">Interview Invite</option>
              <option value="STATUS_UPDATE">Status Update</option>
              <option value="OFFER_LETTER">Offer Letter</option>
              <option value="REMINDER">Reminder</option>
              <option value="WELCOME">Welcome</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Variables (comma separated)</label>
            <input
              value={variables}
              onChange={(e) => setVariables(e.target.value)}
              placeholder="firstName, jobTitle"
              className="w-full px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <input id="isActive" type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <label htmlFor="isActive" className="text-sm">Active</label>
          </div>

          <div className="flex items-center justify-between gap-3 pt-4">
            <div className="flex items-center gap-3">
              <div>
                <button
                  type="button"
                  onClick={() => setShowPreview(v => !v)}
                  className="px-3 py-2 bg-dark-200 hover:bg-dark-300 rounded transition mr-2"
                >
                  {showPreview ? 'Hide Preview' : 'Preview'}
                </button>
                <span className="text-xs text-dark-600">Variables: {variables || 'none'}</span>
              </div>

              <div className="ml-4 flex items-center gap-2">
                <input
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="px-3 py-2 bg-dark-200 border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={sendTestEmail}
                  disabled={createMutation.status === 'pending' || updateMutation.status === 'pending' || sendingTest}
                  className="px-3 py-2 bg-blue-600 text-white rounded"
                >
                  {sendingTest ? 'Sending...' : 'Send Test'}
                </button>
                <button
                  type="button"
                  onClick={sendNow}
                  className="px-3 py-2 bg-green-600 text-white rounded"
                >
                  Send Now
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-dark-200 hover:bg-dark-300 rounded transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.status === 'pending' || updateMutation.status === 'pending'}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {template ? 'Save Changes' : 'Create Template'}
              </button>
            </div>
          </div>

          {showPreview && (
            <div className="mt-4 bg-dark-200 p-4 rounded border border-dark-300">
              <h4 className="font-medium mb-2">Preview</h4>
              <div className="prose max-w-none text-sm text-dark-800" dangerouslySetInnerHTML={{ __html: renderPreview() }} />
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
