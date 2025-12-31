import api from './api';

export interface Webhook {
  _id: string;
  organizationId: string;
  name: string;
  url: string;
  secret: string;
  events: string[];
  status: 'active' | 'inactive' | 'suspended';
  headers?: Record<string, string>;
  retryPolicy: {
    enabled: boolean;
    maxAttempts: number;
    backoffMultiplier: number;
    initialRetryDelayMs: number;
  };
  deliveryStats: {
    totalAttempts: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    lastDeliveryStatus?: string;
    lastDeliveryAt?: string;
    lastErrorAt?: string;
    lastErrorMessage?: string;
  };
  recentDeliveries: WebhookDelivery[];
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

export interface WebhookDelivery {
  _id: string;
  status: 'pending' | 'success' | 'failed' | 'retrying';
  httpStatus?: number;
  responseTime?: number;
  requestBody: any;
  responseBody?: any;
  errorMessage?: string;
  attemptNumber: number;
  nextRetryAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWebhookData {
  name: string;
  url: string;
  events: string[];
  headers?: Record<string, string>;
  retryPolicy?: {
    enabled?: boolean;
    maxAttempts?: number;
    backoffMultiplier?: number;
    initialRetryDelayMs?: number;
  };
}

export interface WebhookEvent {
  value: string;
  label: string;
  category: string;
}

export interface WebhookTestResult {
  success: boolean;
  httpStatus?: number;
  responseTime: number;
  message: string;
  error?: string;
}

class WebhookService {
  /**
   * Get all webhooks
   * GET /api/v1/webhooks
   */
  async getWebhooks(params?: {
    status?: 'active' | 'inactive' | 'suspended';
    event?: string;
  }): Promise<Webhook[]> {
    const response = await api.get('/v1/webhooks', { params });
    return response.data.data.webhooks;
  }

  /**
   * Get single webhook
   * GET /api/v1/webhooks/:id
   */
  async getWebhook(id: string): Promise<Webhook> {
    const response = await api.get(`/v1/webhooks/${id}`);
    return response.data.data.webhook;
  }

  /**
   * Create webhook
   * POST /api/v1/webhooks
   */
  async createWebhook(data: CreateWebhookData): Promise<Webhook> {
    const response = await api.post('/v1/webhooks', data);
    return response.data.data.webhook;
  }

  /**
   * Update webhook
   * PUT /api/v1/webhooks/:id
   */
  async updateWebhook(id: string, data: Partial<CreateWebhookData>): Promise<Webhook> {
    const response = await api.put(`/v1/webhooks/${id}`, data);
    return response.data.data.webhook;
  }

  /**
   * Delete webhook
   * DELETE /api/v1/webhooks/:id
   */
  async deleteWebhook(id: string): Promise<void> {
    await api.delete(`/v1/webhooks/${id}`);
  }

  /**
   * Test webhook endpoint
   * POST /api/v1/webhooks/:id/test
   */
  async testWebhook(id: string): Promise<WebhookTestResult> {
    const response = await api.post(`/v1/webhooks/${id}/test`);
    return response.data.data;
  }

  /**
   * Get webhook delivery logs
   * GET /api/v1/webhooks/:id/logs
   */
  async getWebhookLogs(
    id: string,
    params?: {
      limit?: number;
      status?: string;
    }
  ): Promise<{ logs: WebhookDelivery[]; count: number; stats: Webhook['deliveryStats'] }> {
    const response = await api.get(`/v1/webhooks/${id}/logs`, { params });
    return response.data.data;
  }

  /**
   * Regenerate webhook secret
   * POST /api/v1/webhooks/:id/regenerate-secret
   */
  async regenerateSecret(id: string): Promise<Webhook> {
    const response = await api.post(`/v1/webhooks/${id}/regenerate-secret`);
    return response.data.data.webhook;
  }

  /**
   * Get available webhook events
   * GET /api/v1/webhooks/events
   */
  async getAvailableEvents(): Promise<WebhookEvent[]> {
    const response = await api.get('/v1/webhooks/events');
    return response.data.data.events;
  }

  /**
   * Helper: Get status color
   */
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      active: 'text-green-400',
      inactive: 'text-gray-400',
      suspended: 'text-red-400',
    };
    return colors[status] || 'text-gray-400';
  }

  /**
   * Helper: Get status badge background
   */
  getStatusBadge(status: string): string {
    const badges: Record<string, string> = {
      active: 'bg-green-500/20 text-green-400',
      inactive: 'bg-gray-500/20 text-gray-400',
      suspended: 'bg-red-500/20 text-red-400',
    };
    return badges[status] || 'bg-gray-500/20 text-gray-400';
  }

  /**
   * Helper: Get delivery status color
   */
  getDeliveryStatusColor(status: string): string {
    const colors: Record<string, string> = {
      success: 'text-green-400',
      failed: 'text-red-400',
      pending: 'text-gray-400',
      retrying: 'text-orange-400',
    };
    return colors[status] || 'text-gray-400';
  }

  /**
   * Helper: Get delivery status badge
   */
  getDeliveryStatusBadge(status: string): string {
    const badges: Record<string, string> = {
      success: 'bg-green-500/20 text-green-400',
      failed: 'bg-red-500/20 text-red-400',
      pending: 'bg-gray-500/20 text-gray-400',
      retrying: 'bg-orange-500/20 text-orange-400',
    };
    return badges[status] || 'bg-gray-500/20 text-gray-400';
  }

  /**
   * Helper: Format response time
   */
  formatResponseTime(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  /**
   * Helper: Calculate success rate
   */
  calculateSuccessRate(stats: Webhook['deliveryStats']): number {
    const total = stats.totalAttempts;
    if (total === 0) return 0;
    return Math.round((stats.successfulDeliveries / total) * 100);
  }

  /**
   * Helper: Group events by category
   */
  groupEventsByCategory(events: WebhookEvent[]): Record<string, WebhookEvent[]> {
    return events.reduce((acc, event) => {
      if (!acc[event.category]) {
        acc[event.category] = [];
      }
      acc[event.category].push(event);
      return acc;
    }, {} as Record<string, WebhookEvent[]>);
  }
}

export default new WebhookService();
