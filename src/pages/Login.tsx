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
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
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
    <div className="relative flex min-h-screen items-center justify-center bg-[#F1F5F9] px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(52,152,219,0.08),transparent_60%)]" aria-hidden />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md space-y-6 rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-xl"
      >
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">
            <ShieldCheck size={14} />
            BenchSales Portal
          </div>
          <h1 className="text-3xl font-semibold text-[#0F172A]">Sign in</h1>
          <p className="text-sm text-[#64748B]">Access the recruiting control center for jobs, submissions, and client insights.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Field label="Email address" htmlFor="email" error={fieldErrors.email} required variant="light">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-[#CBD5E1] bg-white px-4 py-3 text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#3498db] focus:outline-none focus:ring-2 focus:ring-[#3498db]/20 transition-all"
              placeholder="admin@example.com"
              autoComplete="email"
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              aria-required="true"
            />
          </Field>

          <Field label="Tenant ID" htmlFor="tenantId" error={fieldErrors.tenantId} required variant="light">
            <input
              id="tenantId"
              type="text"
              value={tenantId}
              onChange={(event) => setTenantId(event.target.value)}
              className="w-full rounded-lg border border-[#CBD5E1] bg-white px-4 py-3 text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#3498db] focus:outline-none focus:ring-2 focus:ring-[#3498db]/20 transition-all"
              placeholder="Enter your tenant ID"
              autoComplete="organization"
              aria-invalid={!!fieldErrors.tenantId}
              aria-describedby={fieldErrors.tenantId ? 'tenantId-error' : undefined}
              aria-required="true"
            />
          </Field>

          <Field label="Password" htmlFor="password" error={fieldErrors.password} required variant="light">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-[#CBD5E1] bg-white px-4 py-3 text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#3498db] focus:outline-none focus:ring-2 focus:ring-[#3498db]/20 transition-all"
              placeholder="Enter your password"
              autoComplete="current-password"
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
              aria-required="true"
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
