export type SmsCampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';

export interface SmsCampaign {
  id: string;
  tenantId?: string;
  name: string;
  description?: string;
  message: string;
  recipientGroups?: string[];
  totalRecipients?: number;
  sentCount?: number;
  deliveredCount?: number;
  failedCount?: number;
  status: SmsCampaignStatus;
  scheduledAt?: string;
  sentAt?: string;
  createdBy?: string;
  createdAt?: string;
  lastModifiedAt?: string;
  cost?: number;
  currency?: string;
  provider?: string;
  metadata?: Record<string, any>;
  isArchived?: boolean;
}

export type SmsCommStatus = 'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered';
export type SmsDirection = 'outbound' | 'inbound';

export interface SmsCommunication {
  id: string;
  tenantId?: string;
  campaignId?: string;
  recipientPhone: string;
  message: string;
  status: SmsCommStatus;
  providerMessageId?: string;
  sentAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  failureReason?: string;
  cost?: number;
  currency?: string;
  provider?: string;
  segmentCount?: number;
  direction?: SmsDirection;
  recipientType?: string;
  recipientId?: string;
  createdBy?: string;
  createdAt?: string;
  isArchived?: boolean;
}
