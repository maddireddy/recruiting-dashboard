import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { emailService } from '../../services/email.service';
import type { EmailLog } from '../../types/email';

interface Props {
  log: EmailLog | null;
  onClose: () => void;
}

export default function EmailLogModal({ log, onClose }: Props) {
  const queryClient = useQueryClient();

  const resendMutation = useMutation({
    mutationFn: async (payload: { to: string; templateName?: string; subject?: string; body?: string; variables?: Record<string,string> }) => {
      if (payload.templateName) {
        return emailService.sendTemplateEmail(payload.to, payload.templateName, payload.variables || {});
      }
      return emailService.sendEmail(payload.to, payload.subject || '', payload.body || '');
    },
    onSuccess: () => {
      toast.success('Email re-sent');
      queryClient.invalidateQueries({ queryKey: ['email-logs'] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to re-send email');
    }
  });

  if (!log) return null;

  const handleRetry = () => {
    if (log.templateUsed) {
      // attempt to resend via template; no variables available in log, send empty vars
      resendMutation.mutate({ to: log.toEmail, templateName: log.templateUsed, variables: {} });
    } else {
      // custom email - resend with subject/body
      resendMutation.mutate({ to: log.toEmail, subject: log.subject, body: log.body });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-100 rounded-lg max-w-2xl w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-200">
          <h2 className="text-lg font-bold">Email Log</h2>
          <button onClick={onClose} className="p-2 hover:bg-dark-200 rounded">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-dark-600">To</p>
            <p className="font-medium">{log.toEmail}</p>
          </div>

          <div>
            <p className="text-sm text-dark-600">Subject</p>
            <p className="font-medium">{log.subject}</p>
          </div>

          <div>
            <p className="text-sm text-dark-600">Template</p>
            <p className="font-medium">{log.templateUsed || 'Custom'}</p>
          </div>

          <div>
            <p className="text-sm text-dark-600">Status</p>
            <p className="font-medium">{log.status}</p>
          </div>

          {log.body && (
            <div>
              <p className="text-sm text-dark-600">Body</p>
              <div className="mt-2 prose max-w-none text-sm" dangerouslySetInnerHTML={{ __html: log.body }} />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-dark-200 hover:bg-dark-300 rounded transition"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleRetry}
              disabled={resendMutation.status === 'pending'}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded text-white disabled:opacity-50"
            >
              {resendMutation.status === 'pending' ? 'Sending...' : 'Retry'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
