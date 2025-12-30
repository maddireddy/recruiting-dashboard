import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import StatsCard from '../components/dashboard/StatsCard.tsx';
import {
  Users,
  Briefcase,
  FileText,
  CheckCircle,
  CalendarClock,
  UserPlus,
  Sparkles,
  ListTodo,
  Mail,
} from 'lucide-react';
import { GettingStartedWidget } from '../components/dashboard/GettingStartedWidget';
import api from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import { PipelineOverview } from '../components/dashboard/PipelineOverview';
import { QuickActionsCard } from '../components/dashboard/QuickActionsCard';
import { ActivityFeedCard } from '../components/dashboard/ActivityFeedCard';
import { TalentFocusCard } from '../components/dashboard/TalentFocusCard';
import { Link } from 'react-router-dom';
import { isGPT51CodexMaxEnabled, getActiveAIModel } from '../lib/aiConfig';

const PIPELINE_PALETTE = ['#38bdf8', '#6366f1', '#f97316', '#22c55e', '#f43f5e'];

export default function DashboardPage() {
  // Summary stats
  const summaryQuery = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => api.get('/analytics/summary').then(res => res.data)
  });

  // Submission pipeline for stage overview
  const funnelQuery = useQuery({
    queryKey: ['submission-pipeline'],
    queryFn: () => api.get('/analytics/submission-pipeline').then(res => res.data)
  });

  const stats = useMemo(
    () => [
      {
        key: 'totalCandidates',
        title: 'Total Candidates',
        value: summaryQuery.data?.totalCandidates || 0,
        icon: <Users size={20} className="text-sky-400" />,
        accent: 'hover:border-sky-400/40'
      },
      {
        key: 'benchCandidates',
        title: 'Bench Ready',
        value: summaryQuery.data?.benchCandidates || 0,
        icon: <Users size={20} className="text-amber-400" />,
        accent: 'hover:border-amber-400/40'
      },
      {
        key: 'placedCandidates',
        title: 'Placed',
        value: summaryQuery.data?.placedCandidates || 0,
        icon: <CheckCircle size={20} className="text-emerald-400" />,
        accent: 'hover:border-emerald-400/40'
      },
      {
        key: 'openJobs',
        title: 'Active Jobs',
        value: summaryQuery.data?.openJobs || 0,
        icon: <Briefcase size={20} className="text-purple-400" />,
        accent: 'hover:border-purple-400/40'
      },
      {
        key: 'totalSubmissions',
        title: 'Submissions',
        value: summaryQuery.data?.totalSubmissions || 0,
        icon: <FileText size={20} className="text-emerald-300" />,
        accent: 'hover:border-emerald-300/40'
      }
    ],
    [summaryQuery.data]
  );

  const isEmptyState = useMemo(
    () => !summaryQuery.isLoading && (
      (summaryQuery.data?.totalCandidates ?? 0) === 0 &&
      (summaryQuery.data?.openJobs ?? 0) === 0 &&
      (summaryQuery.data?.totalSubmissions ?? 0) === 0
    ),
    [summaryQuery.data, summaryQuery.isLoading]
  );

  const funnelData = useMemo(() => {
    const source = (funnelQuery.data ?? {}) as Record<string, number>;
    const readCount = (...keys: string[]) => {
      for (const key of keys) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          const value = Number(source[key]);
          return Number.isFinite(value) ? value : 0;
        }
      }
      return 0;
    };

    return [
      { status: 'Submitted', count: readCount('Submitted', 'submitted') },
      { status: 'Shortlisted', count: readCount('Shortlisted', 'shortlisted') },
      { status: 'Interviewed', count: readCount('Interview', 'Interviewed', 'interview', 'interviewed') },
      { status: 'Offered', count: readCount('Offered', 'offered') },
      { status: 'Rejected', count: readCount('Rejected', 'rejected') },
    ];
  }, [funnelQuery.data]);

  const heroHighlights = useMemo(() => {
    const openJobs = summaryQuery.data?.openJobs ?? 0;
    const benchCandidates = summaryQuery.data?.benchCandidates ?? 0;
    const interviewStage = funnelData.find((stage) => stage.status === 'Interviewed');
    const interviewsScheduled = interviewStage?.count ?? 0;

    return [
      {
        id: 'open-jobs',
        label: 'Open searches',
        value: openJobs.toLocaleString(),
        detail: openJobs > 0 ? 'Prioritize roles with ageing candidates' : 'All searches filled',
      },
      {
        id: 'bench-ready',
        label: 'Bench ready talent',
        value: benchCandidates.toLocaleString(),
        detail: benchCandidates > 0 ? 'Matching to active openings' : 'No candidates on bench',
      },
      {
        id: 'interviews',
        label: 'Interviews this week',
        value: interviewsScheduled.toLocaleString(),
        detail: interviewsScheduled > 0 ? 'Ensure hiring panels are prepped' : 'Line up next conversations',
      },
    ];
  }, [summaryQuery.data, funnelData]);

  const pipelineStages = useMemo(() => {
    const firstStageCount = funnelData[0]?.count ?? 0;
    return funnelData.map((stage, index) => {
      const previous = index > 0 ? funnelData[index - 1] : undefined;
      const deltaRaw = previous ? ((stage.count - previous.count) / Math.max(previous.count, 1)) * 100 : 0;
      return {
        status: stage.status,
        count: stage.count,
        conversionRate: firstStageCount > 0 ? stage.count / firstStageCount : index === 0 ? 1 : 0,
        delta: Number.isFinite(deltaRaw) ? deltaRaw : 0,
        color: PIPELINE_PALETTE[index % PIPELINE_PALETTE.length],
      };
    });
  }, [funnelData]);

  const activityItems = useMemo(() => {
    const shortlisted = funnelData.find((stage) => stage.status === 'Shortlisted')?.count ?? 0;
    const interviews = funnelData.find((stage) => stage.status === 'Interviewed')?.count ?? 0;
    const offers = funnelData.find((stage) => stage.status === 'Offered')?.count ?? 0;

    return [
      {
        id: 'activity-interviews',
        title: 'Interviews confirmed',
        description: `${interviews.toLocaleString()} candidates are interviewing this week across engineering and product.`,
        timeAgo: '2 hours ago',
        icon: CalendarClock,
        tone: 'info' as const,
      },
      {
        id: 'activity-shortlist',
        title: 'Shortlist delivered to hiring managers',
        description: `${shortlisted.toLocaleString()} profiles shared for feedback.`,
        timeAgo: '4 hours ago',
        icon: Mail,
        tone: 'warning' as const,
      },
      {
        id: 'activity-offers',
        title: 'Offers prepared',
        description: `${offers.toLocaleString()} offers ready for compensation review.`,
        timeAgo: 'Yesterday',
        icon: Briefcase,
        tone: 'success' as const,
      },
    ];
  }, [funnelData]);

  const quickActions = useMemo(() => {
    const openJobs = summaryQuery.data?.openJobs ?? 0;
    const benchCandidates = summaryQuery.data?.benchCandidates ?? 0;
    const interviews = funnelData.find((stage) => stage.status === 'Interviewed')?.count ?? 0;

    return [
      {
        id: 'action-create-role',
        label: 'Create a new job',
        description: `${openJobs.toLocaleString()} searches active – keep the pipeline fresh.`,
        icon: Briefcase,
        to: '/jobs',
        tone: 'primary' as const,
      },
      {
        id: 'action-add-candidate',
        label: 'Add candidate insight',
        description: `${benchCandidates.toLocaleString()} candidates are bench-ready.`,
        icon: UserPlus,
        to: '/candidates',
      },
      {
        id: 'action-schedule',
        label: 'Schedule interviews',
        description: `${interviews.toLocaleString()} loops in progress – align panels.`,
        icon: CalendarClock,
        to: '/interviews',
      },
      {
        id: 'action-share-update',
        label: 'Share hiring update',
        description: 'Keep stakeholders in sync with a weekly briefing.',
        icon: Sparkles,
        to: '/documents',
        tone: 'success' as const,
      },
    ];
  }, [summaryQuery.data, funnelData]);

  return (
    <div className="space-y-10">
      <PageHeader title="Dashboard" subtitle="A command center built for recruiting teams." actions={<Button variant="subtle">Quick Action</Button>} />

      {isGPT51CodexMaxEnabled() && (
        <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-emerald-900">
                  {getActiveAIModel()} is Active
                </h3>
                <p className="mt-1 text-sm text-emerald-700">
                  Advanced AI capabilities are enabled for all clients. Experience enhanced candidate matching,
                  intelligent resume parsing, and predictive analytics across the platform.
                </p>
              </div>
            </div>
            <Link 
              to="/settings" 
              className="whitespace-nowrap rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-50 shadow-sm"
            >
              Configure AI
            </Link>
          </div>
        </div>
      )}

      {isEmptyState && <GettingStartedWidget />}

      {summaryQuery.isLoading || funnelQuery.isLoading ? (
        <div className="card animate-pulse" role="status" aria-live="polite">
          Loading dashboard...
        </div>
      ) : summaryQuery.error || funnelQuery.error ? (
        <div className="card border border-red-500/40 bg-red-500/10 text-red-400">
          Error loading dashboard data. Please try again later.
        </div>
      ) : (
        <>
          <Card className="relative overflow-hidden border border-[#E2E8F0] bg-white shadow-xl">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30" />
            <CardHeader className="relative z-10 gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">Weekly wrap</p>
                <CardTitle className="text-2xl sm:text-3xl text-[#0F172A]">Stay ahead of hiring momentum</CardTitle>
                <CardDescription className="max-w-lg text-[#64748B]">
                  Align talent partners and hiring managers on the priorities that drive the next wave of hires.
                </CardDescription>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700 font-medium">Bench refreshed hourly</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-blue-700 font-medium">Offer workflows automated</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-purple-700 font-medium">Reporting to Slack enabled</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:items-end">
                <Button variant="primary" size="md">Build hiring plan</Button>
                <Button variant="subtle" size="md">View weekly briefing</Button>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="grid gap-4 sm:grid-cols-3">
                {heroHighlights.map((highlight) => (
                  <div
                    key={highlight.id}
                    className="rounded-2xl border border-[#E2E8F0] bg-white/80 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">{highlight.label}</p>
                    <p className="text-2xl font-bold text-[#0F172A] mt-2">{highlight.value}</p>
                    <p className="text-xs text-[#64748B] mt-1">{highlight.detail}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
            {stats.map((stat) => (
              <StatsCard
                key={stat.key}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                accentClassName={stat.accent}
              />
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.75fr_1.25fr]">
            <PipelineOverview stages={pipelineStages} />
            <TalentFocusCard metrics={summaryQuery.data ?? {}} />
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
            <ActivityFeedCard items={activityItems} />
            <QuickActionsCard actions={quickActions} />
          </div>

          <Card className="flex flex-col gap-4 border-dashed">
            <CardHeader className="gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Workflow</p>
              <CardTitle className="text-lg">Next best move</CardTitle>
              <CardDescription>Clear focus keeps the team delivering consistent candidate experiences.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex flex-col gap-2 rounded-2xl border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted),0.6)] p-4">
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    <ListTodo size={14} />
                    1. Calibrate roles
                  </span>
                  <p className="text-sm text-[rgb(var(--app-text-primary))]">
                    Run intake syncs with hiring managers to align on updated scorecards.
                  </p>
                </div>
                <div className="flex flex-col gap-2 rounded-2xl border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted),0.6)] p-4">
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    <CalendarClock size={14} />
                    2. Accelerate interviews
                  </span>
                  <p className="text-sm text-[rgb(var(--app-text-primary))]">
                    Confirm panels and send prep packs 24 hours before interviews start.
                  </p>
                </div>
                <div className="flex flex-col gap-2 rounded-2xl border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted),0.6)] p-4">
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    <Sparkles size={14} />
                    3. Enable offers
                  </span>
                  <p className="text-sm text-[rgb(var(--app-text-primary))]">
                    Partner with finance and HRBP on comp guardrails before extending offers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}