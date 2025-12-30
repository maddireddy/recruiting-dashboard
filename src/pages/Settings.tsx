import { useState, useEffect } from 'react';
import { Save, Building2, Mail, Palette, Key, Database, Shield, Sparkles } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

type SettingsTab = 'organization' | 'email' | 'branding' | 'integrations' | 'security' | 'data' | 'ai';

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

  // AI Model settings
  const [enableGPT51CodexMax, setEnableGPT51CodexMax] = useState(() => {
    const saved = localStorage.getItem('ai.gpt51CodexMax');
    return saved ? JSON.parse(saved) : true;
  });
  const [aiModelForAllClients, setAiModelForAllClients] = useState(() => {
    const saved = localStorage.getItem('ai.modelForAllClients');
    return saved ? JSON.parse(saved) : true;
  });
  const [aiAutoSuggestions, setAiAutoSuggestions] = useState(() => {
    const saved = localStorage.getItem('ai.autoSuggestions');
    return saved ? JSON.parse(saved) : true;
  });
  const [aiResumeParser, setAiResumeParser] = useState(() => {
    const saved = localStorage.getItem('ai.resumeParser');
    return saved ? JSON.parse(saved) : true;
  });

  // Persist AI settings to localStorage
  useEffect(() => {
    localStorage.setItem('ai.gpt51CodexMax', JSON.stringify(enableGPT51CodexMax));
    localStorage.setItem('ai.modelForAllClients', JSON.stringify(aiModelForAllClients));
    localStorage.setItem('ai.autoSuggestions', JSON.stringify(aiAutoSuggestions));
    localStorage.setItem('ai.resumeParser', JSON.stringify(aiResumeParser));
  }, [enableGPT51CodexMax, aiModelForAllClients, aiAutoSuggestions, aiResumeParser]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show specific success message for AI model configuration
      if (activeTab === 'ai' && enableGPT51CodexMax && aiModelForAllClients) {
        toast.success('✨ GPT-5.1-Codex-Max enabled for all clients! AI features are now active.', {
          duration: 5000,
          style: {
            background: '#27ae60',
            color: 'white',
            fontWeight: '600',
          },
          icon: '🚀',
        });
      } else {
        toast.success('Settings saved successfully');
      }
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
    { id: 'ai' as const, label: 'AI Models', icon: Sparkles },
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

          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">AI Model Configuration</h2>
                <p className="mt-1 text-sm text-muted">Manage AI capabilities and model access for the platform</p>
              </div>
              <div className="space-y-6">
                <div className="rounded-lg border border-[rgba(var(--app-primary-from),0.2)] bg-[rgba(var(--app-primary-from),0.05)] p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-1 h-5 w-5 text-[rgb(var(--app-primary-from))]" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-[rgb(var(--app-text-primary))]">GPT-5.1-Codex-Max Model</h3>
                      <p className="mt-1 text-sm text-muted">
                        Advanced AI model with enhanced reasoning, code generation, and analysis capabilities. 
                        Recommended for production use across all client workflows.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted))] p-4">
                    <div>
                      <p className="font-medium text-[rgb(var(--app-text-primary))]">Enable GPT-5.1-Codex-Max</p>
                      <p className="text-sm text-muted">Activate the advanced AI model for platform-wide use</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={enableGPT51CodexMax}
                        onChange={(e) => setEnableGPT51CodexMax(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-[#27ae60] peer-checked:after:translate-x-full" />
                    </label>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted))] p-4">
                    <div>
                      <p className="font-medium text-[rgb(var(--app-text-primary))]">Enable for All Clients</p>
                      <p className="text-sm text-muted">Make GPT-5.1-Codex-Max available to all client accounts</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={aiModelForAllClients}
                        onChange={(e) => setAiModelForAllClients(e.target.checked)}
                        disabled={!enableGPT51CodexMax}
                        className="peer sr-only disabled:cursor-not-allowed"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-[#27ae60] peer-checked:after:translate-x-full peer-disabled:opacity-50" />
                    </label>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted))] p-4">
                    <div>
                      <p className="font-medium text-[rgb(var(--app-text-primary))]">AI Auto-Suggestions</p>
                      <p className="text-sm text-muted">Enable intelligent suggestions for job descriptions and candidate matching</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={aiAutoSuggestions}
                        onChange={(e) => setAiAutoSuggestions(e.target.checked)}
                        disabled={!enableGPT51CodexMax}
                        className="peer sr-only disabled:cursor-not-allowed"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-[#27ae60] peer-checked:after:translate-x-full peer-disabled:opacity-50" />
                    </label>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted))] p-4">
                    <div>
                      <p className="font-medium text-[rgb(var(--app-text-primary))]">AI Resume Parser</p>
                      <p className="text-sm text-muted">Use AI to extract and structure candidate information from resumes</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={aiResumeParser}
                        onChange={(e) => setAiResumeParser(e.target.checked)}
                        disabled={!enableGPT51CodexMax}
                        className="peer sr-only disabled:cursor-not-allowed"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-[#27ae60] peer-checked:after:translate-x-full peer-disabled:opacity-50" />
                    </label>
                  </div>
                </div>

                {enableGPT51CodexMax && aiModelForAllClients && (
                  <div className="rounded-lg border border-[rgba(var(--app-primary-from),0.3)] bg-[rgba(var(--app-primary-from),0.08)] p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#27ae60] text-white">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-[rgb(var(--app-text-primary))]">GPT-5.1-Codex-Max Enabled for All Clients</h4>
                        <p className="mt-1 text-sm text-muted">
                          All client accounts now have access to the advanced AI model. This includes enhanced capabilities for:
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-muted">
                          <li>• Intelligent candidate matching and recommendations</li>
                          <li>• Advanced resume parsing and analysis</li>
                          <li>• Smart job description generation</li>
                          <li>• Automated interview scheduling optimization</li>
                          <li>• Predictive analytics and insights</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
