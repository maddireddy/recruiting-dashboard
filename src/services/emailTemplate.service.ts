import api from './api';

export interface EmailTemplate {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  organizationId: string;
  category: string;
  subject: string;
  body: string;
  bodyHtml?: string;
  fromName?: string;
  fromEmail?: string;
  replyTo?: string;
  variables: Array<{
    name: string;
    description?: string;
    example?: string;
    required?: boolean;
  }>;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  status: 'draft' | 'active' | 'archived';
  isDefault: boolean;
  usageCount: number;
  lastUsedAt?: string;
  version: number;
  previousVersions: any[];
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailTemplateData {
  name: string;
  slug?: string;
  description?: string;
  category: string;
  subject: string;
  body: string;
  bodyHtml?: string;
  fromName?: string;
  fromEmail?: string;
  replyTo?: string;
  variables?: Array<{
    name: string;
    description?: string;
    example?: string;
    required?: boolean;
  }>;
  isDefault?: boolean;
}

class EmailTemplateService {
  /**
   * Get all email templates
   * GET /api/v1/email-templates
   */
  async getTemplates(params?: {
    status?: 'draft' | 'active' | 'archived';
    category?: string;
  }): Promise<EmailTemplate[]> {
    const response = await api.get('/v1/email-templates', { params });
    return response.data.data.templates;
  }

  /**
   * Get single email template
   * GET /api/v1/email-templates/:id
   */
  async getTemplate(id: string): Promise<EmailTemplate> {
    const response = await api.get(`/v1/email-templates/${id}`);
    return response.data.data.template;
  }

  /**
   * Create email template
   * POST /api/v1/email-templates
   */
  async createTemplate(data: CreateEmailTemplateData): Promise<EmailTemplate> {
    const response = await api.post('/v1/email-templates', data);
    return response.data.data.template;
  }

  /**
   * Update email template
   * PUT /api/v1/email-templates/:id
   */
  async updateTemplate(id: string, data: Partial<CreateEmailTemplateData>): Promise<EmailTemplate> {
    const response = await api.put(`/v1/email-templates/${id}`, data);
    return response.data.data.template;
  }

  /**
   * Delete email template
   * DELETE /api/v1/email-templates/:id
   */
  async deleteTemplate(id: string): Promise<void> {
    await api.delete(`/v1/email-templates/${id}`);
  }

  /**
   * Preview email template with variables
   * POST /api/v1/email-templates/:id/preview
   */
  async previewTemplate(
    id: string,
    variables: Record<string, string>
  ): Promise<{ subject: string; body: string; bodyHtml: string }> {
    const response = await api.post(`/v1/email-templates/${id}/preview`, { variables });
    return response.data.data.rendered;
  }

  /**
   * Send test email
   * POST /api/v1/email-templates/:id/send-test
   */
  async sendTestEmail(
    id: string,
    testEmail: string,
    variables?: Record<string, string>
  ): Promise<void> {
    await api.post(`/v1/email-templates/${id}/send-test`, {
      testEmail,
      variables,
    });
  }

  /**
   * Activate/publish email template
   * POST /api/v1/email-templates/:id/activate
   */
  async activateTemplate(id: string): Promise<EmailTemplate> {
    const response = await api.post(`/v1/email-templates/${id}/activate`);
    return response.data.data.template;
  }

  /**
   * Get template usage statistics
   * GET /api/v1/email-templates/:id/stats
   */
  async getTemplateStats(id: string): Promise<{
    usageCount: number;
    lastUsedAt?: string;
    version: number;
    versionHistory: number;
    status: string;
  }> {
    const response = await api.get(`/v1/email-templates/${id}/stats`);
    return response.data.data.stats;
  }

  /**
   * Helper: Get category display name
   */
  getCategoryName(category: string): string {
    const categories: Record<string, string> = {
      employee_welcome: 'Employee Welcome',
      employee_offboarding: 'Employee Offboarding',
      candidate_application_received: 'Application Received',
      interview_invitation: 'Interview Invitation',
      interview_reminder: 'Interview Reminder',
      interview_feedback_request: 'Feedback Request',
      offer_letter: 'Offer Letter',
      rejection: 'Rejection',
      password_reset: 'Password Reset',
      email_verification: 'Email Verification',
      notification_digest: 'Notification Digest',
      custom: 'Custom',
    };
    return categories[category] || category;
  }

  /**
   * Helper: Get category icon
   */
  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      employee_welcome: '👋',
      employee_offboarding: '👋',
      candidate_application_received: '📝',
      interview_invitation: '📅',
      interview_reminder: '⏰',
      interview_feedback_request: '💭',
      offer_letter: '💼',
      rejection: '📧',
      password_reset: '🔒',
      email_verification: '✉️',
      notification_digest: '📬',
      custom: '✨',
    };
    return icons[category] || '📧';
  }

  /**
   * Helper: Extract variables from template body
   */
  extractVariables(body: string): string[] {
    const regex = /{{(\w+)}}/g;
    const variables: string[] = [];
    let match;

    while ((match = regex.exec(body)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables;
  }

  /**
   * Helper: Get status color
   */
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      draft: 'text-gray-400',
      active: 'text-green-400',
      archived: 'text-orange-400',
    };
    return colors[status] || 'text-gray-400';
  }

  /**
   * Helper: Get status badge background
   */
  getStatusBadge(status: string): string {
    const badges: Record<string, string> = {
      draft: 'bg-gray-500/20 text-gray-400',
      active: 'bg-green-500/20 text-green-400',
      archived: 'bg-orange-500/20 text-orange-400',
    };
    return badges[status] || 'bg-gray-500/20 text-gray-400';
  }
}

export default new EmailTemplateService();
