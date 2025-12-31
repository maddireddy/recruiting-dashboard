import api from './api';

// Types
export interface OnboardingData {
  companyName: string;
  industry: string;
  companySize: string;
  headquarters: string;
  subscriptionPlan: 'starter' | 'pro' | 'enterprise';
  billingEmail: string;
  domainType: 'subdomain' | 'custom';
  subdomain?: string;
  customDomain?: string;
  domainVerified?: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts?: {
    heading: string;
    body: string;
  };
  smtpProvider: 'sendgrid' | 'aws-ses' | 'mailgun' | 'smtp' | '';
  smtpConfig?: {
    host?: string;
    port?: number;
    apiKey?: string;
  };
  emailVerified: boolean;
}

export interface OnboardingStatus {
  status: 'pending' | 'in_progress' | 'completed';
  currentStep: string;
  completedSteps: Array<{ step: string; completedAt: string }>;
}

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  onboarding: OnboardingStatus;
  domain?: {
    type: 'subdomain' | 'custom';
    subdomain?: string;
    customDomain?: string;
    verified: boolean;
  };
  branding?: {
    logo?: { url: string; filename: string };
    favicon?: { url: string; filename: string };
    colors: { primary: string; secondary: string; accent: string };
  };
  subscription?: {
    plan: 'starter' | 'pro' | 'enterprise';
    status: 'trial' | 'active' | 'cancelled';
  };
}

class OnboardingService {
  /**
   * Start or resume onboarding process
   * POST /api/v1/onboarding/start
   */
  async startOnboarding(): Promise<{ organizationId: string; status: string }> {
    const response = await api.post('/v1/onboarding/start');
    return response.data.data;
  }

  /**
   * Save company profile information
   * POST /api/v1/onboarding/company-profile
   */
  async saveCompanyProfile(data: {
    companyName: string;
    industry: string;
    companySize: string;
    headquarters: string;
    organizationId: string;
  }): Promise<Organization> {
    const response = await api.post('/v1/onboarding/company-profile', data);
    return response.data.data.organization;
  }

  /**
   * Save subscription plan selection
   * POST /api/v1/onboarding/subscription
   */
  async saveSubscription(data: {
    organizationId: string;
    subscriptionPlan: 'starter' | 'pro' | 'enterprise';
    billingEmail: string;
  }): Promise<Organization> {
    const response = await api.post('/v1/onboarding/subscription', data);
    return response.data.data.organization;
  }

  /**
   * Save domain configuration
   * POST /api/v1/onboarding/domain
   */
  async saveDomain(data: {
    organizationId: string;
    domainType: 'subdomain' | 'custom';
    subdomain?: string;
    customDomain?: string;
  }): Promise<Organization> {
    const response = await api.post('/v1/onboarding/domain', data);
    return response.data.data.organization;
  }

  /**
   * Verify custom domain DNS configuration
   * POST /api/v1/onboarding/verify-domain
   */
  async verifyDomain(data: {
    organizationId: string;
    customDomain: string;
  }): Promise<{ verified: boolean; dnsRecords?: any }> {
    const response = await api.post('/v1/onboarding/verify-domain', data);
    return response.data.data;
  }

  /**
   * Save branding configuration
   * POST /api/v1/onboarding/branding (multipart/form-data)
   */
  async saveBranding(data: {
    organizationId: string;
    colors: { primary: string; secondary: string; accent: string };
    fonts?: { heading: string; body: string };
    logo?: File;
    favicon?: File;
  }): Promise<Organization> {
    const formData = new FormData();
    formData.append('organizationId', data.organizationId);
    formData.append('colors', JSON.stringify(data.colors));

    if (data.fonts) {
      formData.append('fonts', JSON.stringify(data.fonts));
    }

    if (data.logo) {
      formData.append('logo', data.logo);
    }

    if (data.favicon) {
      formData.append('favicon', data.favicon);
    }

    const response = await api.post('/v1/onboarding/branding', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data.organization;
  }

  /**
   * Save email/SMTP configuration
   * POST /api/v1/onboarding/email
   */
  async saveEmail(data: {
    organizationId: string;
    smtpProvider: 'sendgrid' | 'aws-ses' | 'mailgun' | 'smtp';
    smtpConfig: {
      host?: string;
      port?: number;
      apiKey?: string;
    };
  }): Promise<Organization> {
    const response = await api.post('/v1/onboarding/email', data);
    return response.data.data.organization;
  }

  /**
   * Test email configuration
   * POST /api/v1/onboarding/test-email
   */
  async testEmail(data: {
    organizationId: string;
    testRecipient: string;
  }): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/v1/onboarding/test-email', data);
    return response.data.data;
  }

  /**
   * Complete onboarding process
   * POST /api/v1/onboarding/complete
   */
  async completeOnboarding(organizationId: string): Promise<Organization> {
    const response = await api.post('/v1/onboarding/complete', { organizationId });
    return response.data.data.organization;
  }

  /**
   * Get onboarding status
   * GET /api/v1/onboarding/status/:organizationId
   */
  async getOnboardingStatus(organizationId: string): Promise<OnboardingStatus> {
    const response = await api.get(`/v1/onboarding/status/${organizationId}`);
    return response.data.data.onboarding;
  }

  /**
   * Get DNS records for domain setup
   */
  getDNSRecords(domain: string) {
    return {
      mx: [
        { priority: 10, value: 'mx1.recruitpro.com' },
        { priority: 20, value: 'mx2.recruitpro.com' },
      ],
      txt: [
        { name: '@', value: `v=spf1 include:_spf.recruitpro.com ~all` },
        { name: '_dmarc', value: `v=DMARC1; p=none; rua=mailto:dmarc@${domain}` },
      ],
      cname: [
        { name: `dkim._domainkey`, value: 'dkim.recruitpro.com' },
        { name: 'www', value: 'recruitpro.com' },
      ],
    };
  }
}

export default new OnboardingService();
