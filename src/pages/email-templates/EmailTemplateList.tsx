import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Plus, Search, Filter, Eye, Edit, Trash2, Copy, CheckCircle, Archive } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/card';
import emailTemplateService, { EmailTemplate } from '../../services/emailTemplate.service';

export default function EmailTemplateList() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadTemplates();
  }, [selectedCategory, selectedStatus]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (selectedCategory !== 'all') params.category = selectedCategory;

      const data = await emailTemplateService.getTemplates(params);
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await emailTemplateService.deleteTemplate(id);
      setTemplates(prev => prev.filter(t => t._id !== id));
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      const updated = await emailTemplateService.activateTemplate(id);
      setTemplates(prev => prev.map(t => t._id === id ? updated : t));
    } catch (error) {
      console.error('Failed to activate template:', error);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'employee_welcome', label: 'Employee Welcome' },
    { value: 'employee_offboarding', label: 'Employee Offboarding' },
    { value: 'candidate_application_received', label: 'Application Received' },
    { value: 'interview_invitation', label: 'Interview Invitation' },
    { value: 'interview_reminder', label: 'Interview Reminder' },
    { value: 'offer_letter', label: 'Offer Letter' },
    { value: 'rejection', label: 'Rejection' },
    { value: 'password_reset', label: 'Password Reset' },
    { value: 'custom', label: 'Custom' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Templates"
        subtitle="Manage email templates for automated communications"
        actions={
          <Button
            variant="primary"
            onClick={() => navigate('/email-templates/new')}
          >
            <Plus size={16} className="mr-2" />
            Create Template
          </Button>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-[rgba(var(--app-surface-muted),0.5)] border border-[rgba(var(--app-border))] text-sm text-[rgb(var(--app-text-primary))] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-muted" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[rgba(var(--app-surface-muted),0.5)] border border-[rgba(var(--app-border))] text-sm text-[rgb(var(--app-text-primary))]"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {['all', 'draft', 'active', 'archived'].map(status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                    selectedStatus === status
                      ? 'bg-blue-500 text-white'
                      : 'bg-[rgba(var(--app-surface-muted),0.5)] text-muted hover:text-[rgb(var(--app-text-primary))]'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <Mail size={64} className="text-muted mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-[rgb(var(--app-text-primary))] mb-2">
                No templates found
              </h3>
              <p className="text-sm text-muted text-center max-w-sm mb-4">
                {searchTerm ? 'Try adjusting your search or filters.' : 'Get started by creating your first email template.'}
              </p>
              {!searchTerm && (
                <Button variant="primary" onClick={() => navigate('/email-templates/new')}>
                  <Plus size={16} className="mr-2" />
                  Create Template
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <Card key={template._id} className="hover:border-blue-500/50 transition-all">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <span className="text-2xl">
                          {emailTemplateService.getCategoryIcon(template.category)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-[rgb(var(--app-text-primary))]">
                          {template.name}
                        </h3>
                        <p className="text-xs text-muted">
                          {emailTemplateService.getCategoryName(template.category)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {template.isDefault && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-400">
                          Default
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Subject Preview */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted">Subject</p>
                    <p className="text-sm text-[rgb(var(--app-text-primary))] line-clamp-2">
                      {template.subject}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-muted">
                    <div className="flex items-center gap-1">
                      <Mail size={14} />
                      <span>{template.usageCount} sent</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={emailTemplateService.getStatusColor(template.status)}>
                        v{template.version}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${emailTemplateService.getStatusBadge(template.status)}`}>
                      {template.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[rgba(var(--app-border))]">
                    <button
                      onClick={() => navigate(`/email-templates/${template._id}`)}
                      className="flex-1 px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => navigate(`/email-templates/${template._id}/preview`)}
                      className="p-2 rounded-lg hover:bg-[rgba(var(--app-surface-muted),0.5)] transition-colors"
                      title="Preview"
                    >
                      <Eye size={16} className="text-muted" />
                    </button>
                    {template.status === 'draft' && (
                      <button
                        onClick={() => handleActivate(template._id)}
                        className="p-2 rounded-lg hover:bg-green-500/20 transition-colors"
                        title="Activate"
                      >
                        <CheckCircle size={16} className="text-green-400" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(template._id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
