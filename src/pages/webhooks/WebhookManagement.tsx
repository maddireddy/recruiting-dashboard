import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Webhook as WebhookIcon, Plus, Eye, Edit, Trash2, PlayCircle, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/card';
import webhookService, { Webhook } from '../../services/webhook.service';

export default function WebhookManagement() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadWebhooks();
  }, [filter]);

  const loadWebhooks = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filter !== 'all') params.status = filter;

      const data = await webhookService.getWebhooks(params);
      setWebhooks(data);
    } catch (error) {
      console.error('Failed to load webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    try {
      await webhookService.deleteWebhook(id);
      setWebhooks(prev => prev.filter(w => w._id !== id));
    } catch (error) {
      console.error('Failed to delete webhook:', error);
    }
  };

  const handleTest = async (id: string) => {
    try {
      const result = await webhookService.testWebhook(id);
      if (result.success) {
        alert(`Test successful! Response time: ${webhookService.formatResponseTime(result.responseTime)}`);
      } else {
        alert(`Test failed: ${result.error || result.message}`);
      }
      loadWebhooks(); // Refresh to show new delivery log
    } catch (error: any) {
      alert(`Test failed: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Webhooks"
        subtitle="Configure webhooks to receive real-time notifications about events"
        actions={
          <Button
            variant="primary"
            onClick={() => navigate('/webhooks/new')}
          >
            <Plus size={16} className="mr-2" />
            Create Webhook
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <WebhookIcon size={24} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted">Total Webhooks</p>
                <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">
                  {webhooks.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 size={24} className="text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted">Active</p>
                <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">
                  {webhooks.filter(w => w.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <AlertCircle size={24} className="text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted">Avg Success Rate</p>
                <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">
                  {webhooks.length > 0
                    ? Math.round(
                        webhooks.reduce((acc, w) => acc + webhookService.calculateSuccessRate(w.deliveryStats), 0) /
                          webhooks.length
                      )
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            {['all', 'active', 'inactive'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  filter === status
                    ? 'bg-blue-500 text-white'
                    : 'bg-[rgba(var(--app-surface-muted),0.5)] text-muted hover:text-[rgb(var(--app-text-primary))]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Webhooks List */}
      {loading ? (
        <Card>
          <CardContent className="pt-6 flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </CardContent>
        </Card>
      ) : webhooks.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <WebhookIcon size={64} className="text-muted mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-[rgb(var(--app-text-primary))] mb-2">
                No webhooks configured
              </h3>
              <p className="text-sm text-muted text-center max-w-sm mb-4">
                Create your first webhook to receive real-time notifications about events in your organization.
              </p>
              <Button variant="primary" onClick={() => navigate('/webhooks/new')}>
                <Plus size={16} className="mr-2" />
                Create Webhook
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {webhooks.map(webhook => (
            <Card key={webhook._id} className="hover:border-blue-500/50 transition-all">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">
                          {webhook.name}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${webhookService.getStatusBadge(webhook.status)}`}>
                          {webhook.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted font-mono">{webhook.url}</p>
                    </div>
                  </div>

                  {/* Events */}
                  <div className="flex flex-wrap gap-2">
                    {webhook.events.slice(0, 5).map(event => (
                      <span
                        key={event}
                        className="px-2 py-1 rounded text-xs font-medium bg-[rgba(var(--app-surface-muted),0.5)] text-muted"
                      >
                        {event}
                      </span>
                    ))}
                    {webhook.events.length > 5 && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-[rgba(var(--app-surface-muted),0.5)] text-muted">
                        +{webhook.events.length - 5} more
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-[rgba(var(--app-surface-muted),0.3)]">
                    <div>
                      <p className="text-xs text-muted mb-1">Total Deliveries</p>
                      <p className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">
                        {webhook.deliveryStats.totalAttempts}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted mb-1">Successful</p>
                      <p className="text-lg font-semibold text-green-400">
                        {webhook.deliveryStats.successfulDeliveries}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted mb-1">Failed</p>
                      <p className="text-lg font-semibold text-red-400">
                        {webhook.deliveryStats.failedDeliveries}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted mb-1">Success Rate</p>
                      <p className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">
                        {webhookService.calculateSuccessRate(webhook.deliveryStats)}%
                      </p>
                    </div>
                  </div>

                  {/* Last Delivery Status */}
                  {webhook.deliveryStats.lastDeliveryAt && (
                    <div className="flex items-center gap-2 text-sm">
                      {webhook.deliveryStats.lastDeliveryStatus === 'success' ? (
                        <CheckCircle2 size={16} className="text-green-400" />
                      ) : (
                        <XCircle size={16} className="text-red-400" />
                      )}
                      <span className="text-muted">
                        Last delivery:{' '}
                        <span className={webhookService.getDeliveryStatusColor(webhook.deliveryStats.lastDeliveryStatus || '')}>
                          {webhook.deliveryStats.lastDeliveryStatus}
                        </span>
                        {' '}at {new Date(webhook.deliveryStats.lastDeliveryAt).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[rgba(var(--app-border))]">
                    <button
                      onClick={() => navigate(`/webhooks/${webhook._id}`)}
                      className="flex-1 px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => navigate(`/webhooks/${webhook._id}/logs`)}
                      className="px-3 py-2 rounded-lg hover:bg-[rgba(var(--app-surface-muted),0.5)] transition-colors text-sm font-medium flex items-center gap-2"
                      title="View Logs"
                    >
                      <Eye size={16} className="text-muted" />
                      Logs
                    </button>
                    <button
                      onClick={() => handleTest(webhook._id)}
                      className="px-3 py-2 rounded-lg hover:bg-green-500/20 transition-colors text-sm font-medium flex items-center gap-2"
                      title="Test Webhook"
                    >
                      <PlayCircle size={16} className="text-green-400" />
                      Test
                    </button>
                    <button
                      onClick={() => handleDelete(webhook._id)}
                      className="px-3 py-2 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium flex items-center gap-2"
                      title="Delete"
                    >
                      <Trash2 size={16} className="text-red-400" />
                      Delete
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
