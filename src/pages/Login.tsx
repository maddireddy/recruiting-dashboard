import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';
import Field from '../components/ui/Field';
import Spinner from '../components/ui/Spinner';
import { z } from 'zod';

export default function Login() {
  const [email, setEmail] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; tenantId?: string; password?: string }>({});
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const schema = z.object({
    email: z.string().email('Enter a valid email').min(1, 'Email is required'),
    tenantId: z.string().min(1, 'Tenant ID is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const parsed = schema.safeParse({ email, tenantId, password });
    if (!parsed.success) {
      const errs: { email?: string; tenantId?: string; password?: string } = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as 'email' | 'tenantId' | 'password';
        errs[key] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const data = await authService.login(email, password, tenantId);
      login(data);
      toast.success('Login successful!');
      navigate('/');
    } catch {
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[rgb(var(--app-surface))] px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(var(--app-primary-from),0.12),transparent_55%)]" aria-hidden />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="card relative z-10 w-full max-w-md space-y-6"
      >
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(var(--app-border-subtle))] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            <ShieldCheck size={14} />
            BenchSales Portal
          </div>
          <h1 className="text-3xl font-semibold text-[rgb(var(--app-text-primary))]">Sign in</h1>
          <p className="text-sm text-muted">Access the recruiting control center for jobs, submissions, and client insights.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Field label="Email address" htmlFor="email" error={fieldErrors.email}>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="input"
              placeholder="admin@example.com"
              autoComplete="email"
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            />
          </Field>

          <Field label="Tenant ID" htmlFor="tenantId" error={fieldErrors.tenantId}>
            <input
              id="tenantId"
              type="text"
              value={tenantId}
              onChange={(event) => setTenantId(event.target.value)}
              className="input"
              placeholder="Enter your tenant ID"
              autoComplete="organization"
              aria-invalid={!!fieldErrors.tenantId}
              aria-describedby={fieldErrors.tenantId ? 'tenantId-error' : undefined}
            />
          </Field>

          <Field label="Password" htmlFor="password" error={fieldErrors.password}>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input"
              placeholder="Enter your password"
              autoComplete="current-password"
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            />
          </Field>

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="btn-primary inline-flex w-full justify-center"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Spinner size={16} />
                <span>Signing in…</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <LogIn size={20} />
                Sign in
              </span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// Using shared Field component from components/ui/Field
