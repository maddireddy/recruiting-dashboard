import { useMemo, useState } from 'react';
import { CreditCard, DollarSign, TrendingUp, CheckCircle, Download } from 'lucide-react';
import { billingService, type BillingPlan, type Invoice, type Subscription } from '../services/billing.service';
import { toast } from 'react-hot-toast';
import { useList } from '../services/hooks';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  // Get tenant ID from localStorage
  const tenantId = localStorage.getItem('tenantId') || undefined;

  const plansQ = useList<BillingPlan[]>('billing-plans', (tid) => billingService.getPlans(tid), tenantId);
  const subscriptionQ = useList<Subscription | null>('billing-subscription', (tid) => billingService.getCurrentSubscription(tid), tenantId);
  const invoicesQ = useList<Invoice[]>('billing-invoices', (tid) => billingService.getInvoices(0, 10, tid), tenantId);

  const plans = useMemo(() => plansQ.data || [], [plansQ.data]);
  const subscription = useMemo(() => subscriptionQ.data || null, [subscriptionQ.data]);
  const invoices = useMemo(() => invoicesQ.data || [], [invoicesQ.data]);

  const checkout = async (planId: string) => {
    try {
      const res = await billingService.checkout(planId, tenantId);
      if (res?.url) {
        window.open(res.url, '_blank');
        toast.success('Checkout session created');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to create checkout');
    }
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    checkout(planId);
  };

  const totalSpent = useMemo(() => {
    return invoices
      .filter(inv => inv.status === 'PAID')
      .reduce((sum, inv) => sum + parseFloat(inv.amount.replace(/[^0-9.-]+/g, '')), 0);
  }, [invoices]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Billing & Subscriptions"
        subtitle="Manage your subscription plans, payment methods, and invoices"
        actions={
          <Button variant="primary" size="md">
            <CreditCard size={16} />
            <span className="ml-2">Payment Methods</span>
          </Button>
        }
      />

      {/* Stats Section */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/15">
              <CreditCard className="text-indigo-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Current Plan</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">
                {subscription?.planId || 'Free'}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/15">
              <CheckCircle className="text-green-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Status</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">
                {subscription?.status || 'Inactive'}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15">
              <TrendingUp className="text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Total Invoices</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">
                {invoices.length}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15">
              <DollarSign className="text-amber-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Total Spent</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">
                ${totalSpent.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Subscription */}
      {subscription && (
        <div className="card bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border-indigo-400/30">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">Current Subscription</h2>
                <span className={`chip ${
                  subscription.status === 'ACTIVE'
                    ? 'bg-green-500/15 text-green-300'
                    : 'bg-amber-500/15 text-amber-300'
                }`}>
                  {subscription.status}
                </span>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs text-muted">Plan</p>
                  <p className="mt-1 font-semibold text-[rgb(var(--app-text-primary))]">{subscription.planId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Current Period</p>
                  <p className="mt-1 font-semibold text-[rgb(var(--app-text-primary))]">
                    {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">Auto-renew</p>
                  <p className="mt-1 font-semibold text-[rgb(var(--app-text-primary))]">
                    {subscription.cancelAtPeriodEnd ? 'No' : 'Yes'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">Next Billing</p>
                  <p className="mt-1 font-semibold text-[rgb(var(--app-text-primary))]">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            <Button variant="subtle" size="sm">
              Manage Subscription
            </Button>
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div className="card space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">Available Plans</h2>
          <p className="mt-1 text-sm text-muted">Choose the plan that fits your recruiting needs</p>
        </div>

        {plansQ.isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-lg bg-[rgba(var(--app-border-subtle))]" />
            ))}
          </div>
        ) : plansQ.error ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-[rgba(var(--app-border-subtle))] text-muted">
              <CreditCard size={28} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Failed to load plans</h3>
              <p className="mt-1 text-sm text-muted">Please try again later</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plans.map(plan => (
              <div
                key={plan.id}
                className="card hover:border-indigo-400/30 transition cursor-pointer group"
              >
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">{plan.name}</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-indigo-400">{plan.price}</span>
                      <span className="text-sm text-muted">/month</span>
                    </div>
                    <ul className="mt-6 space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle size={16} className="mt-0.5 flex-shrink-0 text-green-400" />
                          <span className="text-[rgb(var(--app-text-secondary))]">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    variant={subscription?.planId === plan.id ? "subtle" : "primary"}
                    size="md"
                    className="mt-6 w-full"
                    onClick={() => handlePlanSelect(plan.id)}
                    disabled={selectedPlan === plan.id || subscription?.planId === plan.id}
                  >
                    {subscription?.planId === plan.id
                      ? 'Current Plan'
                      : selectedPlan === plan.id
                        ? 'Processing...'
                        : `Choose ${plan.name}`
                    }
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoice History */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">Invoice History</h2>
            <p className="mt-1 text-sm text-muted">View and download your past invoices</p>
          </div>
          <Button variant="subtle" size="sm">
            <Download size={16} />
            <span className="ml-2">Export All</span>
          </Button>
        </div>

        {invoicesQ.isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-[rgba(var(--app-border-subtle))]" />
            ))}
          </div>
        ) : invoicesQ.error ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-[rgba(var(--app-border-subtle))] text-muted">
              <TrendingUp size={28} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Failed to load invoices</h3>
              <p className="mt-1 text-sm text-muted">Please try again later</p>
            </div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-[rgba(var(--app-border-subtle))] text-muted">
              <TrendingUp size={28} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No invoices yet</h3>
              <p className="mt-1 text-sm text-muted">Your invoice history will appear here once you subscribe</p>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-[rgba(var(--app-border-subtle))]">
            <table className="w-full">
              <thead className="bg-[rgb(var(--app-surface-muted))] text-left text-xs font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3">Invoice #</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(var(--app-border-subtle))]">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-[rgba(var(--app-surface-muted),0.4)]">
                    <td className="px-4 py-3 font-medium text-[rgb(var(--app-text-primary))]">
                      {invoice.id}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[rgb(var(--app-text-primary))]">
                      {invoice.amount}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`chip ${
                        invoice.status === 'PAID'
                          ? 'bg-green-500/15 text-green-300'
                          : invoice.status === 'PENDING'
                            ? 'bg-amber-500/15 text-amber-300'
                            : 'bg-red-500/15 text-red-300'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">
                      {invoice.date}
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm">
                        <Download size={14} />
                        <span className="ml-2">Download</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
