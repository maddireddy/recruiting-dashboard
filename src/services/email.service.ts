import api from './api';
import type { EmailTemplate, EmailLog, EmailConfig } from '../types/email';

export const emailService = {
  // Templates
  getAllTemplates: async () => (await api.get<EmailTemplate[]>('/emails/templates')).data,
  getTemplateById: async (id: string) => (await api.get<EmailTemplate>(`/emails/templates/${id}`)).data,
  createTemplate: async (template: Partial<EmailTemplate>) => (await api.post<EmailTemplate>('/emails/templates', template)).data,
  updateTemplate: async (id: string, template: Partial<EmailTemplate>) => (await api.put<EmailTemplate>(`/emails/templates/${id}`, template)).data,
  deleteTemplate: async (id: string) => {
    await api.delete(`/emails/templates/${id}`);
    return id;
  },
  
  // Send Email
  sendEmail: async (to: string, subject: string, body: string) => 
    (await api.post('/emails/send', { to, subject, body })).data,
  
  sendTemplateEmail: async (to: string, templateName: string, variables: Record<string, string>) => 
    (await api.post('/emails/send-template', { to, templateName, variables })).data,
  
  // Logs
  getEmailLogs: async (page = 0, size = 20) => 
    (await api.get<{ content: EmailLog[] }>(`/emails/logs?page=${page}&size=${size}`)).data.content ?? [],
  
  getEmailStats: async () => 
    (await api.get<{ sent: number; failed: number; pending: number }>('/emails/stats')).data,
  
  // Config
  getEmailConfig: async () => (await api.get<EmailConfig>('/emails/config')).data,
  updateEmailConfig: async (config: Partial<EmailConfig>) => (await api.put<EmailConfig>('/emails/config', config)).data,
};
