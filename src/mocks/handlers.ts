import { http, HttpResponse } from 'msw'

// In-memory data for dev/demo
let vendors = [
  { id: 'v1', companyName: 'Acme Staffing', contactEmail: 'contact@acme.com', status: 'APPROVED' },
]
let workflows = [
  { id: 'w1', name: 'New Candidate Intake', triggerEvent: 'candidate.created', actions: ['email.notify', 'tag.add:new'] },
]
let referrals = [
  { id: 'r1', candidateId: 'c1', referredByUserId: 'u1', bonusAmount: 500, status: 'PENDING' },
]
let plans = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small teams getting started',
    price: 49,
    currency: 'usd',
    interval: 'monthly',
    features: ['Up to 100 candidates', 'Basic reporting', 'Email support'],
    maxUsers: 5,
    maxJobs: 10,
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'For growing recruitment teams',
    price: 99,
    currency: 'usd',
    interval: 'monthly',
    features: ['Unlimited candidates', 'Advanced analytics', 'Priority support', 'Custom workflows'],
    maxUsers: 25,
    maxJobs: 100,
    isPopular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with complex needs',
    price: 299,
    currency: 'usd',
    interval: 'monthly',
    features: ['Everything in Pro', 'White-label solution', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee'],
    maxUsers: 100,
    maxJobs: 1000,
  },
]
let subscription = {
  id: 'sub_123',
  planId: 'pro',
  plan: plans[1],
  status: 'active',
  currentPeriodStart: '2024-01-01T00:00:00Z',
  currentPeriodEnd: '2024-02-01T00:00:00Z',
  cancelAtPeriodEnd: false,
}
let invoices = [
  {
    id: 'inv_001',
    invoiceNumber: 'INV-2024-001',
    amount: 99,
    currency: 'usd',
    status: 'paid',
    dueDate: '2024-01-15T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    paidAt: '2024-01-10T00:00:00Z',
    items: [{ description: 'Professional Plan - Monthly', amount: 99, quantity: 1 }],
  },
  {
    id: 'inv_002',
    invoiceNumber: 'INV-2024-002',
    amount: 99,
    currency: 'usd',
    status: 'pending',
    dueDate: '2024-02-15T00:00:00Z',
    createdAt: '2024-02-01T00:00:00Z',
    items: [{ description: 'Professional Plan - Monthly', amount: 99, quantity: 1 }],
  },
]
let apiKeys = [
  {
    id: 'key_001',
    name: 'Development API Key',
    key: 'sk_test_1234567890abcdef',
    scopes: ['read', 'write'],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'key_002',
    name: 'Production API Key',
    key: 'sk_prod_abcdef1234567890',
    scopes: ['read', 'write', 'delete'],
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
  },
]
let whiteLabelConfig = {
  id: 'wl_001',
  domain: 'demo.recruiting.com',
  logoUrl: 'https://example.com/logo.png',
  brandColor: '#3b82f6',
}

// Minimal seed data for jobs / candidates / clients
let jobs = [
  { id: '6935e052783b573e6642c090', title: 'Frontend Engineer', status: 'OPEN', description: 'React + TypeScript', location: 'Remote' },
  { id: 'job-2', title: 'Backend Engineer', status: 'IN_PROGRESS', description: 'Node + Postgres', location: 'NY' },
]
let candidates = [
  { id: 'cand-1', name: 'Alex Johnson', title: 'Frontend Dev', skills: ['React', 'TS', 'CSS'], summary: 'Building delightful UIs' },
  { id: 'cand-2', name: 'Priya Sharma', title: 'Backend Dev', skills: ['Node', 'SQL', 'API'], summary: 'Scalable services' },
]
let clients = [
  { id: 'cli-1', name: 'Acme Corp', industry: 'Retail', description: 'Omnichannel retail innovator' },
  { id: 'cli-2', name: 'Globex', industry: 'FinTech', description: 'Payments platform' },
]

