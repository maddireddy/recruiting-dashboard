import { useState, useMemo } from 'react';
import { UserPlus, Mail, Shield, Trash2, MoreVertical, Crown, Check, X, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Field from '../../components/ui/Field';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/LoadingStates';
import { useOrganizationStore } from '../../store/organizationStore';
import { UsageLimitGuard } from '../../components/auth/FeatureGuard';

export type UserRole = 'ADMIN' | 'RECRUITER' | 'HIRING_MANAGER' | 'VIEWER';
export type UserStatus = 'ACTIVE' | 'INVITED' | 'SUSPENDED';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  invitedBy?: string;
  invitedAt?: string;
  lastActive?: string;
  avatar?: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Admin',
  RECRUITER: 'Recruiter',
  HIRING_MANAGER: 'Hiring Manager',
  VIEWER: 'Viewer',
};

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  ADMIN: 'Full access to all features and settings',
  RECRUITER: 'Can manage candidates, jobs, and submissions',
  HIRING_MANAGER: 'Can view and interview candidates',
  VIEWER: 'Read-only access to reports and candidates',
};

// Mock data - replace with real API calls
const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@acme.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    lastActive: '2025-01-10T14:30:00Z',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@acme.com',
    role: 'RECRUITER',
    status: 'ACTIVE',
    lastActive: '2025-01-10T12:15:00Z',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@acme.com',
    role: 'HIRING_MANAGER',
    status: 'INVITED',
    invitedAt: '2025-01-09T10:00:00Z',
    invitedBy: 'John Doe',
  },
];

