import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import SemanticSearch from './pages/SemanticSearch';
import AiLab from './pages/AiLab';
import TalentPoolMatching from './pages/TalentPoolMatching';
const ResumeParser = lazy(() => import('./components/ai/ResumeParser'));
const JobDescriptionGenerator = lazy(() => import('./components/ai/JobDescriptionGenerator'));
import ErrorBoundary from './components/common/ErrorBoundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Loader from './components/ui/Loader';
import ClientsPage from './pages/Clients';
import InterviewsPage from './pages/Interviews';
import EmailTemplatesPage from './pages/EmailTemplates';
import EmailLogsPage from './pages/EmailLogs';
import ReportsPage from './pages/Reports';
const DocumentsPage = lazy(() => import('./pages/Documents'));
// Scheduling module
import SchedulingDashboard from './components/scheduling/SchedulingDashboard';
import AvailabilityLinkCreator from './components/scheduling/AvailabilityLinkCreator';
import SlotSelector from './components/scheduling/SlotSelector';

// Layouts
import MainLayout from './layouts/MainLayout';
import PublicLayout from './layouts/PublicLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages (lazy)
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Candidates = lazy(() => import('./pages/Candidates'));
const CandidateDetails = lazy(() => import('./pages/CandidateDetails'));
const Jobs = lazy(() => import('./pages/Jobs'));
const JobDetails = lazy(() => import('./pages/JobDetails'));
const SubmissionsPage = lazy(() => import('./pages/Submissions'));
const CareerPage = lazy(() => import('./pages/public/CareerPage'));
const JobDetailPage = lazy(() => import('./pages/public/JobDetailPage'));
const TalentPools = lazy(() => import('./pages/TalentPools'));
const TalentPoolDetails = lazy(() => import('./pages/TalentPoolDetails'));
const Offers = lazy(() => import('./pages/Offers'));
const OfferDetails = lazy(() => import('./pages/OfferDetails'));
// New pages (scaffolds)
const SMSPage = lazy(() => import('./pages/SMS'));
const SMSCommunicationsPage = lazy(() => import('./pages/SMSCommunications'));
const CompliancePage = lazy(() => import('./pages/Compliance'));
const CalendarSyncPage = lazy(() => import('./pages/CalendarSync'));
const InterviewIntelligencePage = lazy(() => import('./pages/InterviewIntelligence'));
const VendorsPage = lazy(() => import('./pages/Vendors'));
const ReferralsPage = lazy(() => import('./pages/Referrals'));
const WorkflowsPage = lazy(() => import('./pages/Workflows'));
const BillingPage = lazy(() => import('./pages/Billing'));
const WhiteLabelPage = lazy(() => import('./pages/WhiteLabel'));
const ApiKeysPage = lazy(() => import('./pages/ApiKeys'));
const AdvancedSearchPage = lazy(() => import('./pages/AdvancedSearch'));
const RediscoveryPage = lazy(() => import('./pages/Rediscovery'));
const SavedSearchesPage = lazy(() => import('./pages/SavedSearches'));
const JobDescriptionTemplatesPage = lazy(() => import('./pages/JobDescriptionTemplates'));
const VendorSubmittalsPage = lazy(() => import('./pages/VendorSubmittals'));
const SkillsAssessmentsPage = lazy(() => import('./pages/SkillsAssessments'));
const BooleanSearchTemplatesPage = lazy(() => import('./pages/BooleanSearchTemplates'));
const CandidateSourcingsPage = lazy(() => import('./pages/CandidateSourcings'));
const MarketIntelligencePage = lazy(() => import('./pages/MarketIntelligence'));
const DiversityMetricsPage = lazy(() => import('./pages/DiversityMetrics'));
const BookmarkletCapturesPage = lazy(() => import('./pages/BookmarkletCaptures'));
const EeoDatasPage = lazy(() => import('./pages/EeoDatas'));
const MobileAppConfigsPage = lazy(() => import('./pages/MobileAppConfigs'));
const SilverMedalistsPage = lazy(() => import('./pages/SilverMedalists'));
const CustomReportsPage = lazy(() => import('./pages/CustomReports'));
const InterviewGuidesPage = lazy(() => import('./pages/InterviewGuides'));
const InterviewRecordingsPage = lazy(() => import('./pages/InterviewRecordings'));


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
        <ErrorBoundary>
          <Suspense fallback={<Loader /> }>
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
              <Route path="/email-logs" element={<EmailLogsPage />}/>
              <Route path="/reports" element={<ReportsPage />} />
              {/* Scheduling (authenticated) */}
              <Route path="/scheduling" element={<SchedulingDashboard />} />
              <Route path="/scheduling/create" element={<AvailabilityLinkCreator />} />
              {/* Talent Pools */}
              <Route path="/talent-pools" element={<TalentPools />} />
              <Route path="/talent-pools/:id" element={<TalentPoolDetails />} />
              {/* Offers */}
              <Route path="/offers" element={<Offers />} />
              <Route path="/offers/:id" element={<OfferDetails />} />
              {/* Enterprise & sourcing scaffolds */}
              <Route path="/sms" element={<SMSPage />} />
              <Route path="/sms/communications" element={<SMSCommunicationsPage />} />
              <Route path="/compliance" element={<CompliancePage />} />
              <Route path="/calendar-sync" element={<CalendarSyncPage />} />
              <Route path="/interview-intelligence" element={<InterviewIntelligencePage />} />
              <Route path="/vendors" element={<VendorsPage />} />
              <Route path="/referrals" element={<ReferralsPage />} />
              <Route path="/workflows" element={<WorkflowsPage />} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="/white-label" element={<WhiteLabelPage />} />
              <Route path="/api-keys" element={<ApiKeysPage />} />
              <Route path="/advanced-search" element={<AdvancedSearchPage />} />
              <Route path="/saved-searches" element={<SavedSearchesPage />} />
              <Route path="/jd-templates" element={<JobDescriptionTemplatesPage />} />
              <Route path="/vendor-submittals" element={<VendorSubmittalsPage />} />
              <Route path="/skills-assessments" element={<SkillsAssessmentsPage />} />
              <Route path="/boolean-search-templates" element={<BooleanSearchTemplatesPage />} />
              <Route path="/candidate-sourcings" element={<CandidateSourcingsPage />} />
              <Route path="/market-intelligence" element={<MarketIntelligencePage />} />
              <Route path="/diversity-metrics" element={<DiversityMetricsPage />} />
              <Route path="/bookmarklet-captures" element={<BookmarkletCapturesPage />} />
              <Route path="/eeo-data" element={<EeoDatasPage />} />
              <Route path="/mobile-app-configs" element={<MobileAppConfigsPage />} />
              <Route path="/silver-medalists" element={<SilverMedalistsPage />} />
              <Route path="/custom-reports" element={<CustomReportsPage />} />
              <Route path="/interview-guides" element={<InterviewGuidesPage />} />
              <Route path="/interview-recordings" element={<InterviewRecordingsPage />} />
              <Route path="/rediscovery" element={<RediscoveryPage />} />
              <Route path="/ai/rediscovery" element={<RediscoveryPage />} />
              <Route path="/ai/talent-pool-matching" element={<TalentPoolMatching />} />
              <Route path="/ai/interview-intelligence" element={<InterviewIntelligencePage />} />
              <Route path="/ai" element={<AiLab />} />
              {/* AI Lab (protected) */}
              <Route
                path="/ai/resume-parser"
                element={
                  <Suspense fallback={<Loader label="Loading AI tool..." /> }>
                    <ResumeParser />
                  </Suspense>
                }
              />
              <Route
                path="/ai/jd-generator"
                element={
                  <Suspense fallback={<Loader label="Loading AI tool..." /> }>
                    <JobDescriptionGenerator />
                  </Suspense>
                }
              />
              <Route
                path="/ai/semantic-search"
                element={
                  <Suspense fallback={<Loader label="Loading AI tool..." /> }>
                    <SemanticSearch />
                  </Suspense>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
            
            {/* Public Career Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/careers/:tenantSlug" element={<CareerPage />} />
              <Route path="/careers/:tenantSlug/jobs/:jobId" element={<JobDetailPage />} />
              {/* Public booking route for self-scheduling */}
              <Route path="/schedule/:linkId" element={<SlotSelector />} />
            </Route>
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
      <ReactQueryDevtoolsBridge />
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
