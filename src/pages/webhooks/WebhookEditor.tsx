import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Copy, RefreshCw, Loader2 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import webhookService, { CreateWebhookData, WebhookEvent } from '../../services/webhook.service';

export default function WebhookEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [availableEvents, setAvailableEvents] = useState<WebhookEvent[]>([]);
  const [eventsByCategory, setEventsByCategory] = useState<Record<string, WebhookEvent[]>>({});
  const [showSecret, setShowSecret] = useState(false);
  const [secret, setSecret] = useState('');

  const [formData, setFormData] = useState<CreateWebhookData>({
    name: '',
    url: '',
    events: [],
    headers: {},
    retryPolicy: {
      enabled: true,
      maxAttempts: 3,
      backoffMultiplier: 2,
      initialRetryDelayMs: 1000,
    },
  });

  useEffect(() => {
    loadAvailableEvents();
    if (id) {
      loadWebhook();
    }
  }, [id]);

  useEffect(() => {
    if (availableEvents.length > 0) {
      setEventsByCategory(webhookService.groupEventsByCategory(availableEvents));
    }
  }, [availableEvents]);

  const loadAvailableEvents = async () => {
    try {
      const events = await webhookService.getAvailableEvents();
      setAvailableEvents(events);
    } catch (error) {
      console.error('Failed to load available events:', error);
    }
  };

  const loadWebhook = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const webhook = await webhookService.getWebhook(id);
      setFormData({
        name: webhook.name,
        url: webhook.url,
        events: webhook.events,
        headers: Object.fromEntries(webhook.headers || new Map()),
        retryPolicy: webhook.retryPolicy,
      });
      setSecret(webhook.secret);
    } catch (error) {
      console.error('Failed to load webhook:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (id) {
        await webhookService.updateWebhook(id, formData);
      } else {
        const created = await webhookService.createWebhook(formData);
        setSecret(created.secret);
        setShowSecret(true);
        alert('Webhook created! Please save the secret - it will not be shown again.');
      }

      if (id) {
        navigate('/webhooks');
      }
    } catch (error: any) {
      console.error('Failed to save webhook:', error);
      alert(error.response?.data?.message || 'Failed to save webhook');
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateSecret = async () => {
    if (!id || !confirm('Are you sure? This will invalidate the current secret.')) return;

    try {
      const updated = await webhookService.regenerateSecret(id);
      setSecret(updated.secret);
      setShowSecret(true);
      alert('Secret regenerated successfully!');
    } catch (error) {
      console.error('Failed to regenerate secret:', error);
    }
  };

  const handleToggleEvent = (eventValue: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(eventValue)
        ? prev.events.filter(e => e !== eventValue)
        : [...prev.events, eventValue],
    }));
  };

  const handleSelectAllInCategory = (category: string) => {
    const categoryEvents = eventsByCategory[category].map(e => e.value);
    const allSelected = categoryEvents.every(ev => formData.events.includes(ev));

    if (allSelected) {
      // Deselect all in category
      setFormData(prev => ({
        ...prev,
        events: prev.events.filter(e => !categoryEvents.includes(e)),
      }));
    } else {
      // Select all in category
      const newEvents = [...new Set([...formData.events, ...categoryEvents])];
      setFormData(prev => ({
        ...prev,
        events: newEvents,
      }));
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    alert('Secret copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={id ? 'Edit Webhook' : 'Create Webhook'}
        subtitle="Configure webhook to receive real-time event notifications"
        actions={
          <div className="flex gap-2">
            <Button variant="subtle" onClick={() => navigate('/webhooks')}>
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving || !formData.name || !formData.url || formData.events.length === 0}
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  {id ? 'Update' : 'Create'} Webhook
                </>
              )}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Webhook identification and endpoint</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[rgb(var(--app-text-primary))] block mb-2">
                    Webhook Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Slack Notifications"
                    className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--app-surface-muted),0.5)] border border-[rgba(var(--app-border))] text-sm text-[rgb(var(--app-text-primary))]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[rgb(var(--app-text-primary))] block mb-2">
                    Endpoint URL *
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://your-server.com/webhook"
                    className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--app-surface-muted),0.5)] border border-[rgba(var(--app-border))] text-sm text-[rgb(var(--app-text-primary))]"
                  />
                  <p className="text-xs text-muted mt-1">
                    Must be a valid HTTPS endpoint that can receive POST requests
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Events */}
          <Card>
            <CardHeader>
              <CardTitle>Event Subscriptions ({formData.events.length} selected)</CardTitle>
              <CardDescription>Choose which events trigger this webhook</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(eventsByCategory).map(([category, events]) => {
                  const allSelected = events.every(e => formData.events.includes(e.value));
                  const someSelected = events.some(e => formData.events.includes(e.value));

                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-[rgba(var(--app-surface-muted),0.3)]">
                        <h4 className="text-sm font-semibold text-[rgb(var(--app-text-primary))] capitalize">
                          {category}
                        </h4>
                        <button
                          onClick={() => handleSelectAllInCategory(category)}
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          {allSelected ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                        {events.map(event => (
                          <label
                            key={event.value}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[rgba(var(--app-surface-muted),0.3)] transition-colors cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.events.includes(event.value)}
                              onChange={() => handleToggleEvent(event.value)}
                              className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                            />
                            <span className="text-sm text-[rgb(var(--app-text-primary))]">
                              {event.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Retry Policy */}
          <Card>
            <CardHeader>
              <CardTitle>Retry Policy</CardTitle>
              <CardDescription>Configure automatic retry behavior for failed deliveries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.retryPolicy?.enabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        retryPolicy: { ...formData.retryPolicy!, enabled: e.target.checked },
                      })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-[rgb(var(--app-text-primary))]">
                    Enable automatic retries
                  </span>
                </label>

                {formData.retryPolicy?.enabled && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-[rgb(var(--app-text-primary))] block mb-2">
                        Max Retry Attempts
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.retryPolicy.maxAttempts}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            retryPolicy: {
                              ...formData.retryPolicy!,
                              maxAttempts: parseInt(e.target.value),
                            },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--app-surface-muted),0.5)] border border-[rgba(var(--app-border))] text-sm text-[rgb(var(--app-text-primary))]"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-[rgb(var(--app-text-primary))] block mb-2">
                        Initial Retry Delay (ms)
                      </label>
                      <input
                        type="number"
                        min="100"
                        step="100"
                        value={formData.retryPolicy.initialRetryDelayMs}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            retryPolicy: {
                              ...formData.retryPolicy!,
                              initialRetryDelayMs: parseInt(e.target.value),
                            },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--app-surface-muted),0.5)] border border-[rgba(var(--app-border))] text-sm text-[rgb(var(--app-text-primary))]"
                      />
                      <p className="text-xs text-muted mt-1">
                        Delay uses exponential backoff (1s → 2s → 4s...)
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Secret */}
          {(id || showSecret) && secret && (
            <Card>
              <CardHeader>
                <CardTitle>Webhook Secret</CardTitle>
                <CardDescription>Use this to verify webhook signatures</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-[rgba(var(--app-surface-muted),0.5)] font-mono text-xs break-all">
                    {secret}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={copySecret} className="flex-1">
                      <Copy size={14} className="mr-2" />
                      Copy
                    </Button>
                    {id && (
                      <Button variant="subtle" size="sm" onClick={handleRegenerateSecret}>
                        <RefreshCw size={14} className="mr-2" />
                        Regenerate
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted">
                    The secret is sent in the <code className="px-1 py-0.5 rounded bg-[rgba(var(--app-surface-muted),0.5)]">X-Webhook-Signature</code> header as an HMAC-SHA256 signature.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help */}
          <Card>
            <CardHeader>
              <CardTitle>Implementation Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted">
                <p>Your webhook endpoint should:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Accept POST requests</li>
                  <li>Return 2xx status code</li>
                  <li>Respond within 10 seconds</li>
                  <li>Verify the signature</li>
                </ul>
                <div className="mt-4 p-3 rounded-lg bg-[rgba(var(--app-surface-muted),0.3)]">
                  <p className="text-xs font-semibold text-[rgb(var(--app-text-primary))] mb-2">
                    Headers sent:
                  </p>
                  <ul className="text-xs space-y-1 font-mono">
                    <li>X-Webhook-Signature</li>
                    <li>X-Webhook-Event</li>
                    <li>X-Webhook-Delivery-ID</li>
                    <li>X-Webhook-Attempt</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
