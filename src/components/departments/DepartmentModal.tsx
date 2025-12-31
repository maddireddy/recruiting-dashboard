import { useState } from 'react';
import { X, Building2, Hash, Loader2 } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import departmentService from '../../services/department.service';

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

interface DepartmentModalProps {
  department: Department | null;
  departments: Department[];
  onClose: (shouldRefresh?: boolean) => void;
}

export default function DepartmentModal({ department, departments, onClose }: DepartmentModalProps) {
  const [formData, setFormData] = useState({
    name: department?.name || '',
    code: department?.code || '',
    description: department?.description || '',
    parent: department?.parent || '',
    status: department?.status || 'active',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description.trim(),
        parent: formData.parent || undefined,
        status: formData.status as 'active' | 'inactive',
      };

      if (department) {
        // Update existing department
        await departmentService.updateDepartment(department.id, payload);
      } else {
        // Create new department
        await departmentService.createDepartment(payload);
      }

      onClose(true); // Close and trigger refresh
    } catch (err: any) {
      console.error('Failed to save department:', err);
      setError(err.response?.data?.message || 'Failed to save department');
      setSubmitting(false);
    }
  };

  // Only show top-level departments as parent options
  const parentOptions = departments.filter(d => !d.parent && d.id !== department?.id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[rgba(var(--app-surface))] rounded-lg border border-[rgba(var(--app-border))] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[rgba(var(--app-surface))] border-b border-[rgba(var(--app-border))] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">
            {department ? 'Edit Department' : 'Add New Department'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[rgba(var(--app-surface-muted))] rounded transition-colors"
          >
            <X size={20} className="text-muted" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Department Name */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-2">
              Department Name *
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="pl-10"
                placeholder="e.g., Engineering, Sales, Marketing"
                required
              />
            </div>
          </div>

          {/* Department Code */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-2">
              Department Code *
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <Input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="pl-10"
                placeholder="e.g., ENG, SALES, MKT"
                maxLength={20}
                required
              />
            </div>
            <p className="text-xs text-muted mt-1">
              Short code for the department (will be converted to uppercase)
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-[rgba(var(--app-surface))] border border-[rgba(var(--app-border))] rounded-lg text-[rgb(var(--app-text-primary))] focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              placeholder="Brief description of the department's responsibilities..."
            />
          </div>

          {/* Parent Department */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-2">
              Parent Department (Optional)
            </label>
            <select
              value={formData.parent}
              onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
              className="w-full px-4 py-2.5 bg-[rgba(var(--app-surface))] border border-[rgba(var(--app-border))] rounded-lg text-[rgb(var(--app-text-primary))] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None (Top-level department)</option>
              {parentOptions.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
            <p className="text-xs text-muted mt-1">
              Select a parent to create a sub-department
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-2">
              Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2.5 bg-[rgba(var(--app-surface))] border border-[rgba(var(--app-border))] rounded-lg text-[rgb(var(--app-text-primary))] focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <h4 className="font-medium text-[rgb(var(--app-text-primary))] mb-1">
                  Department Organization Tips
                </h4>
                <ul className="text-sm text-muted space-y-1">
                  <li>• Use clear, descriptive names for easy identification</li>
                  <li>• Keep department codes short and memorable</li>
                  <li>• Create sub-departments for better organization</li>
                  <li>• Assign department heads for accountability</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-[rgba(var(--app-border))]">
            <Button type="button" variant="subtle" onClick={() => onClose()} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Saving...
                </>
              ) : (
                department ? 'Update Department' : 'Create Department'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
