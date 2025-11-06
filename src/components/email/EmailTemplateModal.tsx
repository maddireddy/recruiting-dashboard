import React, { useState } from 'react';
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

  const createMutation = useMutation({
    mutationFn: (payload: Partial<EmailTemplate>) => emailService.createTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<EmailTemplate> }) =>
      emailService.updateTemplate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      onClose();
    },
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
      updateMutation.mutate({ id: template.id, payload });
    } else {
      createMutation.mutate(payload);
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

          <div className="flex justify-end gap-3 pt-4">
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
        </form>
      </div>
    </div>
  );
}
