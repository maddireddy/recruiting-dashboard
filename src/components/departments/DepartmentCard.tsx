import { Building2, Users, MoreVertical, Edit, Trash2, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useState } from 'react';

interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  head: { id: string; name: string; employeeId: string } | null;
  employeeCount: number;
  parent: string | null;
  status: string;
}

interface DepartmentCardProps {
  department: Department;
  subDepartments: Department[];
  onEdit: () => void;
}

export default function DepartmentCard({ department, subDepartments, onEdit }: DepartmentCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleDelete = () => {
    // TODO: Implement delete
    console.log('Delete department', department.id);
  };

  return (
    <Card className="relative hover:border-blue-500/50 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Building2 size={20} className="text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg">{department.name}</CardTitle>
              <p className="text-xs text-muted">{department.code}</p>
            </div>
          </div>

          {/* Actions Menu */}
          <div className="relative">
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
                  Edit Department
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
                  Delete Department
                </button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Description */}
        <p className="text-sm text-muted mb-4">
          {department.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-[rgba(var(--app-surface-muted))] rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users size={14} className="text-muted" />
              <p className="text-xs text-muted">Employees</p>
            </div>
            <p className="text-xl font-bold text-[rgb(var(--app-text-primary))]">
              {department.employeeCount}
            </p>
          </div>

          <div className="text-center p-3 bg-[rgba(var(--app-surface-muted))] rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Building2 size={14} className="text-muted" />
              <p className="text-xs text-muted">Sub-Depts</p>
            </div>
            <p className="text-xl font-bold text-[rgb(var(--app-text-primary))]">
              {subDepartments.length}
            </p>
          </div>
        </div>

        {/* Department Head */}
        {department.head ? (
          <div className="p-3 bg-[rgba(var(--app-surface-muted))] rounded-lg mb-3">
            <p className="text-xs text-muted mb-1">Department Head</p>
            <p className="text-sm font-medium text-[rgb(var(--app-text-primary))]">
              {department.head.name}
            </p>
            <p className="text-xs text-muted">{department.head.employeeId}</p>
          </div>
        ) : (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-3">
            <p className="text-xs text-amber-400">No department head assigned</p>
          </div>
        )}

        {/* Sub-departments */}
        {subDepartments.length > 0 && (
          <div className="border-t border-[rgba(var(--app-border))] pt-3">
            <p className="text-xs font-medium text-muted mb-2">Sub-Departments</p>
            <div className="space-y-1">
              {subDepartments.map((subDept) => (
                <div
                  key={subDept.id}
                  className="flex items-center justify-between p-2 bg-[rgba(var(--app-surface-muted))] rounded text-sm"
                >
                  <div className="flex items-center gap-2">
                    <ChevronRight size={14} className="text-muted" />
                    <span className="text-[rgb(var(--app-text-primary))]">{subDept.name}</span>
                  </div>
                  <span className="text-xs text-muted">{subDept.employeeCount} emp</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
