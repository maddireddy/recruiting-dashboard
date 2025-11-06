import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { candidateService } from '../services/candidate.service';
import { submissionService } from '../services/submission.service';
import { ArrowLeft, Briefcase, Calendar, DollarSign, User, Mail, Phone } from 'lucide-react';
import Timeline, { type TimelineItem } from '../components/common/Timeline';
import CandidateDocuments from '../components/candidates/CandidateDocuments';

export default function CandidateDetails() {
  const { id } = useParams<{ id: string }>();

  const candidateQuery = useQuery({
    queryKey: ['candidate', id],
    enabled: !!id,
    queryFn: () => candidateService.getById(id!).then(r => r.data),
  });

  const submissionsQuery = useQuery({
    queryKey: ['submissions', 'candidate', id],
    enabled: !!id,
    queryFn: () => submissionService.getByCandidate(id!).then(r => r.data),
  });

  if (candidateQuery.isLoading) return <div className="p-6">Loading candidate...</div>;
  if (candidateQuery.error) return <div className="p-6 text-red-500">Failed to load candidate.</div>;

  const c = candidateQuery.data!;
  const timelineItems: TimelineItem[] = (submissionsQuery.data || []).flatMap((s) => {
    const items: TimelineItem[] = [];
    if (s.submittedDate) {
      items.push({
        id: `${s.id}-submitted`,
        date: s.submittedDate,
        title: `Submitted to ${s.client}`,
        subtitle: s.jobTitle,
        chip: 'SUBMITTED',
        statusColor: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
        href: `/jobs/${s.jobId}`,
      });
    }
    if (s.interviewDate) {
      items.push({
        id: `${s.id}-interview`,
        date: s.interviewDate,
        title: `Interview Scheduled at ${s.client}`,
        subtitle: s.jobTitle,
        chip: 'INTERVIEW',
        statusColor: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
        href: `/jobs/${s.jobId}`,
      });
    }
    // Final status point (if offered/rejected/withdrawn/interviewed)
    if (['OFFERED', 'REJECTED', 'WITHDRAWN', 'INTERVIEWED'].includes(s.status)) {
      items.push({
        id: `${s.id}-final`,
        date: s.updatedAt || s.createdAt,
        title: `${s.status.replace('_', ' ')}`,
        subtitle: `${s.client} • ${s.jobTitle}`,
        chip: s.status,
        statusColor:
          s.status === 'OFFERED'
            ? 'bg-green-500/20 border-green-500/40 text-green-300'
            : s.status === 'REJECTED'
            ? 'bg-red-500/20 border-red-500/40 text-red-300'
            : 'bg-dark-200 border-dark-300 text-dark-400',
        href: `/jobs/${s.jobId}`,
      });
    }
    return items;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/candidates" className="p-2 hover:bg-dark-200 rounded">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{c.fullName}</h1>
            <p className="text-dark-600">{c.visaStatus} • {c.totalExperience} yrs exp</p>
          </div>
        </div>
      </div>

      <div className="card grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm"><Mail size={14} /><span>{c.email}</span></div>
          <div className="flex items-center gap-2 text-sm"><Phone size={14} /><span>{c.phone}</span></div>
          <div className="text-sm"><span className="font-medium">Availability:</span> {c.availability}</div>
          <div className="text-sm"><span className="font-medium">Status:</span> {c.status}</div>
        </div>
        <div className="md:col-span-2">
          <div className="text-sm"><span className="font-medium">Primary Skills:</span> {(c.primarySkills || []).join(', ')}</div>
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
                <div className="flex items-center gap-2"><Briefcase size={14} /><span>{s.jobTitle}</span></div>
                <div className="flex items-center gap-2"><User size={14} /><span>{s.client}</span></div>
                {s.proposedRate ? (
                  <div className="flex items-center gap-2"><DollarSign size={14} /><span>${s.proposedRate}/hr</span></div>
                ) : null}
                {s.submittedDate && (
                  <div className="flex items-center gap-2"><Calendar size={14} /><span>{new Date(s.submittedDate).toLocaleDateString()}</span></div>
                )}
                <span className="px-2 py-1 text-xs rounded-full bg-dark-200 border border-dark-300">{s.status.replace('_',' ')}</span>
              </div>
              <Link to={`/jobs/${s.jobId}`} className="text-primary-400 hover:underline">View Job</Link>
            </div>
          ))}
        </div>
      </div>

      {/* Candidate-specific documents section */}
      <div className="space-y-3">
        <CandidateDocuments candidateId={id!} />
      </div>
    </div>
  );
}
