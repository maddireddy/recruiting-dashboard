import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { jobService } from '../services/job.service';
import { submissionService } from '../services/submission.service';
import { ArrowLeft, MapPin, Briefcase, DollarSign, Users, Calendar, User } from 'lucide-react';
import Timeline, { type TimelineItem } from '../components/common/Timeline';

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();

  const jobQuery = useQuery({
    queryKey: ['job', id],
    enabled: !!id,
    queryFn: () => jobService.getById(id!).then(r => r.data),
  });

  const submissionsQuery = useQuery({
    queryKey: ['submissions', 'job', id],
    enabled: !!id,
    queryFn: () => submissionService.getByJob(id!).then(r => r.data),
  });

  if (jobQuery.isLoading) return <div className="p-6">Loading job...</div>;
  if (jobQuery.error) return <div className="p-6 text-red-500">Failed to load job.</div>;

  const j = jobQuery.data!;
  const timelineItems: TimelineItem[] = (submissionsQuery.data || []).flatMap((s) => {
    const items: TimelineItem[] = [];
    if (s.submittedDate) {
      items.push({
        id: `${s.id}-submitted`,
        date: s.submittedDate,
        title: `Submitted: ${s.candidateName}`,
        subtitle: `${s.client} • ${s.jobTitle}`,
        chip: 'SUBMITTED',
        statusColor: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
        href: `/candidates/${s.candidateId}`,
      });
    }
    if (s.interviewDate) {
      items.push({
        id: `${s.id}-interview`,
        date: s.interviewDate,
        title: `Interview Scheduled: ${s.candidateName}`,
        subtitle: `${s.client} • ${s.jobTitle}`,
        chip: 'INTERVIEW',
        statusColor: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
        href: `/candidates/${s.candidateId}`,
      });
    }
    if (['OFFERED', 'REJECTED', 'WITHDRAWN', 'INTERVIEWED'].includes(s.status)) {
      items.push({
        id: `${s.id}-final`,
        date: s.updatedAt || s.createdAt,
        title: `${s.status.replace('_', ' ')}: ${s.candidateName}`,
        subtitle: `${s.client} • ${s.jobTitle}`,
        chip: s.status,
        statusColor:
          s.status === 'OFFERED'
            ? 'bg-green-500/20 border-green-500/40 text-green-300'
            : s.status === 'REJECTED'
            ? 'bg-red-500/20 border-red-500/40 text-red-300'
            : 'bg-dark-200 border-dark-300 text-dark-400',
        href: `/candidates/${s.candidateId}`,
      });
    }
    return items;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/jobs" className="p-2 hover:bg-dark-200 rounded"><ArrowLeft size={18} /></Link>
          <div>
            <h1 className="text-2xl font-bold">{j.title}</h1>
            <p className="text-dark-600">{j.client} • {j.jobType?.replace('_',' ')} • {j.status?.replace('_',' ')}</p>
          </div>
        </div>
      </div>

      <div className="card grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2 text-sm text-dark-600">
          <div className="flex items-center gap-2"><MapPin size={14} /><span>{j.location}</span></div>
          <div className="flex items-center gap-2"><Briefcase size={14} /><span>{j.openings} openings</span></div>
          <div className="flex items-center gap-2"><DollarSign size={14} /><span>${j.rateMin} - ${j.rateMax}</span></div>
          <div className="flex items-center gap-2"><Users size={14} /><span>{j.submissionsCount} submissions</span></div>
        </div>
        <div className="md:col-span-2 space-y-2">
          <div className="text-sm"><span className="font-medium">Required:</span> {(j.requiredSkills || []).join(', ')}</div>
          <div className="text-sm"><span className="font-medium">Preferred:</span> {(j.preferredSkills || []).join(', ')}</div>
          {j.description && <div className="text-sm"><span className="font-medium">Description:</span> {j.description}</div>}
        </div>
      </div>

      <div className="space-y-3">
        <Timeline title="Timeline" items={timelineItems} />
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Submissions</h2>
        {submissionsQuery.isLoading && <div className="card p-4">Loading submissions...</div>}
        {submissionsQuery.error && <div className="card p-4 text-red-500">Failed to load submissions.</div>}
        {!submissionsQuery.isLoading && (submissionsQuery.data?.length ?? 0) === 0 && (
          <div className="card p-6 text-dark-600">No submissions yet.</div>
        )}
        <div className="grid gap-3">
          {submissionsQuery.data?.map(s => (
            <div key={s.id} className="card p-4 flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-4 text-sm text-dark-600">
                <div className="flex items-center gap-2"><User size={14} /><span>{s.candidateName}</span></div>
                {s.proposedRate ? (
                  <div className="flex items-center gap-2"><DollarSign size={14} /><span>${s.proposedRate}/hr</span></div>
                ) : null}
                {s.submittedDate && (
                  <div className="flex items-center gap-2"><Calendar size={14} /><span>{new Date(s.submittedDate).toLocaleDateString()}</span></div>
                )}
                <span className="px-2 py-1 text-xs rounded-full bg-dark-200 border border-dark-300">{s.status.replace('_',' ')}</span>
              </div>
              <Link to={`/candidates/${s.candidateId}`} className="text-primary-400 hover:underline">View Candidate</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
