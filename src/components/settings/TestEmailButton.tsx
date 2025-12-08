import { useMemo, useState } from 'react';
import type { AxiosError } from 'axios';
import { Loader2, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';

import api from '../../services/api';

export type TestEmailButtonProps = {
  /**
   * Optional default recipient email address. When omitted, the component will
   * attempt to hydrate from "userEmail" in localStorage, falling back to a
   * descriptive placeholder.
   */
  defaultEmail?: string;
};

const PLACEHOLDER_EMAIL = 'your-email@example.com';

const resolveInitialEmail = (defaultEmail?: string) => {
  if (defaultEmail) return defaultEmail;
  if (typeof window === 'undefined') return PLACEHOLDER_EMAIL;
  const stored = window.localStorage.getItem('userEmail');
  return stored && stored.includes('@') ? stored : PLACEHOLDER_EMAIL;
};

export function TestEmailButton({ defaultEmail }: TestEmailButtonProps) {
  const [loading, setLoading] = useState(false);
  const [recipient, setRecipient] = useState(() => resolveInitialEmail(defaultEmail));

  const trimmedRecipient = useMemo(() => recipient.trim(), [recipient]);

  const handleSendTest = async () => {
    if (!trimmedRecipient) {
      toast.error('Please provide a recipient email address.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/admin/test-email', { email: trimmedRecipient });
      toast.success('Test email sent! Check your inbox.');
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError?.response?.data?.message || axiosError?.message || 'Error sending email. Check server logs.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card space-y-5">
      <header className="flex items-center gap-2">
        <Mail className="h-5 w-5 text-[rgb(var(--app-text-primary))]" />
        <h3 className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">Email Configuration</h3>
      </header>

      <p className="text-sm text-muted">
        Verify your SMTP settings by sending a test email to the admin address.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="email"
          className="input flex-1"
          placeholder={PLACEHOLDER_EMAIL}
          value={recipient}
          onChange={(event) => setRecipient(event.target.value)}
          disabled={loading}
        />

        <button
          type="button"
          onClick={handleSendTest}
          disabled={loading}
          className="btn-primary inline-flex items-center justify-center gap-2 whitespace-nowrap px-5"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          <span>Send Test Email</span>
        </button>
      </div>
    </section>
  );
}

export default TestEmailButton;
