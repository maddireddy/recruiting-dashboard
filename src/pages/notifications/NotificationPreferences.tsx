import { useState, useEffect } from 'react';
import { Bell, Save, Loader2, Mail, Smartphone, Monitor } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import notificationService, { NotificationPreferences as Preferences } from '../../services/notification.service';

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getPreferences();
      setPreferences(data);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      await notificationService.updatePreferences(preferences);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChannelToggle = (channel: keyof Preferences['channels']) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      channels: {
        ...preferences.channels,
        [channel]: !preferences.channels[channel],
      },
    });
  };

  const handleTypeToggle = (type: string, channel: 'inApp' | 'email') => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      types: {
        ...preferences.types,
        [type]: {
          ...preferences.types[type],
          [channel]: !preferences.types[type]?.[channel],
        },
      },
    });
  };

  const notificationTypes = [
    { key: 'employee_created', label: 'New Employee', description: 'When an employee is added' },
    { key: 'employee_updated', label: 'Employee Updated', description: 'When employee info changes' },
    { key: 'department_created', label: 'New Department', description: 'When a department is created' },
    { key: 'candidate_applied', label: 'Candidate Applied', description: 'When a candidate submits an application' },
    { key: 'interview_scheduled', label: 'Interview Scheduled', description: 'When an interview is scheduled with you' },
    { key: 'interview_reminder', label: 'Interview Reminder', description: 'Reminder before your interviews' },
    { key: 'offer_sent', label: 'Offer Sent', description: 'When an offer is sent to a candidate' },
    { key: 'workflow_assigned', label: 'Workflow Assigned', description: 'When a workflow task is assigned to you' },
    { key: 'mention', label: 'Mentions', description: 'When someone mentions you' },
    { key: 'comment', label: 'Comments', description: 'When someone comments on your items' },
    { key: 'system', label: 'System Notifications', description: 'Important system updates' },
    { key: 'announcement', label: 'Announcements', description: 'Company announcements' },
  ];

  if (loading || !preferences) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Preferences"
        subtitle="Manage how and when you receive notifications"
        actions={
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Saving...
              </>
            ) : saved ? (
              <>
                <Save size={16} className="mr-2" />
                Saved!
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Save Changes
              </>
            )}
          </Button>
        }
      />

      {/* Global Channel Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 rounded-lg border border-[rgba(var(--app-border))] hover:border-blue-500/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Monitor size={20} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[rgb(var(--app-text-primary))]">
                    In-App Notifications
                  </p>
                  <p className="text-xs text-muted">
                    Show notifications in the notification center
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.channels.inApp}
                onChange={() => handleChannelToggle('inApp')}
                className="h-5 w-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-lg border border-[rgba(var(--app-border))] hover:border-blue-500/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Mail size={20} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[rgb(var(--app-text-primary))]">
                    Email Notifications
                  </p>
                  <p className="text-xs text-muted">
                    Receive notifications via email
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.channels.email}
                onChange={() => handleChannelToggle('email')}
                className="h-5 w-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-lg border border-[rgba(var(--app-border))] hover:border-blue-500/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Smartphone size={20} className="text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[rgb(var(--app-text-primary))]">
                    Push Notifications
                  </p>
                  <p className="text-xs text-muted">
                    Browser push notifications (coming soon)
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.channels.push}
                onChange={() => handleChannelToggle('push')}
                className="h-5 w-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                disabled
              />
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Email Digest */}
      <Card>
        <CardHeader>
          <CardTitle>Email Digest Frequency</CardTitle>
          <CardDescription>
            How often to send email notification digests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[
              { value: 'realtime', label: 'Real-time' },
              { value: 'hourly', label: 'Hourly' },
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  setPreferences({
                    ...preferences,
                    digestFrequency: option.value as any,
                  })
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  preferences.digestFrequency === option.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-[rgba(var(--app-surface-muted),0.5)] text-muted hover:text-[rgb(var(--app-text-primary))]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Quiet Hours</CardTitle>
          <CardDescription>
            Pause notifications during specific hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={preferences.quietHours.enabled}
                onChange={() =>
                  setPreferences({
                    ...preferences,
                    quietHours: {
                      ...preferences.quietHours,
                      enabled: !preferences.quietHours.enabled,
                    },
                  })
                }
                className="h-5 w-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-[rgb(var(--app-text-primary))]">
                Enable quiet hours
              </span>
            </label>

            {preferences.quietHours.enabled && (
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-xs text-muted block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={preferences.quietHours.start}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        quietHours: {
                          ...preferences.quietHours,
                          start: e.target.value,
                        },
                      })
                    }
                    className="px-3 py-2 rounded-lg bg-[rgba(var(--app-surface-muted),0.5)] border border-[rgba(var(--app-border))] text-sm text-[rgb(var(--app-text-primary))]"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">End Time</label>
                  <input
                    type="time"
                    value={preferences.quietHours.end}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        quietHours: {
                          ...preferences.quietHours,
                          end: e.target.value,
                        },
                      })
                    }
                    className="px-3 py-2 rounded-lg bg-[rgba(var(--app-surface-muted),0.5)] border border-[rgba(var(--app-border))] text-sm text-[rgb(var(--app-text-primary))]"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Per-Type Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Customize notifications for each type of event
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-4 pb-3 border-b border-[rgba(var(--app-border))] text-xs font-semibold text-muted">
              <div className="col-span-6">Type</div>
              <div className="col-span-3 text-center">In-App</div>
              <div className="col-span-3 text-center">Email</div>
            </div>
            {notificationTypes.map((type) => (
              <div key={type.key} className="grid grid-cols-12 gap-4 items-center py-2">
                <div className="col-span-6">
                  <p className="text-sm font-medium text-[rgb(var(--app-text-primary))]">
                    {type.label}
                  </p>
                  <p className="text-xs text-muted">{type.description}</p>
                </div>
                <div className="col-span-3 flex justify-center">
                  <input
                    type="checkbox"
                    checked={preferences.types[type.key]?.inApp ?? true}
                    onChange={() => handleTypeToggle(type.key, 'inApp')}
                    className="h-5 w-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-3 flex justify-center">
                  <input
                    type="checkbox"
                    checked={preferences.types[type.key]?.email ?? false}
                    onChange={() => handleTypeToggle(type.key, 'email')}
                    className="h-5 w-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="lg"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin mr-2" size={18} />
              Saving Changes...
            </>
          ) : saved ? (
            <>
              <Save size={18} className="mr-2" />
              Changes Saved!
            </>
          ) : (
            <>
              <Save size={18} className="mr-2" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
