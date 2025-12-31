import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Send, Eye, Code, Type, Loader2 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import emailTemplateService, { EmailTemplate, CreateEmailTemplateData } from '../../services/emailTemplate.service';

export default function EmailTemplateEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<{ subject: string; body: string; bodyHtml: string } | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  const [formData, setFormData] = useState<CreateEmailTemplateData>({
    name: '',
    slug: '',
    description: '',
    category: 'custom',
    subject: '',
    body: '',
    bodyHtml: '',
    fromName: '',
    fromEmail: '',
    replyTo: '',
    variables: [],
    isDefault: false,
  });

  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      loadTemplate();
    }
  }, [id]);

  useEffect(() => {
    // Extract variables from body
    const extracted = emailTemplateService.extractVariables(formData.body);
    const newVars: Record<string, string> = {};
    extracted.forEach(varName => {
      newVars[varName] = variableValues[varName] || '';
    });
    setVariableValues(newVars);
  }, [formData.body]);

  const loadTemplate = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const template = await emailTemplateService.getTemplate(id);
      setFormData({
        name: template.name,
        slug: template.slug,
        description: template.description || '',
        category: template.category,
        subject: template.subject,
        body: template.body,
        bodyHtml: template.bodyHtml || '',
        fromName: template.fromName || '',
        fromEmail: template.fromEmail || '',
        replyTo: template.replyTo || '',
        variables: template.variables || [],
        isDefault: template.isDefault,
      });
    } catch (error) {
      console.error('Failed to load template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
        ...formData,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
      };

      if (id) {
        await emailTemplateService.updateTemplate(id, payload);
      } else {
        await emailTemplateService.createTemplate(payload);
      }

      navigate('/email-templates');
    } catch (error: any) {
      console.error('Failed to save template:', error);
      alert(error.response?.data?.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    if (!id) {
      // Local preview for new templates
      setPreviewData({
        subject: renderVariables(formData.subject),
        body: renderVariables(formData.body),
        bodyHtml: renderVariables(formData.bodyHtml || ''),
      });
      setShowPreview(true);
      return;
    }

    try {
      const preview = await emailTemplateService.previewTemplate(id, variableValues);
      setPreviewData(preview);
      setShowPreview(true);
    } catch (error) {
      console.error('Failed to preview template:', error);
    }
  };

  const handleSendTest = async () => {
    if (!id || !testEmail) return;

    try {
      setSendingTest(true);
      await emailTemplateService.sendTestEmail(id, testEmail, variableValues);
      alert(`Test email sent to ${testEmail}`);
      setTestEmail('');
    } catch (error: any) {
      console.error('Failed to send test email:', error);
      alert(error.response?.data?.message || 'Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  const renderVariables = (text: string): string => {
    let result = text;
    Object.keys(variableValues).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, variableValues[key] || `{{${key}}}`);
    });
    return result;
  };

  const categories = [
    { value: 'employee_welcome', label: 'Employee Welcome' },
    { value: 'employee_offboarding', label: 'Employee Offboarding' },
    { value: 'candidate_application_received', label: 'Application Received' },
    { value: 'interview_invitation', label: 'Interview Invitation' },
    { value: 'interview_reminder', label: 'Interview Reminder' },
    { value: 'offer_letter', label: 'Offer Letter' },
    { value: 'rejection', label: 'Rejection' },
    { value: 'password_reset', label: 'Password Reset' },
    { value: 'email_verification', label: 'Email Verification' },
    { value: 'notification_digest', label: 'Notification Digest' },
    { value: 'custom', label: 'Custom' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={id ? 'Edit Template' : 'Create Email Template'}
        subtitle="Design email templates with variable substitution"
        actions={
          <div className="flex gap-2">
            <Button variant="subtle" onClick={() => navigate('/email-templates')}>
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
            <Button variant="secondary" onClick={handlePreview}>
              <Eye size={16} className="mr-2" />
              Preview
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving || !formData.name || !formData.subject || !formData.body}
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  {id ? 'Update' : 'Create'} Template
                </>
              )}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Template identification and categorization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[rgb(var(--app-text-primary))] block mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Welcome New Employee"
                    className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--app-surface-muted),0.5)] border border-[rgba(var(--app-border))] text-sm text-[rgb(var(--app-text-primary))]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[rgb(var(--app-text-primary))] block mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--app-surface-muted),0.5)] border border-[rgba(var(--app-border))] text-sm text-[rgb(var(--app-text-primary))]"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-[rgb(var(--app-text-primary))] block mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this template's purpose"
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--app-surface-muted),0.5)] border border-[rgba(var(--app-border))] text-sm text-[rgb(var(--app-text-primary))]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Content */}
          <Card>
            <CardHeader>
              <CardTitle>Email Content</CardTitle>
              <CardDescription>Subject and body with variable support (use {'{{'} variableName {'}}'})</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[rgb(var(--app-text-primary))] block mb-2">
                    Subject Line *
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Welcome to {{companyName}}, {{firstName}}!"
                    className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--app-surface-muted),0.5)] border border-[rgba(var(--app-border))] text-sm text-[rgb(var(--app-text-primary))]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[rgb(var(--app-text-primary))] block mb-2">
                    Plain Text Body *
                  </label>
                  <textarea
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    placeholder="Hi {{firstName}},&#10;&#10;Welcome to {{companyName}}!&#10;&#10;Your employee ID is {{employeeId}}.&#10;&#10;Best regards,&#10;{{senderName}}"
                    rows={12}
                    className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--app-surface-muted),0.5)] border border-[rgba(var(--app-border))] text-sm text-[rgb(var(--app-text-primary))] font-mono"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[rgb(var(--app-text-primary))] block mb-2">
                    HTML Body (Optional)
                  </label>
                  <textarea
                    value={formData.bodyHtml}
                    onChange={(e) => setFormData({ ...formData, bodyHtml: e.target.value })}
                    placeholder="<h1>Welcome {{firstName}}!</h1><p>Your employee ID is <strong>{{employeeId}}</strong>.</p>"
                    rows={8}
                    className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--app-surface-muted),0.5)] border border-[rgba(var(--app-border))] text-sm text-[rgb(var(--app-text-primary))] font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>Sender and reply configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[rgb(var(--app-text-primary))] block mb-2">
                    From Name
                  </label>
                  <input
                    type="text"
                    value={formData.fromName}
                    onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                    placeholder="HR Team"
                    className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--app-surface-muted),0.5)] border border-[rgba(var(--app-border))] text-sm text-[rgb(var(--app-text-primary))]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[rgb(var(--app-text-primary))] block mb-2">
                    From Email
                  </label>
                  <input
                    type="email"
                    value={formData.fromEmail}
                    onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                    placeholder="hr@company.com"
                    className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--app-surface-muted),0.5)] border border-[rgba(var(--app-border))] text-sm text-[rgb(var(--app-text-primary))]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-[rgb(var(--app-text-primary))] block mb-2">
                    Reply-To Email
                  </label>
                  <input
                    type="email"
                    value={formData.replyTo}
                    onChange={(e) => setFormData({ ...formData, replyTo: e.target.value })}
                    placeholder="no-reply@company.com"
                    className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--app-surface-muted),0.5)] border border-[rgba(var(--app-border))] text-sm text-[rgb(var(--app-text-primary))]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Variables */}
          <Card>
            <CardHeader>
              <CardTitle>Available Variables</CardTitle>
              <CardDescription>Use these in subject and body</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.keys(variableValues).length > 0 ? (
                  Object.keys(variableValues).map(varName => (
                    <div key={varName} className="space-y-1">
                      <label className="text-xs font-medium text-muted block">
                        {'{{'}{varName}{'}}'}
                      </label>
                      <input
                        type="text"
                        value={variableValues[varName]}
                        onChange={(e) => setVariableValues({ ...variableValues, [varName]: e.target.value })}
                        placeholder={`Enter ${varName}...`}
                        className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--app-surface-muted),0.5)] border border-[rgba(var(--app-border))] text-sm text-[rgb(var(--app-text-primary))]"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted">
                    Add variables to your template using the {'{{'} variableName {'}}'} syntax
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Test Email */}
          {id && (
            <Card>
              <CardHeader>
                <CardTitle>Send Test Email</CardTitle>
                <CardDescription>Test with current variable values</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@example.com"
                    className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--app-surface-muted),0.5)] border border-[rgba(var(--app-border))] text-sm text-[rgb(var(--app-text-primary))]"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSendTest}
                    disabled={!testEmail || sendingTest}
                    className="w-full"
                  >
                    {sendingTest ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={14} />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={14} className="mr-2" />
                        Send Test
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle>Options</CardTitle>
            </CardHeader>
            <CardContent>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-[rgb(var(--app-text-primary))]">
                  Set as default template for this category
                </span>
              </label>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[rgba(var(--app-surface-elevated),0.98)] border border-[rgba(var(--app-border))] rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-[rgba(var(--app-border))] flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">
                Email Preview
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 rounded-lg hover:bg-[rgba(var(--app-surface-muted),0.5)] transition-colors"
              >
                <ArrowLeft size={18} className="text-muted" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div>
                <label className="text-xs font-medium text-muted block mb-1">Subject</label>
                <p className="text-sm text-[rgb(var(--app-text-primary))] font-semibold">
                  {previewData.subject}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted block mb-1">Plain Text Body</label>
                <div className="bg-[rgba(var(--app-surface-muted),0.5)] p-4 rounded-lg">
                  <pre className="text-sm text-[rgb(var(--app-text-primary))] whitespace-pre-wrap font-mono">
                    {previewData.body}
                  </pre>
                </div>
              </div>
              {previewData.bodyHtml && (
                <div>
                  <label className="text-xs font-medium text-muted block mb-1">HTML Preview</label>
                  <div className="bg-white p-4 rounded-lg border border-[rgba(var(--app-border))]">
                    <div dangerouslySetInnerHTML={{ __html: previewData.bodyHtml }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
