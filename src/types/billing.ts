export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  maxUsers?: number;
  maxJobs?: number;
  isPopular?: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue' | 'failed';
  dueDate: string;
  createdAt: string;
  paidAt?: string;
  items: InvoiceItem[];
  downloadUrl?: string;
}

export interface InvoiceItem {
  description: string;
  amount: number;
  quantity: number;
}

export interface Subscription {
  id: string;
  planId: string;
  plan: Plan;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  nextBillingDate?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}