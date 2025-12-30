import { useState } from 'react';
import { Check, Crown, Sparkles, Users, Database, Briefcase, Zap, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import { PlanTier, PLAN_LIMITS } from '../../store/organizationStore';
import { toast } from 'react-hot-toast';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  tier: PlanTier;
  name: string;
  tagline: string;
  price: {
    monthly: number;
    yearly: number;
  };
  priceLabel?: string;
  features: PlanFeature[];
  highlighted?: boolean;
  cta: string;
  icon: React.ReactNode;
}

const PLANS: Plan[] = [
  {
    tier: 'freemium',
    name: 'Freemium',
    tagline: 'Perfect for getting started',
    price: { monthly: 0, yearly: 0 },
    priceLabel: 'Free Forever',
    icon: <Users size={24} />,
    cta: 'Get Started Free',
    features: [
      { text: 'Up to 5 users', included: true },
      { text: '100 candidates', included: true },
      { text: '5 active jobs', included: true },
      { text: 'Basic ATS features', included: true },
      { text: 'Email templates', included: true },
      { text: 'Basic reports', included: true },
      { text: 'Custom pipeline', included: false },
      { text: 'AI features', included: false },
      { text: 'Advanced analytics', included: false },
    ],
  },
  {
    tier: 'starter',
    name: 'Starter',
    tagline: 'For growing recruitment teams',
    price: { monthly: 49, yearly: 39 },
    priceLabel: 'per user/month',
    icon: <Briefcase size={24} />,
    cta: 'Start 14-Day Trial',
    features: [
      { text: 'Up to 15 users', included: true },
      { text: '1,000 candidates', included: true },
      { text: '50 active jobs', included: true },
      { text: 'Custom pipeline stages', included: true },
      { text: 'Advanced search & filters', included: true },
      { text: 'Calendar sync', included: true },
      { text: 'Custom workflows', included: true },
      { text: 'Email automation', included: true },
      { text: 'AI features', included: false },
      { text: 'White label', included: false },
    ],
  },
  {
    tier: 'pro',
    name: 'Pro',
    tagline: 'Maximum power and flexibility',
    price: { monthly: 99, yearly: 79 },
    priceLabel: 'per user/month',
    icon: <Crown size={24} />,
    highlighted: true,
    cta: 'Start 14-Day Trial',
    features: [
      { text: 'Unlimited users', included: true },
      { text: 'Unlimited candidates', included: true },
      { text: 'Unlimited active jobs', included: true },
      { text: 'AI Resume Parser', included: true },
      { text: 'AI Job Description Generator', included: true },
      { text: 'Semantic Search', included: true },
      { text: 'Internal chat', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'White label branding', included: true },
      { text: 'API access', included: true },
      { text: 'SMS campaigns', included: true },
      { text: 'Priority support', included: true },
    ],
  },
];

interface PlanSelectionProps {
  onPlanSelected?: (tier: PlanTier, billingInterval: 'monthly' | 'yearly') => void;
  currentPlan?: PlanTier;
}

