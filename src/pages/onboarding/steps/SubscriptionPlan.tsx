import { Check } from 'lucide-react';
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

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 199,
    description: 'Perfect for small teams getting started',
    features: [
      'Up to 5 users',
      '1,000 candidates',
      '20 active jobs',
      'Basic career website',
      'Email support',
      '5 GB storage',
      'Standard integrations',
    ],
    setupFee: 99,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 499,
    description: 'For growing recruitment teams',
    features: [
      'Up to 25 users',
      '10,000 candidates',
      '100 active jobs',
      'Full CMS & website builder',
      'Priority support',
      '50 GB storage',
      'All integrations',
      'API access',
      'Custom domain',
      'Bench sales module',
    ],
    setupFee: 299,
    recommended: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    description: 'For large organizations',
    features: [
      'Unlimited users',
      'Unlimited candidates',
      'Unlimited jobs',
      'White-label solution',
      'Dedicated account manager',
      'Unlimited storage',
      'Custom integrations',
      'SSO/SAML',
      'SLA guarantee',
      'Custom development',
    ],
    setupFee: null,
  },
];

export default function SubscriptionPlan({ data, onUpdate, onNext }: StepProps) {
  const isValid = data.subscriptionPlan && data.billingEmail;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Plan Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`relative cursor-pointer transition-all ${
              data.subscriptionPlan === plan.id
                ? 'ring-2 ring-blue-500 border-blue-500'
                : 'hover:border-[rgba(var(--app-border-hover))]'
            }`}
            onClick={() => onUpdate({ subscriptionPlan: plan.id as any })}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                Recommended
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <div className="mt-4">
                {plan.price ? (
                  <div>
                    <span className="text-3xl font-bold text-[rgb(var(--app-text-primary))]">
                      ${plan.price}
                    </span>
                    <span className="text-muted">/month</span>
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-[rgb(var(--app-text-primary))]">
                    Custom
                  </div>
                )}
              </div>
              <p className="text-sm text-muted mt-2">{plan.description}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-[rgb(var(--app-text-primary))]">{feature}</span>
                  </li>
                ))}
              </ul>
              {plan.setupFee && (
                <div className="mt-4 pt-4 border-t border-[rgba(var(--app-border))]">
                  <p className="text-xs text-muted">
                    One-time setup fee: ${plan.setupFee}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Billing Email */}
      <div className="max-w-md">
        <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-2">
          Billing Email *
        </label>
        <Input
          type="email"
          placeholder="billing@yourcompany.com"
          value={data.billingEmail}
          onChange={(e) => onUpdate({ billingEmail: e.target.value })}
          required
        />
        <p className="text-xs text-muted mt-1">
          Invoices and billing notifications will be sent to this email
        </p>
      </div>

      {/* Special Offers */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🎁</div>
          <div>
            <h4 className="font-semibold text-[rgb(var(--app-text-primary))] mb-1">
              Limited Time Offer
            </h4>
            <ul className="text-sm text-muted space-y-1">
              <li>✓ 20% discount for annual payment</li>
              <li>✓ Free migration service ($5,000 value)</li>
              <li>✓ 30-day money-back guarantee</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Note */}
      <p className="text-sm text-muted">
        <strong>Note:</strong> You can change your plan at any time. Payment details will be
        collected after setup is complete.
      </p>

      {/* Action Buttons */}
      <div className="flex justify-end pt-4">
        <Button type="submit" variant="primary" disabled={!isValid}>
          Continue to Domain Setup
        </Button>
      </div>
    </form>
  );
}
