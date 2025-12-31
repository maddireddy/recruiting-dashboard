import { useState } from 'react';
import { ChevronRight, ChevronDown, Building2, Users, Edit } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import Button from '../ui/Button';

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

interface DepartmentTreeProps {
  departments: Department[];
  onEdit: (department: Department) => void;
}

interface TreeNodeProps {
  department: Department;
  children: Department[];
  onEdit: (department: Department) => void;
  level: number;
}

function TreeNode({ department, children, onEdit, level }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = children.length > 0;

  return (
    <div className="space-y-2">
      <div
        className="flex items-center gap-2 p-3 bg-[rgba(var(--app-surface))] border border-[rgba(var(--app-border))] rounded-lg hover:border-blue-500/50 transition-colors"
        style={{ marginLeft: `${level * 24}px` }}
      >
        {/* Expand/Collapse */}
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-[rgba(var(--app-surface-muted))] rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown size={16} className="text-muted" />
            ) : (
              <ChevronRight size={16} className="text-muted" />
            )}
          </button>
        ) : (
          <div className="w-6" /> // Spacer
        )}

        {/* Icon */}
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
          <Building2 size={16} className="text-blue-400" />
        </div>

        {/* Department Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[rgb(var(--app-text-primary))] truncate">
              {department.name}
            </h3>
            <span className="text-xs px-2 py-0.5 bg-[rgba(var(--app-surface-muted))] rounded text-muted">
              {department.code}
            </span>
          </div>
          {department.description && (
            <p className="text-sm text-muted truncate">{department.description}</p>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Users size={14} className="text-muted" />
            <span className="text-[rgb(var(--app-text-primary))]">{department.employeeCount}</span>
          </div>
          {hasChildren && (
            <div className="flex items-center gap-1">
              <Building2 size={14} className="text-muted" />
              <span className="text-[rgb(var(--app-text-primary))]">{children.length}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <Button
          variant="subtle"
          size="sm"
          onClick={() => onEdit(department)}
        >
          <Edit size={14} className="mr-1" />
          Edit
        </Button>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="space-y-2">
          {children.map((child) => {
            const grandChildren = findChildren(child.id, departments);
            return (
              <TreeNode
                key={child.id}
                department={child}
                children={grandChildren}
                onEdit={onEdit}
                level={level + 1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function findChildren(parentId: string, allDepartments: Department[]): Department[] {
  return allDepartments.filter(d => d.parent === parentId);
}

export default function DepartmentTree({ departments, onEdit }: DepartmentTreeProps) {
  // Get top-level departments (no parent)
  const topLevelDepartments = departments.filter(d => !d.parent);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-2">
          {topLevelDepartments.map((dept) => {
            const children = findChildren(dept.id, departments);
            return (
              <TreeNode
                key={dept.id}
                department={dept}
                children={children}
                onEdit={onEdit}
                level={0}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
