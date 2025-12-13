import { useMemo, useState } from 'react';
import { billingService, type BillingPlan, type Invoice, type Subscription } from '../services/billing.service';
import { toast } from 'react-hot-toast';
import Table from '../components/common/Table';
import { useList } from '../services/hooks';

export default function Billing() {
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

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Billing & Subscriptions</h1>

      {/* Current Subscription */}
      {subscription && (
        <div className="mb-6 p-4 border rounded-lg bg-blue-50">
          <h2 className="text-lg font-semibold mb-2">Current Subscription</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">Plan</div>
              <div className="font-medium">{subscription.planId}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Status</div>
              <div className="font-medium capitalize">{subscription.status.toLowerCase()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Current Period</div>
              <div className="font-medium">
                {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Auto-renew</div>
              <div className="font-medium">{subscription.cancelAtPeriodEnd ? 'No' : 'Yes'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Plans */}
      <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
      {plansQ.isLoading ? (
        <div className="text-center py-8">Loading plans...</div>
      ) : plansQ.error ? (
        <div className="text-center py-8 text-red-600">Failed to load plans</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {plans.map(plan => (
            <div key={plan.id} className="border rounded-lg p-6">
              <div className="font-semibold text-lg mb-2">{plan.name}</div>
              <div className="text-2xl font-bold text-blue-600 mb-4">{plan.price}</div>
              <ul className="mb-6 space-y-1">
                {plan.features.map((feature, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className="w-full btn btn-primary"
                onClick={() => handlePlanSelect(plan.id)}
                disabled={selectedPlan === plan.id}
              >
                {selectedPlan === plan.id ? 'Processing...' : `Choose ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Invoices */}
      <h2 className="text-lg font-semibold mb-4">Invoice History</h2>
      {invoicesQ.isLoading ? (
        <div className="text-center py-8">Loading invoices...</div>
      ) : invoicesQ.error ? (
        <div className="text-center py-8 text-red-600">Failed to load invoices</div>
      ) : (
        <Table
          columns={[
            { key: 'id', title: 'Invoice #' },
            { key: 'amount', title: 'Amount' },
            { key: 'status', title: 'Status' },
            { key: 'date', title: 'Date' },
          ]}
          data={invoices}
          emptyText="No invoices yet."
        />
      )}
    </div>
  );
}
