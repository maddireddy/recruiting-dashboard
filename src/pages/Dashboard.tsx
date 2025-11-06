import { useQuery } from '@tanstack/react-query';
import StatsCard from '../components/dashboard/StatsCard.tsx';
import { Suspense, lazy } from 'react';
const LazyFunnelChart = lazy(() =>
  import('../components/dashboard/SubmissionFunnelChart').then(m => ({ default: m.SubmissionFunnelChart }))
);
const LazyTrendLine = lazy(() => import('../components/dashboard/TrendLineChart'));
const LazyTopSkills = lazy(() => import('../components/dashboard/TopSkillsChart'));
const LazyClientsBreakdown = lazy(() => import('../components/dashboard/ClientsBreakdownChart'));
import { Users, Briefcase, FileText, CheckCircle } from 'lucide-react';
import api from '../services/api';

export default function DashboardPage() {
  // Summary stats
  const summaryQuery = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => api.get('/analytics/summary').then(res => res.data)
  });

  // Submission pipeline for funnel chart
  const funnelQuery = useQuery({
    queryKey: ['submission-pipeline'],
    queryFn: () => api.get('/analytics/submission-pipeline').then(res => res.data)
  });

  // Trends over time
  const trendsQuery = useQuery({
    queryKey: ['analytics-trends'],
    queryFn: () => api.get('/analytics/trends').then(res => res.data)
  });

  // Top skills
  const skillsQuery = useQuery({
    queryKey: ['analytics-top-skills'],
    queryFn: () => api.get('/analytics/top-skills').then(res => res.data)
  });

  // Client breakdown
  const clientsQuery = useQuery({
    queryKey: ['analytics-clients'],
    queryFn: () => api.get('/analytics/clients').then(res => res.data)
  });

  // Helper to safely resolve counts from possible keys returned by backend
  const getFunnelCount = (...keys: string[]) => {
    for (const k of keys) {
      if (funnelQuery.data && Object.prototype.hasOwnProperty.call(funnelQuery.data, k)) {
        return Number((funnelQuery.data as any)[k]) || 0;
      }
    }
    return 0;
  };

  // Prepare funnel data for chart
  const funnelData = [
    { status: 'Submitted', count: getFunnelCount('Submitted', 'submitted') },
    { status: 'Shortlisted', count: getFunnelCount('Shortlisted', 'shortlisted') },
    { status: 'Interviewed', count: getFunnelCount('Interview', 'Interviewed', 'interview', 'interviewed') },
    { status: 'Offered', count: getFunnelCount('Offered', 'offered') },
    { status: 'Rejected', count: getFunnelCount('Rejected', 'rejected') }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="mb-6 text-dark-600">Visual analytics for your recruiting pipeline</p>

      {summaryQuery.isLoading || funnelQuery.isLoading ? (
        <p>Loading dashboard...</p>
      ) : summaryQuery.error || funnelQuery.error ? (
        <div className="text-red-500">Error loading dashboard data. Please try again later.</div>
      ) : (
        <>
          <div className="flex gap-6 flex-wrap mb-8">
            <StatsCard 
              title="Total Candidates" 
              value={summaryQuery.data?.totalCandidates || 0} 
              icon={<Users size={20}/>} 
              color="bg-blue-600/10"
            />
            <StatsCard 
              title="Bench Candidates" 
              value={summaryQuery.data?.benchCandidates || 0} 
              icon={<Users size={20}/>} 
              color="bg-yellow-600/10"
            />
            <StatsCard 
              title="Placed Candidates" 
              value={summaryQuery.data?.placedCandidates || 0} 
              icon={<CheckCircle size={20}/>} 
              color="bg-green-600/10"
            />
            <StatsCard 
              title="Active Jobs" 
              value={summaryQuery.data?.openJobs || 0} 
              icon={<Briefcase size={20}/>} 
              color="bg-purple-600/10"
            />
            <StatsCard 
              title="Closed Jobs" 
              value={summaryQuery.data?.closedJobs || 0} 
              icon={<Briefcase size={20}/>} 
              color="bg-gray-600/10"
            />
            <StatsCard 
              title="Total Submissions" 
              value={summaryQuery.data?.totalSubmissions || 0} 
              icon={<FileText size={20}/>} 
              color="bg-green-600/10"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Suspense fallback={<div className="p-6 animate-pulse">Loading chart...</div>}>
              <LazyFunnelChart data={funnelData} />
            </Suspense>
            <Suspense fallback={<div className="p-6 animate-pulse">Loading trend...</div>}>
              <LazyTrendLine data={trendsQuery.data || []} />
            </Suspense>
            <Suspense fallback={<div className="p-6 animate-pulse">Loading skills...</div>}>
              <LazyTopSkills data={skillsQuery.data || []} />
            </Suspense>
            <Suspense fallback={<div className="p-6 animate-pulse">Loading clients...</div>}>
              <LazyClientsBreakdown data={clientsQuery.data || []} />
            </Suspense>
          </div>
        </>
      )}
    </div>
  );
}