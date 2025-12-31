import { useState } from 'react';
import { Globe, CheckCircle2, AlertCircle, Copy, ExternalLink } from 'lucide-react';
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

export default function DomainSetup({ data, onUpdate, onNext }: StepProps) {
  const [verifying, setVerifying] = useState(false);

  const generateSubdomain = () => {
    const slug = data.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);
    return slug || 'mycompany';
  };

  const subdomain = data.subdomain || generateSubdomain();
  const fullSubdomain = `${subdomain}.recruitpro.com`;

  const handleVerifyDomain = async () => {
    setVerifying(true);
    // Simulate verification
    setTimeout(() => {
      onUpdate({ domainVerified: true });
      setVerifying(false);
    }, 2000);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.domainType === 'subdomain' || data.domainVerified) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Domain Type Selection */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-4">
          Choose your domain setup
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Subdomain Option */}
          <Card
            className={`cursor-pointer transition-all ${
              data.domainType === 'subdomain'
                ? 'ring-2 ring-blue-500 border-blue-500'
                : 'hover:border-[rgba(var(--app-border-hover))]'
            }`}
            onClick={() => onUpdate({ domainType: 'subdomain', domainVerified: true })}
          >
            <CardHeader>
              <CardTitle className="text-base">Free Subdomain</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted mb-4">
                Quick setup with our domain
              </p>
              <div className="bg-[rgba(var(--app-surface-muted))] p-3 rounded-lg">
                <p className="text-sm font-mono text-[rgb(var(--app-text-primary))]">
                  {fullSubdomain}
                </p>
              </div>
              <ul className="mt-4 space-y-2 text-xs text-muted">
                <li>✓ Instant setup</li>
                <li>✓ Free SSL certificate</li>
                <li>✓ No DNS configuration needed</li>
              </ul>
            </CardContent>
          </Card>

          {/* Custom Domain Option */}
          <Card
            className={`cursor-pointer transition-all ${
              data.domainType === 'custom'
                ? 'ring-2 ring-blue-500 border-blue-500'
                : 'hover:border-[rgba(var(--app-border-hover))]'
            }`}
            onClick={() => onUpdate({ domainType: 'custom', domainVerified: false })}
          >
            <CardHeader>
              <CardTitle className="text-base">Custom Domain</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted mb-4">
                Use your own domain
              </p>
              <div className="bg-[rgba(var(--app-surface-muted))] p-3 rounded-lg">
                <p className="text-sm font-mono text-[rgb(var(--app-text-primary))]">
                  careers.yourcompany.com
                </p>
              </div>
              <ul className="mt-4 space-y-2 text-xs text-muted">
                <li>✓ Professional branding</li>
                <li>✓ Free SSL certificate</li>
                <li>⚠ Requires DNS configuration</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Subdomain Configuration */}
      {data.domainType === 'subdomain' && (
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-2">
            Your Subdomain
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={subdomain}
              onChange={(e) => onUpdate({ subdomain: e.target.value })}
              pattern="[a-z0-9-]+"
              title="Only lowercase letters, numbers, and hyphens"
              className="flex-1"
            />
            <span className="text-muted">.recruitpro.com</span>
          </div>
          <p className="text-xs text-muted mt-1">
            Only lowercase letters, numbers, and hyphens allowed
          </p>

          {/* Preview */}
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <CheckCircle2 size={18} />
              <span className="font-medium">Your career site will be available at:</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-muted" />
              <code className="text-sm text-[rgb(var(--app-text-primary))]">
                https://{subdomain}.recruitpro.com
              </code>
              <button
                type="button"
                onClick={() => handleCopy(`https://${subdomain}.recruitpro.com`)}
                className="p-1 hover:bg-[rgba(var(--app-surface-muted))] rounded"
              >
                <Copy size={14} className="text-muted" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Domain Configuration */}
      {data.domainType === 'custom' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-2">
              Custom Domain
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <Input
                type="text"
                placeholder="careers.yourcompany.com"
                value={data.customDomain || ''}
                onChange={(e) => onUpdate({ customDomain: e.target.value })}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* DNS Instructions */}
          {data.customDomain && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">DNS Configuration Required</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted">
                  Add the following DNS records to your domain provider:
                </p>

                {/* CNAME Record */}
                <div className="bg-[rgba(var(--app-surface-muted))] p-4 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-muted">Type</span>
                    <code className="text-sm">CNAME</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-muted">Name</span>
                    <div className="flex items-center gap-2">
                      <code className="text-sm">{data.customDomain}</code>
                      <button
                        type="button"
                        onClick={() => handleCopy(data.customDomain || '')}
                        className="p-1 hover:bg-[rgba(var(--app-surface))] rounded"
                      >
                        <Copy size={12} className="text-muted" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-muted">Value</span>
                    <div className="flex items-center gap-2">
                      <code className="text-sm">proxy.recruitpro.com</code>
                      <button
                        type="button"
                        onClick={() => handleCopy('proxy.recruitpro.com')}
                        className="p-1 hover:bg-[rgba(var(--app-surface))] rounded"
                      >
                        <Copy size={12} className="text-muted" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-sm text-amber-400">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <p>
                    DNS changes can take up to 48 hours to propagate. We'll verify automatically.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={data.domainVerified ? 'subtle' : 'primary'}
                    size="sm"
                    onClick={handleVerifyDomain}
                    disabled={verifying || data.domainVerified}
                  >
                    {verifying ? (
                      'Verifying...'
                    ) : data.domainVerified ? (
                      <>
                        <CheckCircle2 size={14} className="mr-1" />
                        Verified
                      </>
                    ) : (
                      'Verify DNS'
                    )}
                  </Button>
                  <a
                    href="https://docs.recruitpro.com/domain-setup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:underline flex items-center gap-1"
                  >
                    View setup guide
                    <ExternalLink size={14} />
                  </a>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* SSL Certificate Info */}
      <div className="bg-[rgba(var(--app-surface-muted))] p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🔒</div>
          <div>
            <h4 className="font-medium text-[rgb(var(--app-text-primary))] mb-1">
              Free SSL Certificate
            </h4>
            <p className="text-sm text-muted">
              We'll automatically provision and renew an SSL certificate for your domain,
              ensuring secure HTTPS connections.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          variant="primary"
          disabled={data.domainType === 'custom' && !data.domainVerified}
        >
          {data.domainType === 'custom' && !data.domainVerified
            ? 'Please verify domain first'
            : 'Continue to Branding'}
        </Button>
      </div>
    </form>
  );
}
