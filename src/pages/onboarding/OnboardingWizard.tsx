import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import Button from '../../components/ui/Button';
import CompanyProfile from './steps/CompanyProfile';
import SubscriptionPlan from './steps/SubscriptionPlan';
import DomainSetup from './steps/DomainSetup';
import BrandingSetup from './steps/BrandingSetup';
import EmailConfiguration from './steps/EmailConfiguration';
import Complete from './steps/Complete';

interface OnboardingStep {
  id: string;
  label: string;
  description: string;
  component: React.ComponentType<StepProps>;
}

interface StepProps {
  data: OnboardingData;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export interface OnboardingData {
  // Company Profile
  companyName: string;
  industry: string;
  companySize: string;
  headquarters: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  taxId: string;
  website?: string;

  // Subscription
  subscriptionPlan: 'starter' | 'pro' | 'enterprise';
  billingEmail: string;
  paymentMethod?: {
    type: string;
    last4: string;
  };

  // Domain Setup
  domainType: 'subdomain' | 'custom';
  subdomain?: string;
  customDomain?: string;
  domainVerified: boolean;

  // Branding
  logo?: File | null;
  favicon?: File | null;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };

  // Email Configuration
  emailDomain?: string;
  smtpProvider: 'sendgrid' | 'aws-ses' | 'mailgun' | 'smtp' | '';
  smtpConfig?: {
    host: string;
    port: number;
    username: string;
    password: string;
  };
  emailVerified: boolean;
}

const STEPS: OnboardingStep[] = [
  {
    id: 'company-profile',
    label: 'Company Profile',
    description: 'Tell us about your company',
    component: CompanyProfile,
  },
  {
    id: 'subscription',
    label: 'Subscription Plan',
    description: 'Choose the right plan',
    component: SubscriptionPlan,
  },
  {
    id: 'domain',
    label: 'Domain Setup',
    description: 'Configure your domain',
    component: DomainSetup,
  },
  {
    id: 'branding',
    label: 'Branding',
    description: 'Customize your brand',
    component: BrandingSetup,
  },
  {
    id: 'email',
    label: 'Email Setup',
    description: 'Configure email infrastructure',
    component: EmailConfiguration,
  },
  {
    id: 'complete',
    label: 'Complete',
    description: 'Review and finish',
    component: Complete,
  },
];

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    companyName: '',
    industry: '',
    companySize: '',
    headquarters: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'United States',
    },
    taxId: '',
    subscriptionPlan: 'starter',
    billingEmail: '',
    domainType: 'subdomain',
    domainVerified: false,
    colors: {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      accent: '#10B981',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    smtpProvider: '',
    emailVerified: false,
  });

  const handleUpdateData = (data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Complete onboarding
      handleCompleteOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCompleteOnboarding = async () => {
    try {
      // TODO: Call API to complete onboarding
      console.log('Completing onboarding with data:', onboardingData);

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  const CurrentStepComponent = STEPS[currentStep].component;

  return (
    <div className="min-h-screen bg-[rgb(var(--app-background))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[rgb(var(--app-text-primary))] mb-4">
            Welcome to RecruitPro
          </h1>
          <p className="text-lg text-muted">
            Let's get your organization set up in just a few steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  {/* Step Circle */}
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                      index < currentStep
                        ? 'bg-green-500 border-green-500'
                        : index === currentStep
                        ? 'bg-blue-500 border-blue-500'
                        : 'bg-[rgba(var(--app-surface))] border-[rgba(var(--app-border))]'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    ) : (
                      <span
                        className={`text-sm font-semibold ${
                          index === currentStep
                            ? 'text-white'
                            : 'text-muted'
                        }`}
                      >
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="mt-3 text-center">
                    <p
                      className={`text-sm font-medium ${
                        index <= currentStep
                          ? 'text-[rgb(var(--app-text-primary))]'
                          : 'text-muted'
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-muted hidden sm:block">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 -mt-8 ${
                      index < currentStep
                        ? 'bg-green-500'
                        : 'bg-[rgba(var(--app-border))]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>{STEPS[currentStep].label}</CardTitle>
              <CardDescription>{STEPS[currentStep].description}</CardDescription>
            </CardHeader>
            <CardContent>
              <CurrentStepComponent
                data={onboardingData}
                onUpdate={handleUpdateData}
                onNext={handleNext}
                onBack={handleBack}
              />
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="subtle"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </Button>

            <div className="flex gap-2">
              {currentStep < STEPS.length - 1 && (
                <Button variant="subtle" onClick={() => navigate('/dashboard')}>
                  Skip for Now
                </Button>
              )}
              <Button variant="primary" onClick={handleNext}>
                {currentStep === STEPS.length - 1 ? 'Complete Setup' : 'Continue'}
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted">
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <span className="text-sm text-muted">
              {Math.round(((currentStep + 1) / STEPS.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-[rgba(var(--app-surface-muted))] rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
