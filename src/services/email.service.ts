import api from './api';
import type { EmailTemplate, EmailLog, EmailConfig } from '../types/email';

export const emailService = {
  // Templates
  getAllTemplates: () => api.get<EmailTemplate[]>('/emails/templates'),
  getTemplateById: (id: string) => api.get<EmailTemplate>(`/emails/templates/${id}`),
  createTemplate: (template: Partial<EmailTemplate>) => api.post<EmailTemplate>('/emails/templates', template),
  updateTemplate: (id: string, template: Partial<EmailTemplate>) => api.put<EmailTemplate>(`/emails/templates/${id}`, template),
  deleteTemplate: (id: string) => api.delete(`/emails/templates/${id}`),
  
  // Send Email
  sendEmail: (to: string, subject: string, body: string) => 
    api.post('/emails/send', { to, subject, body }),
  
  sendTemplateEmail: (to: string, templateName: string, variables: Record<string, string>) => 
    api.post('/emails/send-template', { to, templateName, variables }),
  
  // Logs
  getEmailLogs: (page = 0, size = 20) => 
    api.get<{ content: EmailLog[] }>(`/emails/logs?page=${page}&size=${size}`),
  
  getEmailStats: () => 
    api.get<{ sent: number; failed: number; pending: number }>('/emails/stats'),
  
  // Config
  getEmailConfig: () => api.get<EmailConfig>('/emails/config'),
  updateEmailConfig: (config: Partial<EmailConfig>) => api.put<EmailConfig>('/emails/config', config),
};
