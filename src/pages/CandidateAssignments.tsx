import { useState, useMemo } from 'react';
import { UserPlus, Search, Filter, Clock, Phone, Mail, Calendar, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import type { CandidateAssignment, CandidateActivity, RecruiterWorkload } from '../types/staffing';
import { motion } from 'framer-motion';
import clsx from 'clsx';

// Mock data
const mockAssignments: CandidateAssignment[] = [
  {
    id: '1',
    candidateId: 'cand-1',
    candidateName: 'John Doe',
    assignedToId: 'user-1',
    assignedToName: 'Sarah Johnson',
    assignedById: 'manager-1',
    assignedByName: 'Manager',
    status: 'active',
    priority: 'high',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Senior Software Engineer candidate - urgent requirement',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    candidateId: 'cand-2',
    candidateName: 'Jane Smith',
    assignedToId: 'user-2',
    assignedToName: 'Mike Chen',
    assignedById: 'manager-1',
    assignedByName: 'Manager',
    status: 'active',
    priority: 'medium',
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockActivities: CandidateActivity[] = [
  {
    id: '1',
    candidateId: 'cand-1',
    userId: 'user-1',
    userName: 'Sarah Johnson',
    type: 'call',
    title: 'Initial screening call',
    description: 'Discussed experience and salary expectations',
    duration: 30,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    candidateId: 'cand-1',
    userId: 'user-1',
    userName: 'Sarah Johnson',
    type: 'email',
    title: 'Sent job description',
    description: 'Forwarded Sr. SE JD and company overview',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    candidateId: 'cand-2',
    userId: 'user-2',
    userName: 'Mike Chen',
    type: 'meeting',
    title: 'Client introduction',
    description: 'Introduced candidate to hiring manager',
    duration: 45,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mockWorkload: RecruiterWorkload[] = [
  {
    userId: 'user-1',
    userName: 'Sarah Johnson',
    activeCandidates: 12,
    totalActivities: 45,
    callsMade: 8,
    emailsSent: 15,
    interviewsScheduled: 3,
    submissionsToday: 2,
    hoursLogged: 35.5,
  },
  {
    userId: 'user-2',
    userName: 'Mike Chen',
    activeCandidates: 8,
    totalActivities: 32,
    callsMade: 5,
    emailsSent: 12,
    interviewsScheduled: 2,
    submissionsToday: 1,
    hoursLogged: 28.0,
  },
];

export default function CandidateAssignmentsPage() {
  const [assignments, setAssignments] = useState<CandidateAssignment[]>(mockAssignments);
  const [activities, setActivities] = useState<CandidateActivity[]>(mockActivities);
  const [workload, setWorkload] = useState<RecruiterWorkload[]>(mockWorkload);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const matchesSearch =
        assignment.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.assignedToName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || assignment.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [assignments, searchQuery, statusFilter, priorityFilter]);

  const candidateActivities = selectedCandidate
    ? activities.filter((a) => a.candidateId === selectedCandidate)
    : [];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone size={16} className="text-blue-400" />;
      case 'email':
        return <Mail size={16} className="text-purple-400" />;
      case 'meeting':
        return <Calendar size={16} className="text-green-400" />;
      case 'interview':
        return <Calendar size={16} className="text-emerald-400" />;
      case 'submission':
        return <FileText size={16} className="text-orange-400" />;
      case 'note':
        return <FileText size={16} className="text-gray-400" />;
      default:
        return <Clock size={16} className="text-muted" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-500 bg-red-500/10';
      case 'high':
        return 'text-orange-500 bg-orange-500/10';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'low':
        return 'text-blue-500 bg-blue-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const formatTimeAgo = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Candidate Assignments"
        subtitle="Track who's working on which candidates and monitor activity"
        actions={
          <Button variant="primary">
            <UserPlus size={16} />
            <span className="ml-2">Assign Candidate</span>
          </Button>
        }
      />

      {/* Recruiter Workload Dashboard */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {workload.map((recruiter) => (
          <Card key={recruiter.userId}>
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="truncate">{recruiter.userName}</span>
                <TrendingUp size={14} className="text-muted" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Active Candidates</span>
                  <span className="font-semibold">{recruiter.activeCandidates}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Calls Today</span>
                  <span className="font-semibold">{recruiter.callsMade}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Submissions</span>
                  <span className="font-semibold">{recruiter.submissionsToday}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Hours Logged</span>
                  <span className="font-semibold">{recruiter.hoursLogged}h</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Assignments List */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Active Assignments ({filteredAssignments.length})</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input pl-10 w-64"
                    />
                  </div>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="input w-32"
                  >
                    <option value="all">All Priority</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredAssignments.map((assignment) => (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedCandidate(assignment.candidateId)}
                    className={clsx(
                      'p-4 rounded-lg border transition cursor-pointer',
                      selectedCandidate === assignment.candidateId
                        ? 'border-[rgb(var(--app-primary))] bg-[rgba(var(--app-primary),0.05)]'
                        : 'border-[rgba(var(--app-border-subtle))] hover:border-[rgba(var(--app-primary),0.3)]'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{assignment.candidateName}</h4>
                          <span className={clsx('chip text-xs', getPriorityColor(assignment.priority))}>
                            {assignment.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted">
                          <span>👤 {assignment.assignedToName}</span>
                          <span>📅 {new Date(assignment.startDate).toLocaleDateString()}</span>
                        </div>
                        {assignment.notes && (
                          <p className="text-sm text-muted mt-2">{assignment.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="chip bg-[rgba(var(--app-primary),0.1)] text-[rgb(var(--app-primary))] text-xs">
                          {activities.filter((a) => a.candidateId === assignment.candidateId).length} activities
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {filteredAssignments.length === 0 && (
                  <div className="text-center py-12 text-muted">
                    <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No assignments found matching your filters</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedCandidate
                ? `Activity Timeline - ${assignments.find((a) => a.candidateId === selectedCandidate)?.candidateName}`
                : 'Recent Activity'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(selectedCandidate ? candidateActivities : activities.slice(0, 10)).map((activity, index) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[rgba(var(--app-surface-muted),0.8)] flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                    {index < (selectedCandidate ? candidateActivities : activities).length - 1 && (
                      <div className="w-px h-full bg-[rgba(var(--app-border-subtle))] mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between mb-1">
                      <h5 className="font-medium text-sm">{activity.title}</h5>
                      <span className="text-xs text-muted">{formatTimeAgo(activity.createdAt)}</span>
                    </div>
                    <p className="text-sm text-muted mb-1">{activity.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span>👤 {activity.userName}</span>
                      {activity.duration && <span>⏱️ {activity.duration} min</span>}
                    </div>
                  </div>
                </div>
              ))}

              {!selectedCandidate && activities.length === 0 && (
                <div className="text-center py-8 text-muted">
                  <Clock size={32} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No recent activity</p>
                </div>
              )}

              {selectedCandidate && candidateActivities.length === 0 && (
                <div className="text-center py-8 text-muted">
                  <Clock size={32} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No activity for this candidate yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
