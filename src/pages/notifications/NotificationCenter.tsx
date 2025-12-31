import { useState, useEffect } from 'react';
import { Bell, Check, Archive, Trash2, Filter, Loader2 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/card';
import notificationService, { Notification } from '../../services/notification.service';
import { useNavigate } from 'react-router-dom';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
  }, [selectedFilter, selectedType, page]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 20,
      };

      if (selectedFilter === 'unread') params.unreadOnly = true;
      if (selectedFilter === 'read') params.status = 'read';
      if (selectedType !== 'all') params.type = selectedType;

      const data = await notificationService.getNotifications(params);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, status: 'read' as const } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'read' as const })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await notificationService.archiveNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      const notification = notifications.find((n) => n._id === id);
      if (notification?.status === 'unread') {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to archive notification:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      const notification = notifications.find((n) => n._id === id);
      if (notification?.status === 'unread') {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.status === 'unread') {
      handleMarkAsRead(notification._id);
    }

    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const notificationTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'employee_created', label: 'Employee' },
    { value: 'department_created', label: 'Department' },
    { value: 'candidate_applied', label: 'Candidate' },
    { value: 'interview_scheduled', label: 'Interview' },
    { value: 'offer_sent', label: 'Offer' },
    { value: 'workflow_assigned', label: 'Workflow' },
    { value: 'system', label: 'System' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
        actions={
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="subtle" size="sm" onClick={handleMarkAllAsRead}>
                <Check size={16} />
                Mark All Read
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/notifications/preferences')}
            >
              Preferences
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Status Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-[rgba(var(--app-surface-muted),0.5)] text-muted hover:text-[rgb(var(--app-text-primary))]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedFilter('unread')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === 'unread'
                    ? 'bg-blue-500 text-white'
                    : 'bg-[rgba(var(--app-surface-muted),0.5)] text-muted hover:text-[rgb(var(--app-text-primary))]'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setSelectedFilter('read')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === 'read'
                    ? 'bg-blue-500 text-white'
                    : 'bg-[rgba(var(--app-surface-muted),0.5)] text-muted hover:text-[rgb(var(--app-text-primary))]'
                }`}
              >
                Read
              </button>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-muted" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[rgba(var(--app-surface-muted),0.5)] border border-[rgba(var(--app-border))] text-sm text-[rgb(var(--app-text-primary))]"
              >
                {notificationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      {loading ? (
        <Card>
          <CardContent className="pt-6 flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <Bell size={64} className="text-muted mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-[rgb(var(--app-text-primary))] mb-2">
                No notifications
              </h3>
              <p className="text-sm text-muted text-center max-w-sm">
                {selectedFilter === 'unread'
                  ? "You're all caught up! No unread notifications."
                  : 'Notifications will appear here when actions require your attention.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification._id}
              className={`cursor-pointer hover:border-blue-500/50 transition-all ${
                notification.status === 'unread' ? 'border-l-4 border-l-blue-500' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-[rgba(var(--app-surface-muted),0.5)] flex items-center justify-center text-2xl">
                    {notification.icon || notificationService.getTypeIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-base font-semibold text-[rgb(var(--app-text-primary))]">
                            {notification.title}
                          </h4>
                          {notification.status === 'unread' && (
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted mb-2">{notification.message}</p>
                        <div className="flex items-center gap-3 text-xs text-muted">
                          <span>
                            {notificationService.formatRelativeTime(notification.createdAt)}
                          </span>
                          <span className={notificationService.getPriorityColor(notification.priority)}>
                            {notification.priority}
                          </span>
                          <span className="capitalize">{notification.type.replace(/_/g, ' ')}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {notification.actionText && notification.actionUrl && (
                          <Button variant="primary" size="sm">
                            {notification.actionText}
                          </Button>
                        )}
                        {notification.status === 'unread' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification._id);
                            }}
                            className="p-2 rounded-lg hover:bg-[rgba(var(--app-surface-muted),0.5)] transition-colors"
                            aria-label="Mark as read"
                          >
                            <Check size={16} className="text-blue-400" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchive(notification._id);
                          }}
                          className="p-2 rounded-lg hover:bg-[rgba(var(--app-surface-muted),0.5)] transition-colors"
                          aria-label="Archive"
                        >
                          <Archive size={16} className="text-muted" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification._id);
                          }}
                          className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                          aria-label="Delete"
                        >
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="subtle"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="subtle"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
