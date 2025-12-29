import { useState } from 'react';
import { Save, Building2, Mail, Palette, Key, Database, Shield } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

type SettingsTab = 'organization' | 'email' | 'branding' | 'integrations' | 'security' | 'data';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('organization');
  const [saving, setSaving] = useState(false);

  // Organization settings
  const [orgName, setOrgName] = useState('Acme Recruiting');
  const [orgWebsite, setOrgWebsite] = useState('https://acme.com');
  const [orgTimezone, setOrgTimezone] = useState('America/New_York');

  // Email settings
  const [emailFrom, setEmailFrom] = useState('noreply@acme.com');
  const [emailReplyTo, setEmailReplyTo] = useState('support@acme.com');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');

  // Branding settings
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [logoUrl, setLogoUrl] = useState('');

  // Integration settings
  const [slackWebhook, setSlackWebhook] = useState('');
  const [zoomApiKey, setZoomApiKey] = useState('');

  // Security settings
  const [requireMFA, setRequireMFA] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [passwordPolicy, setPasswordPolicy] = useState('strong');

  // Data settings
  const [dataRetention, setDataRetention] = useState('365');
  const [autoBackup, setAutoBackup] = useState(true);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'organization' as const, label: 'Organization', icon: Building2 },
    { id: 'email' as const, label: 'Email', icon: Mail },
    { id: 'branding' as const, label: 'Branding', icon: Palette },
    { id: 'integrations' as const, label: 'Integrations', icon: Key },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'data' as const, label: 'Data & Privacy', icon: Database },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="ATS Settings"
        subtitle="Configure your recruiting platform settings and preferences"
        actions={
          <Button variant="primary" size="md" onClick={handleSave} disabled={saving}>
            <Save size={16} />
            <span className="ml-2">{saving ? 'Saving...' : 'Save Changes'}</span>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar Navigation */}
        <nav className="space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                  isActive
                    ? 'bg-[rgb(var(--app-primary))] text-white'
                    : 'text-[rgb(var(--app-text-secondary))] hover:bg-[rgba(var(--app-surface-muted))] hover:text-[rgb(var(--app-text-primary))]'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Settings Content */}
        <div className="card">
          {activeTab === 'organization' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">Organization Settings</h2>
                <p className="mt-1 text-sm text-muted">Manage your organization profile and preferences</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))]">Organization Name</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="input mt-1 w-full"
                    placeholder="Enter organization name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))]">Website</label>
                  <input
                    type="url"
                    value={orgWebsite}
                    onChange={(e) => setOrgWebsite(e.target.value)}
                    className="input mt-1 w-full"
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))]">Timezone</label>
                  <select value={orgTimezone} onChange={(e) => setOrgTimezone(e.target.value)} className="input mt-1 w-full">
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">Email Configuration</h2>
                <p className="mt-1 text-sm text-muted">Configure email sending and SMTP settings</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))]">From Email</label>
                  <input
                    type="email"
                    value={emailFrom}
                    onChange={(e) => setEmailFrom(e.target.value)}
                    className="input mt-1 w-full"
                    placeholder="noreply@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))]">Reply-To Email</label>
                  <input
                    type="email"
                    value={emailReplyTo}
                    onChange={(e) => setEmailReplyTo(e.target.value)}
                    className="input mt-1 w-full"
                    placeholder="support@example.com"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))]">SMTP Host</label>
                    <input
                      type="text"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      className="input mt-1 w-full"
                      placeholder="smtp.example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))]">SMTP Port</label>
                    <input
                      type="text"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                      className="input mt-1 w-full"
                      placeholder="587"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">Branding & Appearance</h2>
                <p className="mt-1 text-sm text-muted">Customize your platform's look and feel</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))]">Primary Color</label>
                  <div className="mt-1 flex gap-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-10 w-20 rounded-lg border border-[rgba(var(--app-border-subtle))]"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="input flex-1"
                      placeholder="#6366f1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))]">Logo URL</label>
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="input mt-1 w-full"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">Integrations & APIs</h2>
                <p className="mt-1 text-sm text-muted">Connect third-party services and webhooks</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))]">Slack Webhook URL</label>
                  <input
                    type="url"
                    value={slackWebhook}
                    onChange={(e) => setSlackWebhook(e.target.value)}
                    className="input mt-1 w-full"
                    placeholder="https://hooks.slack.com/services/..."
                  />
                  <p className="mt-1 text-xs text-muted">Send notifications to Slack channels</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))]">Zoom API Key</label>
                  <input
                    type="password"
                    value={zoomApiKey}
                    onChange={(e) => setZoomApiKey(e.target.value)}
                    className="input mt-1 w-full"
                    placeholder="Enter Zoom API key"
                  />
                  <p className="mt-1 text-xs text-muted">Create and manage Zoom meetings automatically</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">Security Settings</h2>
                <p className="mt-1 text-sm text-muted">Manage authentication and access controls</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[rgb(var(--app-text-primary))]">Require Multi-Factor Authentication</p>
                    <p className="text-sm text-muted">Enforce MFA for all users</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={requireMFA}
                      onChange={(e) => setRequireMFA(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-600 peer-checked:after:translate-x-full" />
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))]">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="input mt-1 w-full"
                    min="15"
                    max="480"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))]">Password Policy</label>
                  <select value={passwordPolicy} onChange={(e) => setPasswordPolicy(e.target.value)} className="input mt-1 w-full">
                    <option value="basic">Basic (6+ characters)</option>
                    <option value="strong">Strong (8+ with mixed case, numbers, symbols)</option>
                    <option value="enterprise">Enterprise (12+ with all requirements)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">Data & Privacy</h2>
                <p className="mt-1 text-sm text-muted">Manage data retention and backup policies</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))]">Data Retention Period (days)</label>
                  <input
                    type="number"
                    value={dataRetention}
                    onChange={(e) => setDataRetention(e.target.value)}
                    className="input mt-1 w-full"
                    min="30"
                    max="3650"
                  />
                  <p className="mt-1 text-xs text-muted">How long to keep deleted records before permanent removal</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[rgb(var(--app-text-primary))]">Automatic Daily Backups</p>
                    <p className="text-sm text-muted">Enable automated database backups</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={autoBackup}
                      onChange={(e) => setAutoBackup(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-600 peer-checked:after:translate-x-full" />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