export default function TeamSettings() {
  const { organization } = useOrganizationStore();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(MOCK_TEAM_MEMBERS);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const activeCount = teamMembers.filter(m => m.status === 'ACTIVE').length;
  const invitedCount = teamMembers.filter(m => m.status === 'INVITED').length;

  const filteredMembers = useMemo(() => {
    if (!searchQuery) return teamMembers;
    const query = searchQuery.toLowerCase();
    return teamMembers.filter(
      member =>
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query)
    );
  }, [teamMembers, searchQuery]);

  const handleInvite = async (email: string, role: UserRole) => {
    try {
      // TODO: Call backend API
      // await axios.post('/api/team/invite', { email, role });

      // Mock implementation
      const newMember: TeamMember = {
        id: Math.random().toString(36),
        name: '',
        email,
        role,
        status: 'INVITED',
        invitedAt: new Date().toISOString(),
        invitedBy: 'Current User',
      };

      setTeamMembers([...teamMembers, newMember]);
      toast.success(`Invitation sent to ${email}`);
      setShowInviteModal(false);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to send invitation');
    }
  };

  const handleResendInvite = async (memberId: string) => {
    try {
      // TODO: Call backend API
      toast.success('Invitation resent');
    } catch (error: any) {
      toast.error('Failed to resend invitation');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      // TODO: Call backend API
      // await axios.delete(`/api/team/members/${memberId}`);

      setTeamMembers(teamMembers.filter(m => m.id !== memberId));
      toast.success('Team member removed');
    } catch (error: any) {
      toast.error('Failed to remove team member');
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: UserRole) => {
    try {
      // TODO: Call backend API
      // await axios.put(`/api/team/members/${memberId}`, { role: newRole });

      setTeamMembers(
        teamMembers.map(m => (m.id === memberId ? { ...m, role: newRole } : m))
      );
      toast.success('Role updated');
    } catch (error: any) {
      toast.error('Failed to update role');
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-[rgba(var(--app-error),0.15)] text-[rgb(var(--app-error))]';
      case 'RECRUITER':
        return 'bg-[rgba(var(--app-primary),0.15)] text-[rgb(var(--app-primary))]';
      case 'HIRING_MANAGER':
        return 'bg-[rgba(var(--app-success),0.15)] text-[rgb(var(--app-success))]';
      case 'VIEWER':
        return 'bg-[rgba(var(--app-border-subtle),0.5)] text-muted';
      default:
        return 'bg-[rgba(var(--app-border-subtle),0.5)] text-muted';
    }
  };

  const getStatusBadgeColor = (status: UserStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-[rgba(var(--app-success),0.15)] text-[rgb(var(--app-success))]';
      case 'INVITED':
        return 'bg-[rgba(var(--app-warning),0.15)] text-[rgb(var(--app-warning))]';
      case 'SUSPENDED':
        return 'bg-[rgba(var(--app-error),0.15)] text-[rgb(var(--app-error))]';
      default:
        return 'bg-[rgba(var(--app-border-subtle),0.5)] text-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted">
        <span>Settings</span>
        <span>/</span>
        <span className="text-[rgb(var(--app-text-primary))]">Team Management</span>
      </nav>

      {/* Page Header */}
      <PageHeader
        title="Team Management"
        subtitle="Manage your team members, roles, and permissions"
        actions={
          <UsageLimitGuard
            limitType="users"
            currentCount={activeCount}
            fallback={
              <Button variant="subtle" onClick={() => toast.error(`Upgrade your plan to add more users (${activeCount}/${organization?.planLimits.maxUsers} used)`)}>
                <Crown size={16} className="mr-2" />
                Upgrade to Add Users
              </Button>
            }
          >
            <Button variant="primary" size="md" onClick={() => setShowInviteModal(true)}>
              <UserPlus size={16} />
              <span className="ml-2">Invite Member</span>
            </Button>
          </UsageLimitGuard>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Active Members</p>
              <p className="text-2xl font-bold text-[rgb(var(--app-text-primary))] mt-1">
                {activeCount}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[rgba(var(--app-success),0.1)] flex items-center justify-center">
              <Check size={24} className="text-[rgb(var(--app-success))]" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Pending Invitations</p>
              <p className="text-2xl font-bold text-[rgb(var(--app-text-primary))] mt-1">
                {invitedCount}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[rgba(var(--app-warning),0.1)] flex items-center justify-center">
              <Mail size={24} className="text-[rgb(var(--app-warning))]" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Plan Limit</p>
              <p className="text-2xl font-bold text-[rgb(var(--app-text-primary))] mt-1">
                {organization?.planLimits.maxUsers === -1 ? '∞' : `${activeCount}/${organization?.planLimits.maxUsers}`}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[rgba(var(--app-primary),0.1)] flex items-center justify-center">
              <Shield size={24} className="text-[rgb(var(--app-primary))]" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full pl-10"
          />
        </div>
      </div>

      {/* Members Table */}
      {isLoading ? (
        <TableSkeleton rows={6} columns={5} />
      ) : filteredMembers.length === 0 ? (
        <EmptyState
          icon={<UserPlus size={48} />}
          title="No team members found"
          description={
            searchQuery
              ? `No members match "${searchQuery}"`
              : "You haven't invited any team members yet"
          }
          action={
            !searchQuery ? (
              <Button variant="primary" onClick={() => setShowInviteModal(true)}>
                <UserPlus size={16} className="mr-2" />
                Invite Your First Member
              </Button>
            ) : (
              <Button variant="subtle" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            )
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[rgb(var(--app-surface-muted))] text-left text-xs font-semibold uppercase tracking-wider text-muted border-b border-[rgba(var(--app-border-subtle))]">
                <tr>
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Active</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(var(--app-border-subtle))]">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-[rgba(var(--app-surface-muted),0.4)] transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[rgba(var(--app-primary),0.1)] text-[rgb(var(--app-primary))] flex items-center justify-center font-semibold">
                          {member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-[rgb(var(--app-text-primary))]">
                            {member.name || 'Invitation Pending'}
                          </div>
                          <div className="text-sm text-muted">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.id, e.target.value as UserRole)}
                        className={`chip ${getRoleBadgeColor(member.role)} border-0 cursor-pointer`}
                      >
                        {Object.entries(ROLE_LABELS).map(([role, label]) => (
                          <option key={role} value={role}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`chip ${getStatusBadgeColor(member.status)}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">
                      {member.status === 'INVITED' ? (
                        <div>
                          <div>Invited {new Date(member.invitedAt!).toLocaleDateString()}</div>
                          <div className="text-xs">by {member.invitedBy}</div>
                        </div>
                      ) : member.lastActive ? (
                        new Date(member.lastActive).toLocaleDateString()
                      ) : (
                        'Never'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {member.status === 'INVITED' && (
                          <button
                            onClick={() => handleResendInvite(member.id)}
                            className="p-2 rounded-lg hover:bg-[rgba(var(--app-primary),0.1)] text-[rgb(var(--app-primary))] transition"
                            title="Resend Invitation"
                          >
                            <Mail size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-2 rounded-lg hover:bg-[rgba(var(--app-error),0.1)] text-[rgb(var(--app-error))] transition"
                          title="Remove Member"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-[rgba(var(--app-border-subtle))] text-sm text-muted">
            Showing {filteredMembers.length} of {teamMembers.length} team member(s)
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && <InviteModal onClose={() => setShowInviteModal(false)} onInvite={handleInvite} />}
    </div>
  );
}

function InviteModal({ onClose, onInvite }: { onClose: () => void; onInvite: (email: string, role: UserRole) => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('RECRUITER');
  const [errors, setErrors] = useState<{ email?: string }>({});

  const validate = () => {
    const newErrors: { email?: string } = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email address';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onInvite(email, role);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-lg">
        <div className="pb-4 border-b border-[rgba(var(--app-border-subtle))]">
          <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">
            Invite Team Member
          </h2>
          <p className="text-sm text-muted mt-1">
            Send an invitation to join your organization
          </p>
        </div>

        <div className="py-6 space-y-5">
          <Field label="Email Address" htmlFor="email" error={errors.email} required>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="colleague@example.com"
            />
          </Field>

          <Field label="Role" htmlFor="role" required>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="input"
            >
              {Object.entries(ROLE_LABELS).map(([roleValue, label]) => (
                <option key={roleValue} value={roleValue}>
                  {label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted mt-2">
              {ROLE_DESCRIPTIONS[role]}
            </p>
          </Field>
        </div>

        <div className="pt-4 border-t border-[rgba(var(--app-border-subtle))] flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            <Mail size={16} className="mr-2" />
            Send Invitation
          </Button>
        </div>
      </div>
    </div>
  );
}
