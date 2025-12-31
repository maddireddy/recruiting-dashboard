import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/card';
import webhookService, { Webhook, WebhookDelivery } from '../../services/webhook.service';

export default function WebhookLogs() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [webhook, setWebhook] = useState<Webhook | null>(null);
  const [logs, setLogs] = useState<WebhookDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');

  useEffect(() => {
    if (id) {
      loadWebhook();
      loadLogs();
    }
  }, [id, filter]);

  const loadWebhook = async () => {
    if (!id) return;

    try {
      const data = await webhookService.getWebhook(id);
      setWebhook(data);
    } catch (error) {
      console.error('Failed to load webhook:', error);
    }
  };

  const loadLogs = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const params: any = { limit: 100 };
      if (filter !== 'all') params.status = filter;

      const data = await webhookService.getWebhookLogs(id, params);
      setLogs(data.logs);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'failed':
        return <XCircle size={16} className="text-red-400" />;
      case 'retrying':
        return <RefreshCw size={16} className="text-orange-400" />;
      default:
        return <Clock size={16} className="text-gray-400" />;
    }
  };

  if (!webhook) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Delivery Logs: ${webhook.name}`}
        subtitle="View webhook delivery history and debug failed attempts"
        actions={
          <div className="flex gap-2">
            <Button variant="subtle" onClick={() => navigate('/webhooks')}>
              <ArrowLeft size={16} className="mr-2" />
              Back to Webhooks
            </Button>
            <Button variant="secondary" onClick={loadLogs}>
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted mb-1">Total Attempts</p>
            <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">
              {webhook.deliveryStats.totalAttempts}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted mb-1">Successful</p>
            <p className="text-2xl font-semibold text-green-400">
              {webhook.deliveryStats.successfulDeliveries}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted mb-1">Failed</p>
            <p className="text-2xl font-semibold text-red-400">
              {webhook.deliveryStats.failedDeliveries}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted mb-1">Success Rate</p>
            <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">
              {webhookService.calculateSuccessRate(webhook.deliveryStats)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            {['all', 'success', 'failed'].map(status => (
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

      {/* Logs */}
      {loading ? (
        <Card>
          <CardContent className="pt-6 flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </CardContent>
        </Card>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <Clock size={64} className="text-muted mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-[rgb(var(--app-text-primary))] mb-2">
                No delivery logs
              </h3>
              <p className="text-sm text-muted text-center max-w-sm">
                {filter === 'all'
                  ? 'No deliveries have been attempted for this webhook yet.'
                  : `No ${filter} deliveries found.`}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {logs.map(log => (
            <Card key={log._id} className="overflow-hidden">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(log.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold capitalize ${webhookService.getDeliveryStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                          {log.httpStatus && (
                            <span className="text-xs text-muted">HTTP {log.httpStatus}</span>
                          )}
                        </div>
                        <p className="text-xs text-muted">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[rgb(var(--app-text-primary))]">
                        Attempt #{log.attemptNumber}
                      </p>
                      {log.responseTime !== undefined && (
                        <p className="text-xs text-muted">
                          {webhookService.formatResponseTime(log.responseTime)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Error Message */}
                  {log.errorMessage && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-sm text-red-400">{log.errorMessage}</p>
                    </div>
                  )}

                  {/* Retry Info */}
                  {log.nextRetryAt && (
                    <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <p className="text-sm text-orange-400">
                        Next retry scheduled for: {new Date(log.nextRetryAt).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {/* Request/Response Details */}
                  <details className="group">
                    <summary className="cursor-pointer text-sm text-blue-400 hover:text-blue-300 transition-colors">
                      View Request/Response Details
                    </summary>
                    <div className="mt-3 space-y-3">
                      {/* Request */}
                      <div>
                        <p className="text-xs font-semibold text-[rgb(var(--app-text-primary))] mb-2">
                          Request Payload
                        </p>
                        <pre className="p-3 rounded-lg bg-[rgba(var(--app-surface-muted),0.5)] text-xs overflow-x-auto">
                          {JSON.stringify(log.requestBody, null, 2)}
                        </pre>
                      </div>

                      {/* Response */}
                      {log.responseBody && (
                        <div>
                          <p className="text-xs font-semibold text-[rgb(var(--app-text-primary))] mb-2">
                            Response Body
                          </p>
                          <pre className="p-3 rounded-lg bg-[rgba(var(--app-surface-muted),0.5)] text-xs overflow-x-auto">
                            {typeof log.responseBody === 'string'
                              ? log.responseBody
                              : JSON.stringify(log.responseBody, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
