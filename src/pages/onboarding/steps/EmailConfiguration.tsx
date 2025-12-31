import { useState } from 'react';
import { Mail, Server, CheckCircle2, AlertCircle, Key, Copy } from 'lucide-react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import type { OnboardingData } from '../OnboardingWizard';

interface StepProps {
  data: OnboardingData;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const SMTP_PROVIDERS = [
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Recommended for most users',
    setupComplexity: 'Easy',
  },
  {
    id: 'aws-ses',
    name: 'Amazon SES',
    description: 'Cost-effective for high volume',
    setupComplexity: 'Moderate',
  },
  {
    id: 'mailgun',
    name: 'Mailgun',
    description: 'Developer-friendly API',
    setupComplexity: 'Easy',
  },
  {
    id: 'smtp',
    name: 'Custom SMTP',
    description: 'Use your own SMTP server',
    setupComplexity: 'Advanced',
  },
];

export default function EmailConfiguration({ data, onUpdate, onNext }: StepProps) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const emailDomain = data.customDomain || `${data.subdomain || 'mycompany'}.recruitpro.com`;

  const handleTestEmail = async () => {
    setTesting(true);
    setTestResult(null);

    // Simulate email test
    setTimeout(() => {
      setTesting(false);
      setTestResult('success');
      onUpdate({ emailVerified: true });
    }, 2000);
  };

  const handleSkip = () => {
    onUpdate({ smtpProvider: '' });
    onNext();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.smtpProvider && data.emailVerified) {
      onNext();
    } else if (!data.smtpProvider) {
      // Allow skipping
      handleSkip();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Domain Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail size={16} />
            Email Domain
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-[rgba(var(--app-surface-muted))] p-4 rounded-lg">
            <p className="text-sm text-muted mb-2">Your email domain:</p>
            <code className="text-base font-mono text-[rgb(var(--app-text-primary))]">
              @{emailDomain}
            </code>
          </div>
          <p className="text-sm text-muted mt-3">
            Employee emails will be: firstname.lastname@{emailDomain}
          </p>
        </CardContent>
      </Card>

      {/* SMTP Provider Selection */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-3">
          Email Service Provider (Optional)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SMTP_PROVIDERS.map((provider) => (
            <Card
              key={provider.id}
              className={`cursor-pointer transition-all ${
                data.smtpProvider === provider.id
                  ? 'ring-2 ring-blue-500 border-blue-500'
                  : 'hover:border-[rgba(var(--app-border-hover))]'
              }`}
              onClick={() => onUpdate({ smtpProvider: provider.id as any })}
            >
              <CardHeader>
                <CardTitle className="text-base">{provider.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted mb-2">{provider.description}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted">Setup:</span>
                  <span
                    className={`px-2 py-0.5 rounded ${
                      provider.setupComplexity === 'Easy'
                        ? 'bg-green-500/20 text-green-400'
                        : provider.setupComplexity === 'Moderate'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {provider.setupComplexity}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Provider Configuration */}
      {data.smtpProvider && data.smtpProvider !== 'smtp' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {SMTP_PROVIDERS.find((p) => p.id === data.smtpProvider)?.name} Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-2">
                API Key
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <Input
                  type="password"
                  placeholder={`Enter your ${SMTP_PROVIDERS.find((p) => p.id === data.smtpProvider)?.name} API key`}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted mt-1">
                Get your API key from your {SMTP_PROVIDERS.find((p) => p.id === data.smtpProvider)?.name} dashboard
              </p>
            </div>

            {/* Test Email Button */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={testResult === 'success' ? 'subtle' : 'primary'}
                size="sm"
                onClick={handleTestEmail}
                disabled={testing || testResult === 'success'}
              >
                {testing ? (
                  'Testing...'
                ) : testResult === 'success' ? (
                  <>
                    <CheckCircle2 size={14} className="mr-1" />
                    Test Successful
                  </>
                ) : (
                  'Test Email Delivery'
                )}
              </Button>
            </div>

            {testResult === 'success' && (
              <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-400">
                <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                <p>
                  Test email sent successfully! Email configuration is working.
                </p>
              </div>
            )}

            {testResult === 'error' && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <p>
                  Failed to send test email. Please check your API key and try again.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Custom SMTP Configuration */}
      {data.smtpProvider === 'smtp' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Server size={16} />
              Custom SMTP Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-2">
                  SMTP Host
                </label>
                <Input
                  type="text"
                  placeholder="smtp.example.com"
                  value={data.smtpConfig?.host || ''}
                  onChange={(e) =>
                    onUpdate({
                      smtpConfig: {
                        ...data.smtpConfig!,
                        host: e.target.value,
                        port: data.smtpConfig?.port || 587,
                        username: data.smtpConfig?.username || '',
                        password: data.smtpConfig?.password || '',
                      },
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-2">
                  Port
                </label>
                <Input
                  type="number"
                  placeholder="587"
                  value={data.smtpConfig?.port || ''}
                  onChange={(e) =>
                    onUpdate({
                      smtpConfig: {
                        ...data.smtpConfig!,
                        host: data.smtpConfig?.host || '',
                        port: parseInt(e.target.value),
                        username: data.smtpConfig?.username || '',
                        password: data.smtpConfig?.password || '',
                      },
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-2">
                  Username
                </label>
                <Input
                  type="text"
                  placeholder="username"
                  value={data.smtpConfig?.username || ''}
                  onChange={(e) =>
                    onUpdate({
                      smtpConfig: {
                        ...data.smtpConfig!,
                        host: data.smtpConfig?.host || '',
                        port: data.smtpConfig?.port || 587,
                        username: e.target.value,
                        password: data.smtpConfig?.password || '',
                      },
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="password"
                  value={data.smtpConfig?.password || ''}
                  onChange={(e) =>
                    onUpdate({
                      smtpConfig: {
                        ...data.smtpConfig!,
                        host: data.smtpConfig?.host || '',
                        port: data.smtpConfig?.port || 587,
                        username: data.smtpConfig?.username || '',
                        password: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleTestEmail}
              disabled={testing}
            >
              {testing ? 'Testing...' : 'Test SMTP Connection'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* DNS Records (Auto-generated) */}
      {data.smtpProvider && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">DNS Records (Auto-configured)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted">
              We'll automatically configure these DNS records for email authentication:
            </p>

            {/* SPF Record */}
            <div className="bg-[rgba(var(--app-surface-muted))] p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-muted">SPF Record</span>
                <CheckCircle2 size={14} className="text-green-400" />
              </div>
              <code className="text-xs break-all">
                v=spf1 include:_spf.recruitpro.com ~all
              </code>
            </div>

            {/* DKIM Record */}
            <div className="bg-[rgba(var(--app-surface-muted))] p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-muted">DKIM Record</span>
                <CheckCircle2 size={14} className="text-green-400" />
              </div>
              <code className="text-xs break-all">
                Auto-generated after setup
              </code>
            </div>

            {/* DMARC Record */}
            <div className="bg-[rgba(var(--app-surface-muted))] p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-muted">DMARC Record</span>
                <CheckCircle2 size={14} className="text-green-400" />
              </div>
              <code className="text-xs break-all">
                v=DMARC1; p=none; rua=mailto:dmarc@{emailDomain}
              </code>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skip Option */}
      {!data.smtpProvider && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-[rgb(var(--app-text-primary))] mb-1">
                Email Setup Optional
              </h4>
              <p className="text-sm text-muted">
                You can skip this step and configure email later. The platform will use a
                default email service for notifications.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        {!data.smtpProvider && (
          <Button type="button" variant="subtle" onClick={handleSkip}>
            Skip for Now
          </Button>
        )}
        <div className="flex-1" />
        <Button
          type="submit"
          variant="primary"
          disabled={data.smtpProvider ? !data.emailVerified : false}
        >
          {data.smtpProvider && !data.emailVerified
            ? 'Please test email first'
            : 'Complete Setup'}
        </Button>
      </div>
    </form>
  );
}
