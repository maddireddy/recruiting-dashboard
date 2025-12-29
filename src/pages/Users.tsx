import { useState, useMemo } from 'react';
import { useList, useDelete } from '../services/hooks';
import { Plus, Search, Shield, UserCog, CheckCircle, XCircle, Edit } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import type { User } from '../types/user';

const ROLES = [
  { value: 'ADMIN', label: 'Admin', color: 'bg-purple-500/15 text-purple-300' },
  { value: 'RECRUITER', label: 'Recruiter', color: 'bg-blue-500/15 text-blue-300' },
  { value: 'HIRING_MANAGER', label: 'Hiring Manager', color: 'bg-green-500/15 text-green-300' },
  { value: 'INTERVIEWER', label: 'Interviewer', color: 'bg-amber-500/15 text-amber-300' },
];

const STATUS_COLORS = {
  ACTIVE: 'bg-green-500/20 text-green-400',
  INACTIVE: 'bg-red-500/20 text-red-400',
  PENDING: 'bg-yellow-500/20 text-yellow-400',
};

export default function UsersPage() {
  const tenantId = localStorage.getItem('tenantId') || undefined;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [, setIsModalOpen] = useState(false);
  const [, setSelectedUser] = useState<User | null>(null);

  // Mock service - replace with actual userService
  const usersQ = useList<User[]>('users', async () => {
    // Placeholder - replace with actual API call
    return [];
  }, tenantId);

  const deleteM = useDelete('users', async () => {
    // Placeholder delete function
    return '';
  }, tenantId);

  const users = usersQ.data || [];

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = !searchTerm ||
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = !selectedRole || user.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, selectedRole]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter(u => u.status === 'ACTIVE').length,
      admins: users.filter(u => u.role === 'ADMIN').length,
      recruiters: users.filter(u => u.role === 'RECRUITER').length,
    };
  }, [users]);

  const handleInviteUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deactivate this user? They will lose access to the platform.')) return;
    await deleteM.mutateAsync(id);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Team Members"
        subtitle="Manage user accounts, roles, and permissions across your organization"
        actions={
          <Button variant="primary" size="md" onClick={handleInviteUser}>
            <Plus size={16} />
            <span className="ml-2">Invite User</span>
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/15">
              <UserCog className="text-indigo-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Total Users</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/15">
              <CheckCircle className="text-green-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Active Users</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/15">
              <Shield className="text-purple-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Admins</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">{stats.admins}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15">
              <UserCog className="text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Recruiters</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">{stats.recruiters}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="card space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 md:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full pl-12"
            />
          </div>
          <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="input w-full md:w-auto">
            <option value="">All Roles</option>
            {ROLES.map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
        </div>

        {usersQ.isLoading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-[rgba(var(--app-border-subtle))]" />
            ))}
          </div>
        )}

        {!usersQ.isLoading && filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-[rgba(var(--app-border-subtle))] text-muted">
              <UserCog size={28} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No users found</h3>
              <p className="mt-1 text-sm text-muted">Start by inviting team members to your organization</p>
            </div>
            <Button variant="primary" onClick={handleInviteUser}>
              <Plus size={16} />
              <span className="ml-2">Invite First User</span>
            </Button>
          </div>
        )}

        {!usersQ.isLoading && filteredUsers.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-[rgba(var(--app-border-subtle))]">
            <table className="w-full">
              <thead className="bg-[rgb(var(--app-surface-muted))] text-left text-xs font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Active</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(var(--app-border-subtle))]">
                {filteredUsers.map(user => {
                  const roleInfo = ROLES.find(r => r.value === user.role);
                  const statusClass = STATUS_COLORS[user.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.PENDING;

                  return (
                    <tr key={user.id} className="hover:bg-[rgba(var(--app-surface-muted),0.4)]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400/30 to-purple-500/30">
                            <span className="text-sm font-semibold">
                              {user.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-[rgb(var(--app-text-primary))]">{user.fullName}</p>
                            <p className="text-sm text-muted">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`chip ${roleInfo?.color || 'bg-gray-500/15 text-gray-300'}`}>
                          {roleInfo?.label || user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`chip ${statusClass}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="rounded-lg border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] p-2 text-indigo-400 transition hover:border-indigo-400/50"
                            title="Edit user"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="rounded-lg border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] p-2 text-red-400 transition hover:border-red-400/50"
                            title="Deactivate user"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
