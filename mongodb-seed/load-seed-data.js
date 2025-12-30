#!/usr/bin/env node

/**
 * MongoDB Seed Data Loader
 *
 * Loads comprehensive test data with different subscription tiers
 *
 * Usage:
 *   node mongodb-seed/load-seed-data.js
 *   OR
 *   npm run seed:db
 */

const { MongoClient, ObjectId } = require('mongodb');

// MongoDB connection URL (update if needed)
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.MONGODB_DATABASE || 'recruiting_platform';

// Subscription Plans
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

async function loadSeedData() {
  const client = new MongoClient(MONGODB_URL);

  try {
    console.log('🔗 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    const db = client.db(DATABASE_NAME);

    // Clear existing data
    console.log('🗑️  Clearing existing collections...');
    await Promise.all([
      db.collection('organizations').deleteMany({}),
      db.collection('users').deleteMany({}),
      db.collection('candidates').deleteMany({}),
      db.collection('jobs').deleteMany({}),
      db.collection('clients').deleteMany({}),
      db.collection('submissions').deleteMany({}),
      db.collection('timesheets').deleteMany({}),
      db.collection('invoices').deleteMany({}),
      db.collection('placements').deleteMany({}),
    ]);
    console.log('✅ Collections cleared\n');

    // Create Organizations
    console.log('🏢 Creating organizations...');
    const organizations = [
      {
        _id: new ObjectId(),
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
        _id: new ObjectId(),
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
        _id: new ObjectId(),
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
        _id: new ObjectId(),
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

    await db.collection('organizations').insertMany(organizations);
    console.log(`✅ Created ${organizations.length} organizations\n`);

    // Create Users
    console.log('👤 Creating users...');
    const users = [
      // Freemium (1 user)
      {
        _id: new ObjectId(),
        userId: 'user_freemium_admin',
        email: 'admin@freemium-recruiting.com',
        passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        name: 'Free User',
        role: 'ADMIN',
        tenantId: 'tenant_freemium_001',
        organizationId: organizations[0]._id,
        isActive: true,
        permissions: ['read', 'write'],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
      },

      // Starter (3 users)
      {
        _id: new ObjectId(),
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
        _id: new ObjectId(),
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

      // Pro (10 users)
      {
        _id: new ObjectId(),
        userId: 'user_pro_admin',
        email: 'admin@pro-talent.com',
        passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        name: 'Michael Anderson',
        role: 'ADMIN',
        tenantId: 'tenant_pro_001',
        organizationId: organizations[2]._id,
        isActive: true,
        permissions: ['*'],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
      },
      ...Array.from({ length: 9 }, (_, i) => ({
        _id: new ObjectId(),
        userId: `user_pro_${i + 1}`,
        email: `user${i + 1}@pro-talent.com`,
        passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        name: `Pro User ${i + 1}`,
        role: i < 2 ? 'HIRING_MANAGER' : 'RECRUITER',
        tenantId: 'tenant_pro_001',
        organizationId: organizations[2]._id,
        isActive: true,
        permissions: ['read', 'write'],
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
      })),

      // Enterprise (25 users)
      {
        _id: new ObjectId(),
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
        _id: new ObjectId(),
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
      ...Array.from({ length: 23 }, (_, i) => ({
        _id: new ObjectId(),
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

    await db.collection('users').insertMany(users);
    console.log(`✅ Created ${users.length} users\n`);

    // Create Clients
    console.log('🏢 Creating clients...');
    const clients = [
      {
        _id: new ObjectId(),
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
        paymentTerms: 'NET30',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date(),
      },
      ...Array.from({ length: 10 }, (_, i) => ({
        _id: new ObjectId(),
        clientId: `client_enterprise_${String(i + 1).padStart(3, '0')}`,
        name: `Enterprise Client ${i + 1}`,
        tenantId: 'tenant_enterprise_001',
        status: 'active',
        industry: ['Technology', 'Finance', 'Healthcare', 'Manufacturing'][i % 4],
        contactPerson: {
          name: `Contact ${i + 1}`,
          email: `contact${i + 1}@client${i + 1}.com`,
          phone: `+1-555-${String(1000 + i).padStart(4, '0')}`,
        },
        paymentTerms: i % 2 === 0 ? 'NET30' : 'NET45',
        createdAt: new Date('2023-07-01'),
        updatedAt: new Date(),
      })),
    ];

    await db.collection('clients').insertMany(clients);
    console.log(`✅ Created ${clients.length} clients\n`);

    // Create Candidates
    console.log('👨‍💼 Creating candidates...');
    const skills = [
      ['Java', 'Spring Boot', 'AWS'],
      ['React', 'TypeScript', 'Node.js'],
      ['Python', 'Django', 'PostgreSQL'],
      ['.NET', 'C#', 'Azure'],
      ['Angular', 'RxJS', 'Firebase'],
    ];

    const candidates = [
      // Freemium (10 candidates)
      ...Array.from({ length: 10 }, (_, i) => ({
        _id: new ObjectId(),
        candidateId: `cand_freemium_${String(i + 1).padStart(3, '0')}`,
        firstName: 'Freemium',
        lastName: `Candidate ${i + 1}`,
        email: `candidate${i + 1}@freemium.test`,
        phone: `+1-555-2${String(i).padStart(3, '0')}`,
        tenantId: 'tenant_freemium_001',
        status: 'NEW',
        skills: skills[i % skills.length],
        totalExperience: 3 + (i % 10),
        resumeUrl: `/uploads/resumes/freemium_${i + 1}.pdf`,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date(),
      })),

      // Pro (50 candidates)
      ...Array.from({ length: 50 }, (_, i) => ({
        _id: new ObjectId(),
        candidateId: `cand_pro_${String(i + 1).padStart(3, '0')}`,
        firstName: 'Pro',
        lastName: `Candidate ${i + 1}`,
        email: `candidate${i + 1}@pro.test`,
        phone: `+1-555-3${String(i).padStart(3, '0')}`,
        tenantId: 'tenant_pro_001',
        status: ['NEW', 'SCREENING', 'QUALIFIED', 'ACTIVE'][i % 4],
        skills: skills[i % skills.length],
        totalExperience: 2 + (i % 15),
        resumeUrl: `/uploads/resumes/pro_${i + 1}.pdf`,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date(),
      })),

      // Enterprise (100 candidates)
      ...Array.from({ length: 100 }, (_, i) => ({
        _id: new ObjectId(),
        candidateId: `cand_enterprise_${String(i + 1).padStart(3, '0')}`,
        firstName: 'Enterprise',
        lastName: `Candidate ${i + 1}`,
        email: `candidate${i + 1}@enterprise.test`,
        phone: `+1-555-4${String(i).padStart(3, '0')}`,
        tenantId: 'tenant_enterprise_001',
        status: ['NEW', 'SCREENING', 'QUALIFIED', 'ACTIVE', 'SUBMITTED'][i % 5],
        skills: skills[i % skills.length],
        totalExperience: 1 + (i % 20),
        resumeUrl: `/uploads/resumes/enterprise_${i + 1}.pdf`,
        createdAt: new Date('2023-07-01'),
        updatedAt: new Date(),
      })),
    ];

    await db.collection('candidates').insertMany(candidates);
    console.log(`✅ Created ${candidates.length} candidates\n`);

    // Print Summary
    console.log('='.repeat(60));
    console.log('SEED DATA SUMMARY');
    console.log('='.repeat(60));
    console.log(`\n📊 Organizations: ${organizations.length}`);
    organizations.forEach((org, i) => {
      const userCount = users.filter((u) => u.tenantId === org.tenantId).length;
      const candCount = candidates.filter((c) => c.tenantId === org.tenantId).length;
      console.log(`  ${i + 1}. ${org.name}`);
      console.log(`     - Tier: ${org.subscription.tier.toUpperCase()}`);
      console.log(`     - Price: $${org.subscription.price}/month`);
      console.log(`     - Tenant ID: ${org.tenantId}`);
      console.log(
        `     - Users: ${userCount}/${
          org.subscription.features.maxUsers === -1 ? '∞' : org.subscription.features.maxUsers
        }`
      );
      console.log(
        `     - Candidates: ${candCount}/${
          org.subscription.features.maxCandidates === -1 ? '∞' : org.subscription.features.maxCandidates
        }`
      );
      console.log(`     - Workflows: ${org.subscription.features.canAccessWorkflows ? '✅' : '❌'}`);
      console.log(`     - AI Features: ${org.subscription.features.canAccessAI ? '✅' : '❌'}`);
      console.log(`     - Invoicing: ${org.subscription.features.canAccessInvoicing ? '✅' : '❌'}`);
      console.log('');
    });

    console.log(`\n👤 Total Users: ${users.length}`);
    console.log(`👨‍💼 Total Candidates: ${candidates.length}`);
    console.log(`🏢 Total Clients: ${clients.length}`);

    console.log('\n' + '='.repeat(60));
    console.log('TEST LOGIN CREDENTIALS (All passwords: Test@1234)');
    console.log('='.repeat(60));
    console.log('\n1. Freemium Tier:');
    console.log('   Email: admin@freemium-recruiting.com');
    console.log('   Features: Basic only, 1 user limit');

    console.log('\n2. Starter Tier:');
    console.log('   Email: admin@starter-staffing.com');
    console.log('   Features: Advanced reports, chat, timesheets');

    console.log('\n3. Pro Tier:');
    console.log('   Email: admin@pro-talent.com');
    console.log('   Features: All features including AI and workflows');

    console.log('\n4. Enterprise Tier:');
    console.log('   Email: admin@enterprise-group.com');
    console.log('   Features: All features + SSO, API access, custom branding');

    console.log('\n' + '='.repeat(60));
    console.log('✅ SEED DATA LOADED SUCCESSFULLY!');
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('❌ Error loading seed data:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Run if called directly
if (require.main === module) {
  loadSeedData().catch(console.error);
}

module.exports = { loadSeedData };
