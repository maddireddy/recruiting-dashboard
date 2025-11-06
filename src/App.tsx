import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import ClientsPage from './pages/Clients';
import InterviewsPage from './pages/Interviews';
import EmailTemplatesPage from './pages/EmailTemplates';
import EmailLogsPage from './pages/EmailLogs';
const DocumentsPage = lazy(() => import('./pages/Documents'));

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages (lazy)
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Candidates = lazy(() => import('./pages/Candidates'));
const CandidateDetails = lazy(() => import('./pages/CandidateDetails'));
const Jobs = lazy(() => import('./pages/Jobs'));
const JobDetails = lazy(() => import('./pages/JobDetails'));
const SubmissionsPage = lazy(() => import('./pages/Submissions'));


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reduce unnecessary refetches and provide a responsive cache
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000, // 30s
      gcTime: 5 * 60_000, // 5 minutes
    },
  },
});

// Dev-only React Query Devtools without impacting production bundle
function ReactQueryDevtoolsBridge() {
  if (!import.meta.env.DEV) return null;
  const Devtools = lazy(() =>
    import('@tanstack/react-query-devtools').then((mod) => ({ default: mod.ReactQueryDevtools }))
  );
  return (
    <Suspense fallback={null}>
      <Devtools initialIsOpen={false} buttonPosition="bottom-left" />
    </Suspense>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<div className="p-6">Loading...</div>}>
          <Routes>
            {/* Public Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
            </Route>

            {/* Protected Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/candidates" element={<Candidates />} />
              <Route path="/candidates/:id" element={<CandidateDetails />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/submissions" element={<SubmissionsPage />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/interviews" element={<InterviewsPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/email-templates" element={<EmailTemplatesPage />} />
              <Route path="/email-logs" element={<EmailLogsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <ReactQueryDevtoolsBridge />
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
