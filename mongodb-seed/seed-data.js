/**
 * MongoDB Seed Data Script
 *
 * Creates comprehensive test data with different subscription tiers:
 * - Freemium: Limited features, 1 user
 * - Starter: Basic features, up to 5 users
 * - Pro: Advanced features, up to 20 users
 * - Enterprise: All features, unlimited users
 *
 * Usage:
 *   mongosh mongodb://localhost:27017/recruiting_platform < seed-data.js
 *   OR
 *   node mongodb-seed/load-seed-data.js
 */

// Switch to database
db = db.getSiblingDB('recruiting_platform');

// Clear existing data (optional - comment out to preserve existing data)
print('Clearing existing collections...');
db.organizations.deleteMany({});
db.users.deleteMany({});
db.candidates.deleteMany({});
db.jobs.deleteMany({});
db.clients.deleteMany({});
db.submissions.deleteMany({});
db.timesheets.deleteMany({});
db.invoices.deleteMany({});
db.placements.deleteMany({});

print('Creating seed data...\n');

// ==================== Subscription Plans ====================
const SUBSCRIPTION_PLANS = {
  FREEMIUM: {
    name: 'Freemium',
    tier: 'freemium',
    price: 0,
    billingCycle: 'monthly',
    features: {
      maxUsers: 1,
      maxCandidates: 50,
      maxJobs: 5,
      maxClients: 3,
      canAccessAdvancedReports: false,
      canAccessWorkflows: false,
      canAccessAI: false,
      canAccessInternalChat: false,
      canAccessTimesheets: false,
      canAccessInvoicing: false,
      storageGB: 1,
    },
  },
  STARTER: {
    name: 'Starter',
    tier: 'starter',
    price: 49,
    billingCycle: 'monthly',
    features: {
      maxUsers: 5,
      maxCandidates: 500,
      maxJobs: 50,
      maxClients: 25,
      canAccessAdvancedReports: true,
      canAccessWorkflows: false,
      canAccessAI: false,
      canAccessInternalChat: true,
      canAccessTimesheets: true,
      canAccessInvoicing: false,
      storageGB: 10,
    },
  },
  PRO: {
    name: 'Pro',
    tier: 'pro',
    price: 149,
    billingCycle: 'monthly',
    features: {
      maxUsers: 20,
      maxCandidates: -1, // unlimited
      maxJobs: -1,
      maxClients: -1,
      canAccessAdvancedReports: true,
      canAccessWorkflows: true,
      canAccessAI: true,
      canAccessInternalChat: true,
      canAccessTimesheets: true,
      canAccessInvoicing: true,
      storageGB: 100,
    },
  },
  ENTERPRISE: {
    name: 'Enterprise',
    tier: 'enterprise',
    price: 499,
    billingCycle: 'monthly',
    features: {
      maxUsers: -1, // unlimited
      maxCandidates: -1,
      maxJobs: -1,
      maxClients: -1,
      canAccessAdvancedReports: true,
      canAccessWorkflows: true,
      canAccessAI: true,
      canAccessInternalChat: true,
      canAccessTimesheets: true,
      canAccessInvoicing: true,
      canAccessCustomBranding: true,
      canAccessAPI: true,
      canAccessSSO: true,
      storageGB: 1000,
    },
  },
};

// ==================== Organizations ====================
print('Creating organizations...');

