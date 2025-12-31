import { useState, useMemo } from 'react';
import { Plus, Send, Eye, Download, DollarSign, AlertCircle, CheckCircle, Clock, Filter, Search } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import type { Invoice, InvoiceStatus, InvoiceType, InvoiceLineItem } from '../types/staffing';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import toast from 'react-hot-toast';

// Mock data
const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2025-001',
    organizationId: 'org-1',
    type: 'client_billing',
    clientId: 'client-1',
    clientName: 'Tech Corp Inc',
    clientEmail: 'billing@techcorp.com',
    clientAddress: '123 Tech Street, San Francisco, CA 94105',
    issueDate: '2025-12-23',
    dueDate: '2026-01-22',
    paymentTerms: 'net_30',
    status: 'sent',
    lineItems: [
      {
        id: 'li1',
        description: 'Software Development Services - Michael Rodriguez',
        quantity: 40,
        unitPrice: 75,
        totalPrice: 3000,
        candidateName: 'Michael Rodriguez',
        timesheetId: 'ts-1',
        weekEnding: '2025-12-20',
        hoursWorked: 40,
      },
      {
        id: 'li2',
        description: 'Placement Fee - Senior Engineer',
        quantity: 1,
        unitPrice: 5000,
        totalPrice: 5000,
      },
    ],
    subtotal: 8000,
    taxRate: 8.5,
    taxAmount: 680,
    discount: 0,
    discountType: 'fixed',
    totalAmount: 8680,
    amountPaid: 0,
    amountDue: 8680,
    payments: [],
    notes: 'Payment due within 30 days. Thank you for your business!',
    pdfUrl: '#',
    sentAt: '2025-12-23T10:00:00Z',
    createdBy: 'user-1',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    invoiceNumber: 'INV-2025-002',
    organizationId: 'org-1',
    type: 'client_billing',
    clientId: 'client-2',
    clientName: 'HealthCare Systems',
    clientEmail: 'ap@healthcare.com',
    issueDate: '2025-12-30',
    dueDate: '2026-01-14',
    paymentTerms: 'net_15',
    status: 'draft',
    lineItems: [
      {
        id: 'li3',
        description: 'IT Support Services - Lisa Anderson',
        quantity: 35,
        unitPrice: 65,
        totalPrice: 2275,
        candidateName: 'Lisa Anderson',
        weekEnding: '2025-12-27',
        hoursWorked: 35,
      },
    ],
    subtotal: 2275,
    taxRate: 8.5,
    taxAmount: 193.38,
    discount: 0,
    discountType: 'fixed',
    totalAmount: 2468.38,
    amountPaid: 0,
    amountDue: 2468.38,
    payments: [],
    createdBy: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function InvoiceManagementPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch =
        invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.vendorName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      const matchesType = typeFilter === 'all' || invoice.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [invoices, searchQuery, statusFilter, typeFilter]);

  const totals = useMemo(() => {
    return filteredInvoices.reduce(
      (acc, inv) => {
        acc.total += inv.totalAmount;
        acc.paid += inv.amountPaid;
        acc.due += inv.amountDue;
        return acc;
      },
      { total: 0, paid: 0, due: 0 }
    );
  }, [filteredInvoices]);

  const handleSendInvoice = (invoice: Invoice) => {
    const updatedInvoice = {
      ...invoice,
      status: 'sent' as InvoiceStatus,
      sentAt: new Date().toISOString(),
    };
    setInvoices(invoices.map((inv) => (inv.id === invoice.id ? updatedInvoice : inv)));
    toast.success(`Invoice ${invoice.invoiceNumber} sent to ${invoice.clientName}`);
  };

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500/10 text-gray-500';
      case 'sent':
        return 'bg-blue-500/10 text-blue-500';
      case 'viewed':
        return 'bg-purple-500/10 text-purple-500';
      case 'partial_paid':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'paid':
        return 'bg-green-500/10 text-green-500';
      case 'overdue':
        return 'bg-red-500/10 text-red-500';
      case 'cancelled':
        return 'bg-gray-500/10 text-gray-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getStatusIcon = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return <CheckCircle size={16} />;
      case 'overdue':
        return <AlertCircle size={16} />;
      case 'sent':
      case 'viewed':
        return <Clock size={16} />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: InvoiceType) => {
    switch (type) {
      case 'client_billing':
        return '💰';
      case 'vendor_payment':
        return '📤';
      case 'contractor_payment':
        return '👤';
      default:
        return '📄';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoice Management"
        subtitle="Generate, track, and manage client invoices"
        actions={
          <Button variant="primary">
            <Plus size={16} />
            <span className="ml-2">New Invoice</span>
          </Button>
        }
      />

      {/* Financial Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Total Invoiced</span>
              <DollarSign size={16} className="text-muted" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${totals.total.toLocaleString()}</p>
            <p className="text-sm text-muted mt-1">{filteredInvoices.length} invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Paid</span>
              <CheckCircle size={16} className="text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">${totals.paid.toLocaleString()}</p>
            <p className="text-sm text-muted mt-1">
              {invoices.filter((i) => i.status === 'paid').length} paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Outstanding</span>
              <AlertCircle size={16} className="text-orange-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-500">${totals.due.toLocaleString()}</p>
            <p className="text-sm text-muted mt-1">
              {invoices.filter((i) => ['sent', 'viewed', 'overdue'].includes(i.status)).length} pending
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Invoices List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Invoices ({filteredInvoices.length})</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pl-10 w-48"
                  />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-32">
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredInvoices.map((invoice) => (
                <motion.div
                  key={invoice.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedInvoice(invoice)}
                  className={clsx(
                    'p-4 rounded-lg border transition cursor-pointer',
                    selectedInvoice?.id === invoice.id
                      ? 'border-[rgb(var(--app-primary))] bg-[rgba(var(--app-primary),0.05)]'
                      : 'border-[rgba(var(--app-border-subtle))] hover:border-[rgba(var(--app-primary),0.3)]'
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getTypeIcon(invoice.type)}</span>
                        <h4 className="font-semibold">{invoice.invoiceNumber}</h4>
                        <span className={clsx('chip text-xs flex items-center gap-1', getStatusColor(invoice.status))}>
                          {getStatusIcon(invoice.status)}
                          {invoice.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-muted">
                        {invoice.clientName || invoice.vendorName || invoice.contractorName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">${invoice.totalAmount.toLocaleString()}</p>
                      {invoice.amountDue > 0 && (
                        <p className="text-xs text-orange-500">Due: ${invoice.amountDue.toLocaleString()}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-muted">
                      <span>📅 {new Date(invoice.issueDate).toLocaleDateString()}</span>
                      <span>⏰ Due {new Date(invoice.dueDate).toLocaleDateString()}</span>
                      <span>{invoice.lineItems.length} items</span>
                    </div>
                    {invoice.status === 'draft' && (
                      <Button variant="subtle" size="sm" onClick={() => handleSendInvoice(invoice)}>
                        <Send size={14} />
                        <span className="ml-1">Send</span>
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}

              {filteredInvoices.length === 0 && (
                <div className="text-center py-12 text-muted">
                  <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No invoices found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Invoice Details */}
        <div className="space-y-4">
          {selectedInvoice ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Invoice Details</CardTitle>
                    <div className="flex gap-1">
                      <Button variant="subtle" size="sm">
                        <Eye size={14} />
                      </Button>
                      <Button variant="subtle" size="sm">
                        <Download size={14} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-semibold text-lg mb-1">{selectedInvoice.invoiceNumber}</h5>
                      <span className={clsx('chip inline-flex items-center gap-1', getStatusColor(selectedInvoice.status))}>
                        {getStatusIcon(selectedInvoice.status)}
                        {selectedInvoice.status.toUpperCase().replace('_', ' ')}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-muted mb-1">BILL TO</p>
                      <p className="font-medium">{selectedInvoice.clientName || selectedInvoice.vendorName}</p>
                      {selectedInvoice.clientEmail && (
                        <p className="text-sm text-muted">{selectedInvoice.clientEmail}</p>
                      )}
                      {selectedInvoice.clientAddress && (
                        <p className="text-sm text-muted">{selectedInvoice.clientAddress}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted">Issue Date</p>
                        <p className="font-medium">{new Date(selectedInvoice.issueDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted">Due Date</p>
                        <p className="font-medium">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted">Terms</p>
                        <p className="font-medium">{selectedInvoice.paymentTerms.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-muted">Type</p>
                        <p className="font-medium capitalize">{selectedInvoice.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Line Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedInvoice.lineItems.map((item) => (
                      <div key={item.id} className="pb-3 border-b border-[rgba(var(--app-border-subtle))] last:border-0">
                        <div className="flex justify-between mb-1">
                          <p className="text-sm font-medium">{item.description}</p>
                          <p className="text-sm font-semibold">${item.totalPrice.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted">
                          {item.hoursWorked && <span>{item.hoursWorked}h</span>}
                          {item.unitPrice && <span>@ ${item.unitPrice}/hr</span>}
                          {item.weekEnding && <span>Week ending {item.weekEnding}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Payment Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Subtotal</span>
                      <span className="font-medium">${selectedInvoice.subtotal.toLocaleString()}</span>
                    </div>
                    {selectedInvoice.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Discount</span>
                        <span className="font-medium text-green-500">
                          -{selectedInvoice.discountType === 'percentage' ? `${selectedInvoice.discount}%` : `$${selectedInvoice.discount}`}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Tax ({selectedInvoice.taxRate}%)</span>
                      <span className="font-medium">${selectedInvoice.taxAmount.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-[rgba(var(--app-border-subtle))] pt-2 flex justify-between">
                      <span className="font-semibold">Total Amount</span>
                      <span className="text-xl font-bold">${selectedInvoice.totalAmount.toLocaleString()}</span>
                    </div>
                    {selectedInvoice.amountPaid > 0 && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted">Amount Paid</span>
                          <span className="font-medium text-green-500">${selectedInvoice.amountPaid.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Amount Due</span>
                          <span className="text-lg font-bold text-orange-500">
                            ${selectedInvoice.amountDue.toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {selectedInvoice.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted">{selectedInvoice.notes}</p>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted">
                <p>Select an invoice to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