export const handlers = [
  // Auth login
  http.post('/api/auth/login', async ({ request }: any) => {
    const body = await request.json();
    const { email } = body || {};
    return HttpResponse.json({
      token: 'mock-token',
      user: { id: 'u1', email: email || 'demo@bench.com', name: 'Demo User' },
    });
  }),

  // Jobs (mock minimal endpoints for Kanban)
  http.get('/api/jobs', ({ request }: any) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '50')
    const content = jobs.slice(page * size, page * size + size)
    return HttpResponse.json({ content, totalElements: jobs.length, number: page, size })
  }),
  http.put('/api/jobs/:id', async ({ params, request }: any) => {
    const id = params.id as string
    const body = await request.json()
    const idx = jobs.findIndex((j) => j.id === id)
    if (idx === -1) {
      return HttpResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    jobs[idx] = { ...jobs[idx], ...body }
    return HttpResponse.json(jobs[idx])
  }),

  // Candidates
  http.get('/api/candidates', ({ request }: any) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '50')
    const content = candidates.slice(page * size, page * size + size)
    return HttpResponse.json({ content, totalElements: candidates.length, number: page, size })
  }),

  // Clients
  http.get('/api/clients', ({ request }: any) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '50')
    const content = clients.slice(page * size, page * size + size)
    return HttpResponse.json({ content, totalElements: clients.length, number: page, size })
  }),

  // Reports
  http.get('/api/reports', ({ request }: any) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '50')
    const reports = [
      { id: 'rep-1', name: 'Weekly Hiring Momentum', createdAt: new Date().toISOString() },
      { id: 'rep-2', name: 'Pipeline Health', createdAt: new Date().toISOString() },
    ]
    const content = reports.slice(page * size, page * size + size)
    return HttpResponse.json({ content, totalElements: reports.length, number: page, size })
  }),
  // Vendors
  http.get('/api/vendors', () => {
    return HttpResponse.json(vendors)
  }),
  http.post('/api/vendors', async ({ request }: any) => {
    const body = await request.json()
    const created = { id: `v${Date.now()}`, ...body }
    vendors.push(created)
    return HttpResponse.json(created, { status: 201 })
  }),

  // Workflows
  http.get('/api/workflows', () => {
    return HttpResponse.json(workflows)
  }),
  http.post('/api/workflows', async ({ request }: any) => {
    const body = await request.json()
    const created = { id: `w${Date.now()}`, ...body }
    workflows.push(created)
    return HttpResponse.json(created, { status: 201 })
  }),

  // Referrals
  http.get('/api/referrals', () => {
    return HttpResponse.json(referrals)
  }),
  http.post('/api/referrals', async ({ request }: any) => {
    const body = await request.json()
    const created = { id: `r${Date.now()}`, ...body }
    referrals.push(created)
    return HttpResponse.json(created, { status: 201 })
  }),

  // Billing
  http.get('/api/billing/plans', () => {
    return HttpResponse.json(plans)
  }),
  http.get('/api/billing/subscription', () => {
    return HttpResponse.json(subscription)
  }),
  http.post('/api/billing/subscribe', async ({ request }: any) => {
    const body = await request.json()
    const plan = plans.find(p => p.id === body.planId)
    if (!plan) {
      return HttpResponse.json({ error: 'Plan not found' }, { status: 404 })
    }
    subscription = {
      id: `sub_${Date.now()}`,
      planId: body.planId,
      plan,
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
    }
    return HttpResponse.json(subscription, { status: 201 })
  }),
  http.post('/api/billing/subscription/cancel', () => {
    subscription.cancelAtPeriodEnd = true
    subscription.status = 'canceled'
    return HttpResponse.json({ message: 'Subscription cancelled' })
  }),
  http.get('/api/billing/invoices', ({ request }: any) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const start = page * size
    const end = start + size
    const paginatedInvoices = invoices.slice(start, end)
    return HttpResponse.json({
      content: paginatedInvoices,
      totalElements: invoices.length,
      totalPages: Math.ceil(invoices.length / size),
      number: page,
      size,
    })
  }),

  // API Keys
  http.get('/api/apikeys', () => {
    return HttpResponse.json(apiKeys)
  }),
  http.post('/api/apikeys', async ({ request }: any) => {
    const body = await request.json()
    const created = {
      id: `key_${Date.now()}`,
      ...body,
      key: `sk_${Math.random().toString(36).substring(2, 15)}`,
      isActive: true,
      createdAt: new Date().toISOString(),
    }
    apiKeys.push(created)
    return HttpResponse.json(created, { status: 201 })
  }),
  http.delete('/api/apikeys/:id', ({ params }: any) => {
    const { id } = params
    const index = apiKeys.findIndex(key => key.id === id)
    if (index === -1) {
      return HttpResponse.json({ error: 'API key not found' }, { status: 404 })
    }
    apiKeys.splice(index, 1)
    return HttpResponse.json({ message: 'API key revoked' })
  }),

  // White Label
  http.get('/api/whitelabel', () => {
    return HttpResponse.json(whiteLabelConfig)
  }),
  http.post('/api/whitelabel', async ({ request }: any) => {
    const body = await request.json()
    whiteLabelConfig = { ...whiteLabelConfig, ...body }
    return HttpResponse.json(whiteLabelConfig)
  }),
]