const organizations = [
  {
    _id: ObjectId(),
    name: 'Freemium Recruiting Inc.',
    tenantId: 'tenant_freemium_001',
    subscription: SUBSCRIPTION_PLANS.FREEMIUM,
    subscriptionStartDate: new Date('2024-01-01'),
    subscriptionStatus: 'active',
    settings: {
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
    },
    branding: {
      primaryColor: '#3b82f6',
      logoUrl: null,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  },
  {
    _id: ObjectId(),
    name: 'Starter Staffing Solutions',
    tenantId: 'tenant_starter_001',
    subscription: SUBSCRIPTION_PLANS.STARTER,
    subscriptionStartDate: new Date('2024-02-01'),
    subscriptionStatus: 'active',
    settings: {
      timezone: 'America/Los_Angeles',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
    },
    branding: {
      primaryColor: '#8b5cf6',
      logoUrl: null,
    },
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
  },
  {
    _id: ObjectId(),
    name: 'Pro Talent Agency',
    tenantId: 'tenant_pro_001',
    subscription: SUBSCRIPTION_PLANS.PRO,
    subscriptionStartDate: new Date('2024-01-15'),
    subscriptionStatus: 'active',
    settings: {
      timezone: 'America/Chicago',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
    },
    branding: {
      primaryColor: '#10b981',
      logoUrl: '/uploads/logos/pro-talent-logo.png',
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
  },
  {
    _id: ObjectId(),
    name: 'Enterprise Recruiting Group',
    tenantId: 'tenant_enterprise_001',
    subscription: SUBSCRIPTION_PLANS.ENTERPRISE,
    subscriptionStartDate: new Date('2023-06-01'),
    subscriptionStatus: 'active',
    settings: {
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
      enableSSO: true,
      ssoProvider: 'okta',
    },
    branding: {
      primaryColor: '#ef4444',
      logoUrl: '/uploads/logos/enterprise-group-logo.png',
      customDomain: 'recruiting.enterprisegroup.com',
    },
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date(),
  },
];

const orgInsertResult = db.organizations.insertMany(organizations);
print(`✅ Created ${Object.keys(orgInsertResult.insertedIds).length} organizations`);

// ==================== Users ====================
print('\nCreating users...');

const users = [
  // Freemium Organization (1 user - limit)
  {
    _id: ObjectId(),
    userId: 'user_freemium_admin',
    email: 'admin@freemium-recruiting.com',
    passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // password: Test@1234
    name: 'Free User',
    role: 'ADMIN',
    tenantId: 'tenant_freemium_001',
    organizationId: organizations[0]._id,
    isActive: true,
    permissions: ['read', 'write'],
    settings: {
      emailNotifications: true,
      theme: 'dark',
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
  },

  // Starter Organization (5 users)
  {
    _id: ObjectId(),
    userId: 'user_starter_admin',
    email: 'admin@starter-staffing.com',
    passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    name: 'Sarah Admin',
    role: 'ADMIN',
    tenantId: 'tenant_starter_001',
    organizationId: organizations[1]._id,
    isActive: true,
    permissions: ['read', 'write', 'delete', 'manage_users'],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
  },
  {
    _id: ObjectId(),
    userId: 'user_starter_recruiter1',
    email: 'recruiter1@starter-staffing.com',
    passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    name: 'Tom Recruiter',
    role: 'RECRUITER',
    tenantId: 'tenant_starter_001',
    organizationId: organizations[1]._id,
    isActive: true,
    permissions: ['read', 'write'],
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
  },
  {
    _id: ObjectId(),
    userId: 'user_starter_recruiter2',
    email: 'recruiter2@starter-staffing.com',
    passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    name: 'Lisa Recruiter',
    role: 'RECRUITER',
    tenantId: 'tenant_starter_001',
    organizationId: organizations[1]._id,
    isActive: true,
    permissions: ['read', 'write'],
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
  },

  // Pro Organization (10 users)
  {
    _id: ObjectId(),
    userId: 'user_pro_admin',
    email: 'admin@pro-talent.com',
    passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    name: 'Michael Anderson',
    role: 'ADMIN',
    tenantId: 'tenant_pro_001',
    organizationId: organizations[2]._id,
    isActive: true,
    permissions: ['*'], // all permissions
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
  },
  {
    _id: ObjectId(),
    userId: 'user_pro_manager1',
    email: 'manager1@pro-talent.com',
    passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    name: 'Jennifer Manager',
    role: 'HIRING_MANAGER',
    tenantId: 'tenant_pro_001',
    organizationId: organizations[2]._id,
    isActive: true,
    permissions: ['read', 'write', 'approve'],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
  },
  // ... Additional Pro users (8 more recruiters)
  ...Array.from({ length: 8 }, (_, i) => ({
    _id: ObjectId(),
    userId: `user_pro_recruiter${i + 1}`,
    email: `recruiter${i + 1}@pro-talent.com`,
    passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    name: `Recruiter ${i + 1}`,
    role: 'RECRUITER',
    tenantId: 'tenant_pro_001',
    organizationId: organizations[2]._id,
    isActive: true,
    permissions: ['read', 'write'],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
  })),

  // Enterprise Organization (25 users)
  {
    _id: ObjectId(),
    userId: 'user_enterprise_admin',
    email: 'admin@enterprise-group.com',
    passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    name: 'Robert Enterprise Admin',
    role: 'ADMIN',
    tenantId: 'tenant_enterprise_001',
    organizationId: organizations[3]._id,
    isActive: true,
    permissions: ['*'],
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
  },
  {
    _id: ObjectId(),
    userId: 'user_enterprise_finance',
    email: 'finance@enterprise-group.com',
    passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    name: 'Patricia Finance',
    role: 'FINANCE_MANAGER',
    tenantId: 'tenant_enterprise_001',
    organizationId: organizations[3]._id,
    isActive: true,
    permissions: ['read', 'write', 'approve_invoices', 'view_financials'],
    createdAt: new Date('2023-06-05'),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
  },
  // ... Additional Enterprise users (23 more)
  ...Array.from({ length: 23 }, (_, i) => ({
    _id: ObjectId(),
    userId: `user_enterprise_${i + 1}`,
    email: `user${i + 1}@enterprise-group.com`,
    passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    name: `Enterprise User ${i + 1}`,
    role: i < 5 ? 'HIRING_MANAGER' : i < 15 ? 'RECRUITER' : 'COORDINATOR',
    tenantId: 'tenant_enterprise_001',
    organizationId: organizations[3]._id,
    isActive: true,
    permissions: i < 5 ? ['read', 'write', 'approve'] : ['read', 'write'],
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
  })),
];

const userInsertResult = db.users.insertMany(users);
print(`✅ Created ${Object.keys(userInsertResult.insertedIds).length} users`);

// ==================== Clients ====================
print('\nCreating clients...');

const clients = [
  // Pro Organization clients
  {
    _id: ObjectId(),
    clientId: 'client_pro_001',
    name: 'Acme Corporation',
    tenantId: 'tenant_pro_001',
    status: 'active',
    industry: 'Technology',
    contactPerson: {
      name: 'John Client',
      email: 'john@acme-corp.com',
      phone: '+1-555-0101',
    },
    address: {
      street: '123 Tech Street',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      country: 'USA',
    },
    paymentTerms: 'NET30',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
  },
  {
    _id: ObjectId(),
    clientId: 'client_pro_002',
    name: 'Global Solutions Inc',
    tenantId: 'tenant_pro_001',
    status: 'active',
    industry: 'Finance',
    contactPerson: {
      name: 'Jane Client',
      email: 'jane@global-solutions.com',
      phone: '+1-555-0102',
    },
    paymentTerms: 'NET45',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date(),
  },

  // Enterprise Organization clients
  ...Array.from({ length: 10 }, (_, i) => ({
    _id: ObjectId(),
    clientId: `client_enterprise_${String(i + 1).padStart(3, '0')}`,
    name: `Enterprise Client ${i + 1}`,
    tenantId: 'tenant_enterprise_001',
    status: 'active',
    industry: ['Technology', 'Finance', 'Healthcare', 'Manufacturing'][i % 4],
    contactPerson: {
      name: `Contact Person ${i + 1}`,
      email: `contact${i + 1}@client${i + 1}.com`,
      phone: `+1-555-${String(1000 + i).padStart(4, '0')}`,
    },
    paymentTerms: i % 2 === 0 ? 'NET30' : 'NET45',
    createdAt: new Date('2023-07-01'),
    updatedAt: new Date(),
  })),
];

const clientInsertResult = db.clients.insertMany(clients);
print(`✅ Created ${Object.keys(clientInsertResult.insertedIds).length} clients`);

// ==================== Candidates ====================
print('\nCreating candidates...');

const candidateSkills = [
  ['Java', 'Spring Boot', 'Microservices', 'AWS'],
  ['React', 'TypeScript', 'Node.js', 'MongoDB'],
  ['Python', 'Django', 'PostgreSQL', 'Docker'],
  ['.NET Core', 'C#', 'Azure', 'SQL Server'],
  ['Angular', 'RxJS', 'NgRx', 'Firebase'],
];

const candidates = [
  // Freemium candidates (limit: 50)
  ...Array.from({ length: 10 }, (_, i) => ({
    _id: ObjectId(),
    candidateId: `cand_freemium_${String(i + 1).padStart(3, '0')}`,
    firstName: `Freemium`,
    lastName: `Candidate ${i + 1}`,
    email: `candidate${i + 1}@freemium.test`,
    phone: `+1-555-${String(2000 + i).padStart(4, '0')}`,
    tenantId: 'tenant_freemium_001',
    status: 'NEW',
    skills: candidateSkills[i % candidateSkills.length],
    totalExperience: 3 + (i % 10),
    currentLocation: { city: 'New York', state: 'NY', country: 'USA' },
    resumeUrl: `/uploads/resumes/freemium_${i + 1}.pdf`,
    source: 'LinkedIn',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date(),
  })),

  // Pro candidates (unlimited)
  ...Array.from({ length: 50 }, (_, i) => ({
    _id: ObjectId(),
    candidateId: `cand_pro_${String(i + 1).padStart(3, '0')}`,
    firstName: `Pro`,
    lastName: `Candidate ${i + 1}`,
    email: `candidate${i + 1}@pro.test`,
    phone: `+1-555-${String(3000 + i).padStart(4, '0')}`,
    tenantId: 'tenant_pro_001',
    status: ['NEW', 'SCREENING', 'QUALIFIED', 'ACTIVE'][i % 4],
    skills: candidateSkills[i % candidateSkills.length],
    totalExperience: 2 + (i % 15),
    currentLocation: { city: 'Chicago', state: 'IL', country: 'USA' },
    resumeUrl: `/uploads/resumes/pro_${i + 1}.pdf`,
    source: i % 3 === 0 ? 'LinkedIn' : i % 3 === 1 ? 'Indeed' : 'Referral',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
  })),

  // Enterprise candidates (unlimited)
  ...Array.from({ length: 100 }, (_, i) => ({
    _id: ObjectId(),
    candidateId: `cand_enterprise_${String(i + 1).padStart(3, '0')}`,
    firstName: `Enterprise`,
    lastName: `Candidate ${i + 1}`,
    email: `candidate${i + 1}@enterprise.test`,
    phone: `+1-555-${String(4000 + i).padStart(4, '0')}`,
    tenantId: 'tenant_enterprise_001',
    status: ['NEW', 'SCREENING', 'QUALIFIED', 'ACTIVE', 'SUBMITTED', 'INTERVIEWING'][i % 6],
    skills: candidateSkills[i % candidateSkills.length],
    totalExperience: 1 + (i % 20),
    currentLocation: { city: 'New York', state: 'NY', country: 'USA' },
    resumeUrl: `/uploads/resumes/enterprise_${i + 1}.pdf`,
    source: i % 4 === 0 ? 'LinkedIn' : i % 4 === 1 ? 'Indeed' : i % 4 === 2 ? 'Referral' : 'Career Site',
    createdAt: new Date('2023-07-01'),
    updatedAt: new Date(),
  })),
];

const candidateInsertResult = db.candidates.insertMany(candidates);
print(`✅ Created ${Object.keys(candidateInsertResult.insertedIds).length} candidates`);

// ==================== Summary ====================
print('\n' + '='.repeat(60));
print('SEED DATA SUMMARY');
print('='.repeat(60));
print(`\n📊 Organizations: ${organizations.length}`);
organizations.forEach((org, i) => {
  const userCount = users.filter(u => u.tenantId === org.tenantId).length;
  const candCount = candidates.filter(c => c.tenantId === org.tenantId).length;
  print(`  ${i + 1}. ${org.name}`);
  print(`     - Tier: ${org.subscription.tier.toUpperCase()}`);
  print(`     - Price: $${org.subscription.price}/month`);
  print(`     - Tenant ID: ${org.tenantId}`);
  print(`     - Users: ${userCount}/${org.subscription.features.maxUsers === -1 ? '∞' : org.subscription.features.maxUsers}`);
  print(`     - Candidates: ${candCount}/${org.subscription.features.maxCandidates === -1 ? '∞' : org.subscription.features.maxCandidates}`);
  print(`     - Workflows: ${org.subscription.features.canAccessWorkflows ? '✅' : '❌'}`);
  print(`     - AI Features: ${org.subscription.features.canAccessAI ? '✅' : '❌'}`);
  print(`     - Invoicing: ${org.subscription.features.canAccessInvoicing ? '✅' : '❌'}`);
  print('');
});

print(`\n👤 Total Users: ${users.length}`);
print(`👨‍💼 Total Candidates: ${candidates.length}`);
print(`🏢 Total Clients: ${clients.length}`);

print('\n' + '='.repeat(60));
print('TEST LOGIN CREDENTIALS (All passwords: Test@1234)');
print('='.repeat(60));
print('\n1. Freemium Tier:');
print('   Email: admin@freemium-recruiting.com');
print('   Features: Basic only, 1 user limit');

print('\n2. Starter Tier:');
print('   Email: admin@starter-staffing.com');
print('   Features: Advanced reports, chat, timesheets');

print('\n3. Pro Tier:');
print('   Email: admin@pro-talent.com');
print('   Features: All features including AI and workflows');

print('\n4. Enterprise Tier:');
print('   Email: admin@enterprise-group.com');
print('   Features: All features + SSO, API access, custom branding');

print('\n' + '='.repeat(60));
print('✅ SEED DATA LOADED SUCCESSFULLY!');
print('='.repeat(60) + '\n');
