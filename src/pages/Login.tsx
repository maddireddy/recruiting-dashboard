import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
  const data = await authService.login(email, password, tenantId);
      login(data);
      toast.success('Login successful!');
      navigate('/');
    } catch {
      // Show a generic message to avoid `any` usage in the catch clause
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email address">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="input"
              placeholder="admin@example.com"
              required
              autoComplete="email"
            />
          </Field>

          <Field label="Tenant ID">
            <input
              type="text"
              value={tenantId}
              onChange={(event) => setTenantId(event.target.value)}
              className="input"
              placeholder="Enter your tenant ID"
              required
              autoComplete="organization"
            />
          </Field>

          <Field label="Password">
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input"
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </Field>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary inline-flex w-full justify-center"
          >
            {loading ? 'Signing in…' : (
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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-semibold text-[rgb(var(--app-text-primary))]">{label}</span>
      {children}
    </label>
  );
}
