import api from './api';

export interface Notification {
  _id: string;
  userId: string;
  organizationId: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  icon?: string;
  actionUrl?: string;
  actionText?: string;
  entityType?: string;
  entityId?: string;
  status: 'unread' | 'read' | 'archived';
  senderId?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  readAt?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  channels: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  types: {
    [key: string]: {
      inApp: boolean;
      email: boolean;
    };
  };
  digestFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface NotificationListResponse {
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class NotificationService {
  /**
   * Get all notifications
   * GET /api/v1/notifications
   */
  async getNotifications(params?: {
    status?: 'unread' | 'read' | 'archived';
    type?: string;
    priority?: string;
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<NotificationListResponse> {
    const response = await api.get('/v1/notifications', { params });
    return response.data.data;
  }

  /**
   * Get unread notification count
   * GET /api/v1/notifications/unread-count
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get('/v1/notifications/unread-count');
    return response.data.data.unreadCount;
  }

  /**
   * Mark notification as read
   * PUT /api/v1/notifications/:id/read
   */
  async markAsRead(id: string): Promise<Notification> {
    const response = await api.put(`/v1/notifications/${id}/read`);
    return response.data.data.notification;
  }

  /**
   * Mark all notifications as read
   * PUT /api/v1/notifications/read-all
   */
  async markAllAsRead(): Promise<{ modifiedCount: number }> {
    const response = await api.put('/v1/notifications/read-all');
    return response.data.data;
  }

  /**
   * Archive notification
   * PUT /api/v1/notifications/:id/archive
   */
  async archiveNotification(id: string): Promise<Notification> {
    const response = await api.put(`/v1/notifications/${id}/archive`);
    return response.data.data.notification;
  }

  /**
   * Delete notification
   * DELETE /api/v1/notifications/:id
   */
  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/v1/notifications/${id}`);
  }

  /**
   * Get notification preferences
   * GET /api/v1/notifications/preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    const response = await api.get('/v1/notifications/preferences');
    return response.data.data.preferences;
  }

  /**
   * Update notification preferences
   * PUT /api/v1/notifications/preferences
   */
  async updatePreferences(preferences: NotificationPreferences): Promise<NotificationPreferences> {
    const response = await api.put('/v1/notifications/preferences', preferences);
    return response.data.data.preferences;
  }

  /**
   * Create notification (admin/system)
   * POST /api/v1/notifications
   */
  async createNotification(data: {
    userId: string;
    type: string;
    priority?: string;
    title: string;
    message: string;
    icon?: string;
    actionUrl?: string;
    actionText?: string;
    entityType?: string;
    entityId?: string;
    metadata?: any;
  }): Promise<Notification> {
    const response = await api.post('/v1/notifications', data);
    return response.data.data.notification;
  }

  /**
   * Helper: Get icon for notification type
   */
  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      employee_created: '👤',
      employee_updated: '✏️',
      department_created: '🏢',
      candidate_applied: '📝',
      interview_scheduled: '📅',
      interview_reminder: '⏰',
      offer_sent: '💼',
      workflow_assigned: '📋',
      mention: '@',
      comment: '💬',
      system: '⚙️',
      announcement: '📢',
    };
    return icons[type] || '🔔';
  }

  /**
   * Helper: Get color for priority
   */
  getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      low: 'text-gray-400',
      medium: 'text-blue-400',
      high: 'text-orange-400',
      urgent: 'text-red-400',
    };
    return colors[priority] || 'text-gray-400';
  }

  /**
   * Helper: Format relative time
   */
  formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  }
}

export default new NotificationService();
