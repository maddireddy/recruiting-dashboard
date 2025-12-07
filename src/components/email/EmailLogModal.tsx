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
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to re-send email';
      toast.error(message);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
      <div className="card w-full max-w-2xl max-h-[90vh] overflow-hidden p-0">
        <div className="sticky top-0 flex items-center justify-between border-b border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface))] px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Email activity</p>
            <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">Delivery log</h2>
          </div>
          <button onClick={onClose} type="button" className="rounded-lg border border-transparent p-2 text-muted transition hover:border-[rgba(var(--app-border-subtle))]">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[calc(90vh-72px)] space-y-6 overflow-y-auto px-6 py-6">
          <div className="grid gap-4 rounded-2xl border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] p-4 md:grid-cols-2">
            <InfoBlock label="Recipient" value={log.toEmail} />
            <InfoBlock label="Subject" value={log.subject || '—'} />
            <InfoBlock label="Template" value={log.templateUsed || 'Custom'} />
            <InfoBlock label="Status" value={log.status} />
            <InfoBlock label="Sent at" value={log.sentAt ? new Date(log.sentAt).toLocaleString() : 'Unknown'} />
          </div>

          {log.body && (
            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Content</p>
              <div className="rounded-2xl border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] p-4">
                <div className="prose prose-invert max-w-none text-sm" dangerouslySetInnerHTML={{ __html: log.body }} />
              </div>
            </section>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-muted">
              Close
            </button>
            <button
              type="button"
              onClick={handleRetry}
              disabled={resendMutation.status === 'pending'}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resendMutation.status === 'pending' ? 'Sending…' : 'Retry'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="text-sm text-[rgb(var(--app-text-primary))]">{value}</p>
    </div>
  );
}
