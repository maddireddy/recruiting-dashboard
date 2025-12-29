import { useState, useMemo } from 'react';
import { Bell, CheckCircle, Calendar, UserPlus, Briefcase, Settings, Mail, Trash2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';

type NotificationType = 'APPLICATION' | 'INTERVIEW' | 'OFFER' | 'SYSTEM' | 'MENTION';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

const NOTIFICATION_ICONS: Record<NotificationType, React.ReactElement> = {
  APPLICATION: <Briefcase size={18} className="text-blue-400" />,
  INTERVIEW: <Calendar size={18} className="text-purple-400" />,
  OFFER: <CheckCircle size={18} className="text-green-400" />,
  SYSTEM: <Bell size={18} className="text-amber-400" />,
  MENTION: <UserPlus size={18} className="text-pink-400" />,
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'APPLICATION',
      title: 'New Application Received',
      message: 'Jane Smith applied for Senior React Developer position',
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      actionUrl: '/candidates/123',
    },
    {
      id: '2',
      type: 'INTERVIEW',
      title: 'Interview Scheduled',
      message: 'Interview with John Doe scheduled for tomorrow at 2:00 PM',
      read: false,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      actionUrl: '/interviews/456',
    },
    {
      id: '3',
      type: 'OFFER',
      title: 'Offer Accepted',
      message: 'Sarah Johnson accepted the offer for Product Manager role',
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      actionUrl: '/offers/789',
    },
  ]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => filter === 'all' || !n.read);
  }, [notifications, filter]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getTimeAgo = (dateString: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Notifications"
        subtitle="Stay updated with all activity across your recruiting pipeline"
        actions={
          <Button variant="subtle" size="md" onClick={() => window.location.href = '/notifications/settings'}>
            <Settings size={16} />
            <span className="ml-2">Preferences</span>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15">
              <Bell className="text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Total</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">{notifications.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15">
              <Mail className="text-amber-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Unread</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">{unreadCount}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/15">
              <CheckCircle className="text-green-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Read</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">{notifications.length - unreadCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                filter === 'all'
                  ? 'bg-[rgb(var(--app-primary))] text-white'
                  : 'bg-[rgb(var(--app-surface-muted))] text-muted hover:text-[rgb(var(--app-text-primary))]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                filter === 'unread'
                  ? 'bg-[rgb(var(--app-primary))] text-white'
                  : 'bg-[rgb(var(--app-surface-muted))] text-muted hover:text-[rgb(var(--app-text-primary))]'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
          {unreadCount > 0 && (
            <Button variant="subtle" size="sm" onClick={markAllAsRead}>
              <CheckCircle size={16} />
              <span className="ml-2">Mark all as read</span>
            </Button>
          )}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-[rgba(var(--app-border-subtle))] text-muted">
              <Bell size={28} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No notifications</h3>
              <p className="mt-1 text-sm text-muted">You're all caught up! Check back later for updates.</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`group flex items-start gap-4 rounded-lg border p-4 transition ${
                notification.read
                  ? 'border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface))]'
                  : 'border-indigo-400/30 bg-indigo-500/5'
              }`}
            >
              <div className="flex-shrink-0">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  notification.read ? 'bg-[rgb(var(--app-surface-muted))]' : 'bg-indigo-500/15'
                }`}>
                  {NOTIFICATION_ICONS[notification.type]}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold ${notification.read ? 'text-[rgb(var(--app-text-primary))]' : 'text-[rgb(var(--app-text-primary))]'}`}>
                      {notification.title}
                    </h4>
                    <p className="mt-1 text-sm text-muted">{notification.message}</p>
                    <p className="mt-2 text-xs text-muted">{getTimeAgo(notification.createdAt)}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="rounded-lg border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] p-2 text-green-400 transition hover:border-green-400/50"
                        title="Mark as read"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="rounded-lg border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] p-2 text-red-400 transition hover:border-red-400/50"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {notification.actionUrl && (
                  <a
                    href={notification.actionUrl}
                    className="mt-3 inline-flex items-center text-sm font-medium text-indigo-400 hover:text-indigo-300"
                  >
                    View Details →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
