import { Mail, Badge as BadgeIcon, Calendar, MoreVertical, Edit, Trash2, Download, Key } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { useState } from 'react';

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  department: string;
  photo: string | null;
  status: string;
  joinDate: string;
  role: string;
}

interface EmployeeCardProps {
  employee: Employee;
  onEdit: () => void;
}

export default function EmployeeCard({ employee, onEdit }: EmployeeCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getInitials = () => {
    return `${employee.firstName[0]}${employee.lastName[0]}`.toUpperCase();
  };

  const getStatusColor = () => {
    switch (employee.status) {
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'inactive':
        return 'bg-gray-500/20 text-gray-400';
      case 'on-leave':
        return 'bg-amber-500/20 text-amber-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getRoleBadgeColor = () => {
    switch (employee.role) {
      case 'ADMIN':
        return 'bg-purple-500/20 text-purple-400';
      case 'RECRUITER':
        return 'bg-blue-500/20 text-blue-400';
      case 'HIRING_MANAGER':
        return 'bg-green-500/20 text-green-400';
      case 'INTERVIEWER':
        return 'bg-amber-500/20 text-amber-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDownloadBadge = () => {
    // TODO: Implement badge download
    console.log('Download badge for', employee.employeeId);
  };

  const handleResetPassword = () => {
    // TODO: Implement password reset
    console.log('Reset password for', employee.email);
  };

  const handleDelete = () => {
    // TODO: Implement delete
    console.log('Delete employee', employee.id);
  };

  return (
    <Card className="relative hover:border-blue-500/50 transition-colors">
      <CardContent className="pt-6">
        {/* Actions Menu */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-[rgba(var(--app-surface-muted))] rounded transition-colors"
          >
            <MoreVertical size={18} className="text-muted" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-[rgba(var(--app-surface-elevated))] border border-[rgba(var(--app-border))] rounded-lg shadow-lg py-1 z-10">
              <button
                onClick={() => {
                  onEdit();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--app-text-primary))] hover:bg-[rgba(var(--app-surface-muted))] flex items-center gap-2"
              >
                <Edit size={14} />
                Edit Employee
              </button>
              <button
                onClick={() => {
                  handleDownloadBadge();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--app-text-primary))] hover:bg-[rgba(var(--app-surface-muted))] flex items-center gap-2"
              >
                <Download size={14} />
                Download Badge
              </button>
              <button
                onClick={() => {
                  handleResetPassword();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--app-text-primary))] hover:bg-[rgba(var(--app-surface-muted))] flex items-center gap-2"
              >
                <Key size={14} />
                Reset Password
              </button>
              <div className="border-t border-[rgba(var(--app-border))] my-1" />
              <button
                onClick={() => {
                  handleDelete();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-[rgba(var(--app-surface-muted))] flex items-center gap-2"
              >
                <Trash2 size={14} />
                Delete Employee
              </button>
            </div>
          )}
        </div>

        {/* Employee Info */}
        <div className="flex flex-col items-center text-center mb-4">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold mb-3">
            {employee.photo ? (
              <img
                src={employee.photo}
                alt={`${employee.firstName} ${employee.lastName}`}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials()
            )}
          </div>

          {/* Name */}
          <h3 className="text-lg font-semibold text-[rgb(var(--app-text-primary))] mb-1">
            {employee.firstName} {employee.lastName}
          </h3>

          {/* Title */}
          <p className="text-sm text-muted mb-2">{employee.title}</p>

          {/* Badges */}
          <div className="flex gap-2 mb-3">
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor()}`}>
              {employee.status}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor()}`}>
              {employee.role.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 border-t border-[rgba(var(--app-border))] pt-4">
          <div className="flex items-center gap-2 text-sm">
            <BadgeIcon size={14} className="text-muted flex-shrink-0" />
            <span className="text-[rgb(var(--app-text-primary))] font-mono">
              {employee.employeeId}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Mail size={14} className="text-muted flex-shrink-0" />
            <span className="text-[rgb(var(--app-text-primary))] truncate">
              {employee.email}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar size={14} className="text-muted flex-shrink-0" />
            <span className="text-muted">
              Joined {formatDate(employee.joinDate)}
            </span>
          </div>
        </div>

        {/* Department Tag */}
        <div className="mt-4 pt-4 border-t border-[rgba(var(--app-border))]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">Department</span>
            <span className="text-xs font-medium text-[rgb(var(--app-text-primary))]">
              {employee.department}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
