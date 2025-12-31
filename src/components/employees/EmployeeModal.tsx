import { useState } from 'react';
import { X, User, Mail, Building2, Calendar, Badge as BadgeIcon, Upload } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';

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

interface EmployeeModalProps {
  employee: Employee | null;
  onClose: () => void;
}

const ROLES = ['ADMIN', 'RECRUITER', 'HIRING_MANAGER', 'INTERVIEWER', 'CANDIDATE'];
const DEPARTMENTS = ['HR', 'Engineering', 'Sales', 'Marketing', 'Finance', 'Operations'];
const STATUSES = ['active', 'inactive', 'on-leave'];
const EMAIL_FORMATS = ['firstname.lastname', 'firstinitial.lastname', 'firstname_lastname'];

export default function EmployeeModal({ employee, onClose }: EmployeeModalProps) {
  const [formData, setFormData] = useState({
    firstName: employee?.firstName || '',
    lastName: employee?.lastName || '',
    email: employee?.email || '',
    title: employee?.title || '',
    department: employee?.department || '',
    role: employee?.role || 'RECRUITER',
    status: employee?.status || 'active',
    joinDate: employee?.joinDate || new Date().toISOString().split('T')[0],
  });

  const [emailFormat, setEmailFormat] = useState<string>('firstname.lastname');
  const [provisionEmail, setProvisionEmail] = useState(!employee);
  const [autoGenerateId, setAutoGenerateId] = useState(!employee);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(employee?.photo || null);

  const generateEmail = () => {
    const { firstName, lastName } = formData;
    if (!firstName || !lastName) return '';

    const domain = '@acme-corp.com'; // TODO: Get from organization settings

    switch (emailFormat) {
      case 'firstname.lastname':
        return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${domain}`;
      case 'firstinitial.lastname':
        return `${firstName[0].toLowerCase()}.${lastName.toLowerCase()}${domain}`;
      case 'firstname_lastname':
        return `${firstName.toLowerCase()}_${lastName.toLowerCase()}${domain}`;
      default:
        return '';
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submissionData = {
      ...formData,
      email: provisionEmail ? generateEmail() : formData.email,
      autoGenerateId,
      photo: photoFile,
    };

    console.log('Submitting employee:', submissionData);

    // TODO: Call API to create/update employee
    // If provisionEmail is true, also provision email account
    // If autoGenerateId is true, generate next available ID

    onClose();
  };

  // Update email preview when format or names change
  const emailPreview = provisionEmail ? generateEmail() : formData.email;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[rgba(var(--app-surface))] rounded-lg border border-[rgba(var(--app-border))] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[rgba(var(--app-surface))] border-b border-[rgba(var(--app-border))] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">
            {employee ? 'Edit Employee' : 'Add New Employee'}
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
          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-2">
              Photo
            </label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Employee"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : formData.firstName && formData.lastName ? (
                  `${formData.firstName[0]}${formData.lastName[0]}`.toUpperCase()
                ) : (
                  <User size={32} />
                )}
              </div>
              <div className="flex-1">
                <label className="block">
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <Button type="button" variant="subtle" size="sm" as="span">
                    <Upload size={14} className="mr-1" />
                    Upload Photo
                  </Button>
                </label>
                <p className="text-xs text-muted mt-1">
                  JPG or PNG, max 2MB (recommended: 400x400px)
                </p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-2">
                First Name *
              </label>
              <Input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-2">
                Last Name *
              </label>
              <Input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Job Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-2">
                Job Title *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="pl-10"
                  placeholder="e.g., Senior Recruiter"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-2">
                Department *
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-2.5 bg-[rgba(var(--app-surface))] border border-[rgba(var(--app-border))] rounded-lg text-[rgb(var(--app-text-primary))] focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select department</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Role and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-2">
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2.5 bg-[rgba(var(--app-surface))] border border-[rgba(var(--app-border))] rounded-lg text-[rgb(var(--app-text-primary))] focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

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
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Join Date */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-2">
              Join Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <Input
                type="date"
                value={formData.joinDate}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Email Configuration */}
          <div className="space-y-4 border-t border-[rgba(var(--app-border))] pt-6">
            <h3 className="font-medium text-[rgb(var(--app-text-primary))]">Email Configuration</h3>

            {!employee && (
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="provisionEmail"
                  checked={provisionEmail}
                  onChange={(e) => setProvisionEmail(e.target.checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label
                    htmlFor="provisionEmail"
                    className="text-sm font-medium text-[rgb(var(--app-text-primary))] cursor-pointer"
                  >
                    Provision email account automatically
                  </label>
                  <p className="text-xs text-muted mt-1">
                    Create and configure email account for this employee
                  </p>
                </div>
              </div>
            )}

            {provisionEmail ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-2">
                    Email Format
                  </label>
                  <select
                    value={emailFormat}
                    onChange={(e) => setEmailFormat(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[rgba(var(--app-surface))] border border-[rgba(var(--app-border))] rounded-lg text-[rgb(var(--app-text-primary))] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {EMAIL_FORMATS.map((format) => (
                      <option key={format} value={format}>
                        {format}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={14} className="text-blue-400" />
                    <span className="text-muted">Email will be:</span>
                    <code className="text-blue-400 font-mono">{emailPreview}</code>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    placeholder="email@company.com"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* Employee ID */}
          {!employee && (
            <div className="space-y-4 border-t border-[rgba(var(--app-border))] pt-6">
              <h3 className="font-medium text-[rgb(var(--app-text-primary))]">Employee ID</h3>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="autoGenerateId"
                  checked={autoGenerateId}
                  onChange={(e) => setAutoGenerateId(e.target.checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label
                    htmlFor="autoGenerateId"
                    className="text-sm font-medium text-[rgb(var(--app-text-primary))] cursor-pointer"
                  >
                    Auto-generate employee ID
                  </label>
                  <p className="text-xs text-muted mt-1">
                    {autoGenerateId
                      ? 'Next available ID will be assigned automatically'
                      : 'Manually specify employee ID'}
                  </p>
                </div>
              </div>

              {autoGenerateId && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <BadgeIcon size={14} className="text-green-400" />
                    <span className="text-muted">Next ID:</span>
                    <code className="text-green-400 font-mono">EMP-0004</code>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-[rgba(var(--app-border))]">
            <Button type="button" variant="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {employee ? 'Update Employee' : 'Create Employee'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