export default function PlanSelection({ onPlanSelected, currentPlan }: PlanSelectionProps) {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);

  const handleSelectPlan = async (tier: PlanTier) => {
    if (tier === 'freemium') {
      // Free plan - no payment needed
      onPlanSelected?.(tier, billingInterval);
      toast.success('Freemium plan activated!');
      return;
    }

    try {
      setLoading(true);

      // TODO: Integrate with Stripe
      // Option 1: Stripe Checkout (redirect)
      // const response = await axios.post('/api/billing/create-checkout-session', {
      //   planTier: tier,
      //   billingInterval,
      // });
      // window.location.href = response.data.checkoutUrl;

      // Option 2: Stripe Elements (modal)
      // Open modal with Stripe Elements
      // showStripeModal(tier, billingInterval);

      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For now, just show success
      toast.success(`${tier.charAt(0).toUpperCase() + tier.slice(1)} plan selected! Redirecting to payment...`);

      // In real implementation, this would redirect to Stripe Checkout
      onPlanSelected?.(tier, billingInterval);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const getDiscountLabel = () => {
    if (billingInterval === 'yearly') {
      return 'Save 20%';
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center gap-4 p-1 rounded-lg bg-[rgb(var(--app-surface-muted))]">
          <button
            onClick={() => setBillingInterval('monthly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition ${
              billingInterval === 'monthly'
                ? 'bg-[rgb(var(--app-primary))] text-white'
                : 'text-muted hover:text-[rgb(var(--app-text-primary))]'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval('yearly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition relative ${
              billingInterval === 'yearly'
                ? 'bg-[rgb(var(--app-primary))] text-white'
                : 'text-muted hover:text-[rgb(var(--app-text-primary))]'
            }`}
          >
            Yearly
            <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-bold bg-[rgb(var(--app-success))] text-white rounded-full">
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const price = billingInterval === 'monthly' ? plan.price.monthly : plan.price.yearly;
          const isCurrentPlan = currentPlan === plan.tier;

          return (
            <div
              key={plan.tier}
              className={`
                relative rounded-xl border-2 transition-all
                ${plan.highlighted
                  ? 'border-[rgb(var(--app-primary))] shadow-lg scale-105'
                  : 'border-[rgba(var(--app-border-subtle))] hover:border-[rgba(var(--app-primary),0.5)]'
                }
                ${isCurrentPlan ? 'ring-2 ring-[rgb(var(--app-success))]' : ''}
              `}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1 rounded-full bg-[rgb(var(--app-primary))] text-white text-xs font-bold flex items-center gap-1">
                    <Sparkles size={12} />
                    Recommended
                  </div>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-4 right-4">
                  <div className="px-3 py-1 rounded-full bg-[rgb(var(--app-success))] text-white text-xs font-bold">
                    Current Plan
                  </div>
                </div>
              )}

              <div className="p-6">
                {/* Icon & Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center
                    ${plan.highlighted
                      ? 'bg-[rgb(var(--app-primary))] text-white'
                      : 'bg-[rgba(var(--app-primary),0.1)] text-[rgb(var(--app-primary))]'
                    }
                  `}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[rgb(var(--app-text-primary))]">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-muted">{plan.tagline}</p>
                  </div>
                </div>

                {/* Pricing */}
                <div className="mb-6">
                  {price === 0 ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-[rgb(var(--app-text-primary))]">
                        Free
                      </span>
                      <span className="text-muted">forever</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-[rgb(var(--app-text-primary))]">
                        ${price}
                      </span>
                      <span className="text-muted">
                        /{plan.priceLabel?.includes('user') ? 'user/' : ''}
                        {billingInterval === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    </div>
                  )}
                  {billingInterval === 'yearly' && price > 0 && (
                    <p className="text-xs text-[rgb(var(--app-success))] mt-1">
                      Billed ${price * 12}/year
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <Button
                  variant={plan.highlighted ? 'primary' : 'subtle'}
                  size="lg"
                  className="w-full mb-6"
                  onClick={() => handleSelectPlan(plan.tier)}
                  disabled={loading || isCurrentPlan}
                >
                  {isCurrentPlan ? 'Current Plan' : plan.cta}
                </Button>

                {/* Features List */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                    What's included
                  </p>
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      {feature.included ? (
                        <Check size={16} className="text-[rgb(var(--app-success))] mt-0.5 flex-shrink-0" />
                      ) : (
                        <X size={16} className="text-muted mt-0.5 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${feature.included ? 'text-[rgb(var(--app-text-primary))]' : 'text-muted line-through'}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Plan Limits */}
                <div className="mt-6 pt-6 border-t border-[rgba(var(--app-border-subtle))]">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                    Resource Limits
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 rounded bg-[rgba(var(--app-surface-muted),0.5)]">
                      <div className="text-lg font-bold text-[rgb(var(--app-text-primary))]">
                        {PLAN_LIMITS[plan.tier].maxUsers === -1 ? '∞' : PLAN_LIMITS[plan.tier].maxUsers}
                      </div>
                      <div className="text-xs text-muted">Users</div>
                    </div>
                    <div className="text-center p-2 rounded bg-[rgba(var(--app-surface-muted),0.5)]">
                      <div className="text-lg font-bold text-[rgb(var(--app-text-primary))]">
                        {PLAN_LIMITS[plan.tier].maxCandidates === -1 ? '∞' : PLAN_LIMITS[plan.tier].maxCandidates}
                      </div>
                      <div className="text-xs text-muted">Candidates</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ / Additional Info */}
      <div className="card p-6 text-center">
        <p className="text-sm text-muted mb-4">
          All plans include 14-day free trial • No credit card required for Freemium • Cancel anytime
        </p>
        <div className="flex items-center justify-center gap-6 text-xs text-muted">
          <a href="#" className="hover:text-[rgb(var(--app-primary))]">Compare all features</a>
          <span>•</span>
          <a href="#" className="hover:text-[rgb(var(--app-primary))]">Contact sales</a>
          <span>•</span>
          <a href="#" className="hover:text-[rgb(var(--app-primary))]">View pricing FAQ</a>
        </div>
      </div>

      {/* Enterprise CTA */}
      <div className="card p-8 bg-gradient-to-r from-[rgba(var(--app-primary),0.05)] to-[rgba(var(--app-primary),0.1)] border border-[rgba(var(--app-primary),0.2)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[rgb(var(--app-primary))] text-white flex items-center justify-center">
              <Zap size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[rgb(var(--app-text-primary))] mb-1">
                Need something more powerful?
              </h3>
              <p className="text-muted">
                Enterprise plans with SSO, dedicated support, and custom integrations
              </p>
            </div>
          </div>
          <Button variant="primary" size="lg" onClick={() => toast.info('Contact sales form would open here')}>
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
}
