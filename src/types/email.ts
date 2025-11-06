export interface EmailTemplate {
  id?: string;
  tenantId?: string;
  templateName: string;
  subject: string;
  body: string;
  htmlBody?: string;
  templateType: 'INTERVIEW_INVITE' | 'STATUS_UPDATE' | 'OFFER_LETTER' | 'REMINDER' | 'WELCOME' | 'CUSTOM';
  variables?: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmailLog {
  id: string;
  tenantId: string;
  fromEmail: string;
  toEmail: string;
  ccEmail?: string[];
  bccEmail?: string[];
  subject: string;
  body: string;
  htmlBody?: string;
  templateUsed?: string;
  status: 'SENT' | 'FAILED' | 'PENDING' | 'QUEUED' | 'BOUNCED';
  provider?: string;
  messageId?: string;
  errorMessage?: string;
  sentAt?: string;
  createdAt: string;
}

export interface EmailConfig {
  id?: string;
  tenantId?: string;
  emailProvider: 'AWS_SES' | 'SENDGRID' | 'SYSTEM_DEFAULT';
  senderEmail: string;
  senderName: string;
  customDomain?: string;
  isDomainVerified?: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpUsername?: string;
  smtpPassword?: string;
  apiKey?: string;
  createdAt?: string;
  updatedAt?: string;
}
