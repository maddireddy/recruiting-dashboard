/**
 * MongoDB Seed Script for Recruiting Dashboard
 *
 * This script seeds the database with comprehensive test data
 * Run with: node backend-seed/seed-database.js
 */

const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/recruiting';
const DB_NAME = 'recruiting';

// Helper to hash passwords
async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

// Generate ObjectId
function oid() {
  return new ObjectId();
}

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('🔗 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(DB_NAME);

    // Clear existing data
    console.log('\n🗑️  Clearing existing data...');
    await db.collection('organizations').deleteMany({});
    await db.collection('users').deleteMany({});
    await db.collection('candidates').deleteMany({});
    await db.collection('jobs').deleteMany({});
    await db.collection('interviews').deleteMany({});
    await db.collection('workflows').deleteMany({});
    await db.collection('workflow_instances').deleteMany({});
    await db.collection('notifications').deleteMany({});
    await db.collection('email_templates').deleteMany({});
    console.log('✅ Cleared existing data');

    // ==============================================
    // 1. ORGANIZATIONS
    // ==============================================
    console.log('\n📊 Seeding organizations...');

    const orgIds = {
      acme: oid(),
      techcorp: oid(),
      startup: oid(),
    };

    const organizations = [
      {
        _id: orgIds.acme,
        name: 'ACME Corporation',
        slug: 'acme-corp',
        logo: 'https://via.placeholder.com/200',
        primaryColor: '#3B82F6',
        website: 'https://acme-corp.com',
        email: 'contact@acme-corp.com',
        phone: '+1-555-0100',
        address: {
          street: '123 Business St',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105',
          country: 'USA',
        },
        subscription: {
          plan: 'pro',
          status: 'active',
          currentPeriodStart: new Date('2024-12-01'),
          currentPeriodEnd: new Date('2025-12-01'),
          stripeCustomerId: 'cus_test_acme',
          stripeSubscriptionId: 'sub_test_acme',
        },
        limits: {
          users: 50,
          candidates: 10000,
          jobs: 100,
          storage: 10737418240, // 10GB
        },
        usage: {
          users: 5,
          candidates: 156,
          jobs: 12,
          storage: 2147483648, // 2GB
        },
        settings: {
          candidatePortalEnabled: true,
          publicJobsEnabled: true,
          requireApprovalForJobs: false,
          enableAIFeatures: true,
          emailTemplateCustomization: true,
        },
        status: 'active',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      },
      {
        _id: orgIds.techcorp,
        name: 'TechCorp Inc',
        slug: 'techcorp',
        subscription: {
          plan: 'enterprise',
          status: 'active',
        },
        limits: {
          users: 200,
          candidates: 50000,
          jobs: 500,
          storage: 53687091200, // 50GB
        },
        status: 'active',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date(),
      },
      {
        _id: orgIds.startup,
        name: 'Startup Ventures',
        slug: 'startup-ventures',
        subscription: {
          plan: 'starter',
          status: 'trialing',
        },
        limits: {
          users: 10,
          candidates: 1000,
          jobs: 20,
          storage: 5368709120, // 5GB
        },
        status: 'active',
        createdAt: new Date('2024-11-01'),
        updatedAt: new Date(),
      },
    ];

    await db.collection('organizations').insertMany(organizations);
    console.log(`✅ Created ${organizations.length} organizations`);

    // ==============================================
    // 2. USERS
    // ==============================================
    console.log('\n👥 Seeding users...');

    const userIds = {
      admin: oid(),
      recruiter1: oid(),
      recruiter2: oid(),
      hiringManager: oid(),
      interviewer1: oid(),
      interviewer2: oid(),
    };

    const users = [
      {
        _id: userIds.admin,
        email: 'admin@acme-corp.com',
        password: await hashPassword('Admin123!'),
        name: 'John Admin',
        avatar: 'https://i.pravatar.cc/150?img=12',
        phone: '+1-555-0101',
        role: 'ADMIN',
        permissions: [
          'candidates.view', 'candidates.create', 'candidates.edit', 'candidates.delete',
          'jobs.view', 'jobs.create', 'jobs.edit', 'jobs.delete',
          'interviews.schedule', 'interviews.conduct',
          'reports.view', 'reports.export',
          'settings.manage', 'users.manage',
          'workflows.manage', 'billing.manage',
        ],
        organizationId: orgIds.acme,
        status: 'active',
        emailVerified: true,
        lastLoginAt: new Date(),
        preferences: {
          language: 'en',
          timezone: 'America/Los_Angeles',
          notifications: {
            email: true,
            inApp: true,
            sms: false,
          },
        },
        createdAt: new Date('2024-01-01'),
      },
      {
        _id: userIds.recruiter1,
        email: 'sarah.recruiter@acme-corp.com',
        password: await hashPassword('Recruiter123!'),
        name: 'Sarah Recruiter',
        avatar: 'https://i.pravatar.cc/150?img=5',
        role: 'RECRUITER',
        permissions: [
          'candidates.view', 'candidates.create', 'candidates.edit',
          'jobs.view',
          'interviews.schedule',
        ],
        organizationId: orgIds.acme,
        status: 'active',
        emailVerified: true,
        createdAt: new Date('2024-01-15'),
      },
      {
        _id: userIds.recruiter2,
        email: 'mike.recruiter@acme-corp.com',
        password: await hashPassword('Recruiter123!'),
        name: 'Mike Recruiter',
        avatar: 'https://i.pravatar.cc/150?img=8',
        role: 'RECRUITER',
        permissions: [
          'candidates.view', 'candidates.create', 'candidates.edit',
          'jobs.view',
          'interviews.schedule',
        ],
        organizationId: orgIds.acme,
        status: 'active',
        emailVerified: true,
        createdAt: new Date('2024-02-01'),
      },
      {
        _id: userIds.hiringManager,
        email: 'lisa.manager@acme-corp.com',
        password: await hashPassword('Manager123!'),
        name: 'Lisa Manager',
        avatar: 'https://i.pravatar.cc/150?img=9',
        role: 'HIRING_MANAGER',
        permissions: [
          'candidates.view',
          'jobs.view', 'jobs.create', 'jobs.edit',
          'interviews.schedule', 'interviews.conduct',
          'reports.view',
        ],
        organizationId: orgIds.acme,
        status: 'active',
        emailVerified: true,
        createdAt: new Date('2024-01-10'),
      },
      {
        _id: userIds.interviewer1,
        email: 'tom.tech@acme-corp.com',
        password: await hashPassword('Tech123!'),
        name: 'Tom Tech Lead',
        avatar: 'https://i.pravatar.cc/150?img=13',
        role: 'INTERVIEWER',
        permissions: [
          'candidates.view',
          'interviews.conduct',
        ],
        organizationId: orgIds.acme,
        status: 'active',
        emailVerified: true,
        createdAt: new Date('2024-01-20'),
      },
      {
        _id: userIds.interviewer2,
        email: 'rachel.senior@acme-corp.com',
        password: await hashPassword('Senior123!'),
        name: 'Rachel Senior Engineer',
        avatar: 'https://i.pravatar.cc/150?img=10',
        role: 'INTERVIEWER',
        permissions: [
          'candidates.view',
          'interviews.conduct',
        ],
        organizationId: orgIds.acme,
        status: 'active',
        emailVerified: true,
        createdAt: new Date('2024-03-01'),
      },
    ];

    await db.collection('users').insertMany(users);
    console.log(`✅ Created ${users.length} users`);

    // ==============================================
    // 3. JOBS
    // ==============================================
    console.log('\n💼 Seeding jobs...');

    const jobIds = {
      seniorFrontend: oid(),
      backendEngineer: oid(),
      productManager: oid(),
      dataScientist: oid(),
    };

    const jobs = [
      {
        _id: jobIds.seniorFrontend,
        title: 'Senior Frontend Developer',
        department: 'Engineering',
        location: {
          city: 'San Francisco',
          state: 'CA',
          country: 'USA',
          remote: true,
          hybrid: false,
        },
        description: `We are seeking a talented Senior Frontend Developer to join our growing engineering team. You will be responsible for building and maintaining our customer-facing web applications using modern technologies like React, TypeScript, and Next.js.

In this role, you will work closely with designers, product managers, and backend engineers to deliver exceptional user experiences. You'll have the opportunity to mentor junior developers and contribute to architectural decisions.`,
        responsibilities: [
          'Build and maintain scalable web applications using React and TypeScript',
          'Collaborate with designers to implement pixel-perfect UIs',
          'Mentor junior and mid-level developers',
          'Participate in code reviews and contribute to technical documentation',
          'Optimize application performance and user experience',
          'Work with backend teams to design and consume APIs',
        ],
        requirements: [
          '5+ years of professional frontend development experience',
          'Expert knowledge of React and TypeScript',
          'Strong understanding of web performance optimization',
          'Experience with state management (Redux, Zustand, etc.)',
          'Proficiency with modern CSS and styling solutions',
          'Experience with Git and CI/CD pipelines',
        ],
        niceToHave: [
          'Experience with Next.js or similar SSR frameworks',
          'Knowledge of GraphQL',
          'Familiarity with testing frameworks (Jest, React Testing Library)',
          'Experience with monorepo tools (Turborepo, Nx)',
          'Contributions to open-source projects',
        ],
        employmentType: 'full-time',
        experienceLevel: 'senior',
        yearsOfExperience: {
          min: 5,
          max: 10,
        },
        requiredSkills: [
          { name: 'React', required: true },
          { name: 'TypeScript', required: true },
          { name: 'JavaScript', required: true },
          { name: 'HTML/CSS', required: true },
          { name: 'Node.js', required: false },
        ],
        salary: {
          min: 140000,
          max: 180000,
          currency: 'USD',
          period: 'yearly',
        },
        benefits: [
          'Comprehensive health insurance (medical, dental, vision)',
          '401(k) with company match',
          'Unlimited PTO',
          'Remote work flexibility',
          'Home office stipend',
          'Professional development budget',
          'Stock options',
        ],
        status: 'open',
        openings: 2,
        filled: 0,
        isPublic: true,
        publishedAt: new Date('2024-12-01'),
        expiresAt: new Date('2025-03-01'),
        hiringManager: userIds.hiringManager,
        recruiters: [userIds.recruiter1, userIds.recruiter2],
        interviewers: [userIds.interviewer1, userIds.interviewer2],
        applicationDeadline: new Date('2025-02-15'),
        requireResume: true,
        requireCoverLetter: false,
        pipelineStages: [
          { name: 'Applied', order: 1 },
          { name: 'Resume Review', order: 2 },
          { name: 'Phone Screen', order: 3 },
          { name: 'Technical Interview', order: 4 },
          { name: 'System Design', order: 5 },
          { name: 'Final Round', order: 6 },
          { name: 'Offer', order: 7 },
        ],
        organizationId: orgIds.acme,
        createdAt: new Date('2024-11-20'),
        updatedAt: new Date(),
        createdBy: userIds.hiringManager,
      },
      {
        _id: jobIds.backendEngineer,
        title: 'Backend Engineer - Node.js',
        department: 'Engineering',
        location: {
          city: 'New York',
          state: 'NY',
          country: 'USA',
          remote: false,
          hybrid: true,
        },
        description: 'Join our backend team to build scalable APIs and microservices.',
        responsibilities: [
          'Design and implement RESTful APIs',
          'Build microservices with Node.js',
          'Optimize database queries and performance',
          'Write comprehensive tests',
        ],
        requirements: [
          '3+ years of backend development experience',
          'Strong Node.js and TypeScript skills',
          'Experience with databases (MongoDB, PostgreSQL)',
          'Knowledge of cloud platforms (AWS, GCP, Azure)',
        ],
        niceToHave: [
          'Experience with GraphQL',
          'Knowledge of Docker and Kubernetes',
          'Familiarity with message queues (RabbitMQ, Kafka)',
        ],
        employmentType: 'full-time',
        experienceLevel: 'mid',
        yearsOfExperience: {
          min: 3,
          max: 7,
        },
        requiredSkills: [
          { name: 'Node.js', required: true },
          { name: 'TypeScript', required: true },
          { name: 'MongoDB', required: true },
          { name: 'REST API', required: true },
        ],
        salary: {
          min: 120000,
          max: 150000,
          currency: 'USD',
          period: 'yearly',
        },
        benefits: [
          'Health insurance',
          '401(k) match',
          'Hybrid work model',
          'Gym membership',
        ],
        status: 'open',
        openings: 1,
        filled: 0,
        isPublic: true,
        publishedAt: new Date('2024-12-10'),
        hiringManager: userIds.hiringManager,
        recruiters: [userIds.recruiter1],
        pipelineStages: [
          { name: 'Applied', order: 1 },
          { name: 'Phone Screen', order: 2 },
          { name: 'Technical Interview', order: 3 },
          { name: 'Offer', order: 4 },
        ],
        organizationId: orgIds.acme,
        createdAt: new Date('2024-12-05'),
        updatedAt: new Date(),
        createdBy: userIds.hiringManager,
      },
      {
        _id: jobIds.productManager,
        title: 'Senior Product Manager',
        department: 'Product',
        location: {
          city: 'San Francisco',
          state: 'CA',
          country: 'USA',
          remote: true,
          hybrid: false,
        },
        description: 'Lead product strategy and execution for our core platform.',
        responsibilities: [
          'Define product roadmap and vision',
          'Work with engineering to deliver features',
          'Analyze user feedback and metrics',
          'Conduct market research',
        ],
        requirements: [
          '5+ years of product management experience',
          'Experience with B2B SaaS products',
          'Strong analytical and communication skills',
          'Understanding of agile methodologies',
        ],
        employmentType: 'full-time',
        experienceLevel: 'senior',
        salary: {
          min: 150000,
          max: 190000,
          currency: 'USD',
          period: 'yearly',
        },
        status: 'open',
        openings: 1,
        isPublic: true,
        publishedAt: new Date('2024-12-15'),
        hiringManager: userIds.admin,
        recruiters: [userIds.recruiter2],
        organizationId: orgIds.acme,
        createdAt: new Date('2024-12-10'),
      },
      {
        _id: jobIds.dataScientist,
        title: 'Data Scientist - ML/AI',
        department: 'Data',
        location: {
          city: 'Remote',
          state: null,
          country: 'USA',
          remote: true,
          hybrid: false,
        },
        description: 'Build ML models to power our AI features.',
        requirements: [
          'PhD or Masters in Computer Science, Statistics, or related field',
          'Experience with Python and ML frameworks (TensorFlow, PyTorch)',
          'Strong statistical analysis skills',
        ],
        employmentType: 'full-time',
        experienceLevel: 'senior',
        salary: {
          min: 160000,
          max: 200000,
          currency: 'USD',
          period: 'yearly',
        },
        status: 'draft',
        openings: 1,
        isPublic: false,
        hiringManager: userIds.admin,
        organizationId: orgIds.acme,
        createdAt: new Date('2024-12-20'),
      },
    ];

    await db.collection('jobs').insertMany(jobs);
    console.log(`✅ Created ${jobs.length} jobs`);

    // ==============================================
    // 4. CANDIDATES
    // ==============================================
    console.log('\n👤 Seeding candidates...');

    const candidateIds = {
      jane: oid(),
      david: oid(),
      emily: oid(),
      carlos: oid(),
      aisha: oid(),
    };

    const candidates = [
      {
        _id: candidateIds.jane,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-1001',
        location: {
          city: 'San Francisco',
          state: 'CA',
          country: 'USA',
          remote: true,
        },
        currentTitle: 'Senior Frontend Developer',
        currentCompany: 'Tech Innovations Inc',
        experience: 6,
        education: [
          {
            degree: 'B.S. Computer Science',
            field: 'Computer Science',
            institution: 'Stanford University',
            graduationYear: 2017,
          },
        ],
        skills: [
          { name: 'React', level: 'expert', yearsOfExperience: 5 },
          { name: 'TypeScript', level: 'expert', yearsOfExperience: 4 },
          { name: 'Node.js', level: 'advanced', yearsOfExperience: 3 },
          { name: 'GraphQL', level: 'advanced', yearsOfExperience: 2 },
          { name: 'Next.js', level: 'advanced', yearsOfExperience: 3 },
        ],
        resume: {
          filename: 'jane_smith_resume.pdf',
          url: 'https://s3.amazonaws.com/resumes/jane_smith.pdf',
          uploadedAt: new Date('2024-12-01T10:00:00Z'),
          parsedData: {
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            totalExperience: '6 years',
          },
        },
        linkedin: 'https://linkedin.com/in/janesmith',
        github: 'https://github.com/janesmith',
        website: 'https://janesmith.dev',
        status: 'interviewing',
        stage: 'Technical Interview',
        source: 'linkedin',
        referredBy: userIds.interviewer1,
        overallRating: 4,
        notes: [
          {
            content: 'Strong technical background. Excellent React skills. Good culture fit.',
            createdBy: userIds.recruiter1,
            createdAt: new Date('2024-12-02'),
          },
          {
            content: 'Phone screen went very well. Moving to technical interview.',
            createdBy: userIds.recruiter1,
            createdAt: new Date('2024-12-05'),
          },
        ],
        tags: ['senior', 'react-expert', 'remote', 'referral'],
        currentSalary: 135000,
        expectedSalary: 160000,
        currency: 'USD',
        availableFrom: new Date('2025-02-01'),
        noticePeriod: 14,
        applications: [
          {
            jobId: jobIds.seniorFrontend,
            appliedAt: new Date('2024-12-01'),
            status: 'interviewing',
          },
        ],
        organizationId: orgIds.acme,
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2024-12-15'),
        createdBy: userIds.recruiter1,
        assignedTo: userIds.recruiter1,
      },
      {
        _id: candidateIds.david,
        firstName: 'David',
        lastName: 'Chen',
        email: 'david.chen@example.com',
        phone: '+1-555-1002',
        location: {
          city: 'New York',
          state: 'NY',
          country: 'USA',
          remote: false,
        },
        currentTitle: 'Backend Engineer',
        currentCompany: 'Cloud Solutions LLC',
        experience: 4,
        skills: [
          { name: 'Node.js', level: 'expert', yearsOfExperience: 4 },
          { name: 'TypeScript', level: 'advanced', yearsOfExperience: 3 },
          { name: 'MongoDB', level: 'advanced', yearsOfExperience: 3 },
          { name: 'PostgreSQL', level: 'intermediate', yearsOfExperience: 2 },
          { name: 'Docker', level: 'advanced', yearsOfExperience: 3 },
        ],
        linkedin: 'https://linkedin.com/in/davidchen',
        github: 'https://github.com/dchen',
        status: 'screening',
        stage: 'Phone Screen',
        source: 'job_board',
        overallRating: 3,
        expectedSalary: 130000,
        currency: 'USD',
        applications: [
          {
            jobId: jobIds.backendEngineer,
            appliedAt: new Date('2024-12-12'),
            status: 'screening',
          },
        ],
        organizationId: orgIds.acme,
        createdAt: new Date('2024-12-12'),
        assignedTo: userIds.recruiter2,
      },
      {
        _id: candidateIds.emily,
        firstName: 'Emily',
        lastName: 'Rodriguez',
        email: 'emily.r@example.com',
        phone: '+1-555-1003',
        location: {
          city: 'Austin',
          state: 'TX',
          country: 'USA',
          remote: true,
        },
        currentTitle: 'Product Manager',
        currentCompany: 'Startup XYZ',
        experience: 7,
        skills: [
          { name: 'Product Strategy', level: 'expert' },
          { name: 'Agile', level: 'expert' },
          { name: 'Data Analysis', level: 'advanced' },
        ],
        status: 'offered',
        stage: 'Offer',
        source: 'referral',
        overallRating: 5,
        expectedSalary: 170000,
        currency: 'USD',
        applications: [
          {
            jobId: jobIds.productManager,
            appliedAt: new Date('2024-12-16'),
            status: 'offered',
          },
        ],
        tags: ['product', 'senior', 'referral'],
        organizationId: orgIds.acme,
        createdAt: new Date('2024-12-16'),
        assignedTo: userIds.recruiter2,
      },
      {
        _id: candidateIds.carlos,
        firstName: 'Carlos',
        lastName: 'Martinez',
        email: 'carlos.m@example.com',
        currentTitle: 'Junior Frontend Developer',
        currentCompany: 'WebDev Agency',
        experience: 2,
        skills: [
          { name: 'React', level: 'intermediate', yearsOfExperience: 2 },
          { name: 'JavaScript', level: 'intermediate', yearsOfExperience: 2 },
        ],
        status: 'rejected',
        stage: 'Phone Screen',
        source: 'career_site',
        overallRating: 2,
        notes: [
          {
            content: 'Not enough experience for senior role. Consider for junior positions in the future.',
            createdBy: userIds.recruiter1,
            createdAt: new Date('2024-12-08'),
          },
        ],
        applications: [
          {
            jobId: jobIds.seniorFrontend,
            appliedAt: new Date('2024-12-05'),
            status: 'rejected',
          },
        ],
        organizationId: orgIds.acme,
        createdAt: new Date('2024-12-05'),
        assignedTo: userIds.recruiter1,
      },
      {
        _id: candidateIds.aisha,
        firstName: 'Aisha',
        lastName: 'Patel',
        email: 'aisha.patel@example.com',
        phone: '+1-555-1005',
        currentTitle: 'Data Scientist',
        currentCompany: 'AI Research Lab',
        experience: 5,
        education: [
          {
            degree: 'PhD Computer Science',
            field: 'Machine Learning',
            institution: 'MIT',
            graduationYear: 2019,
          },
        ],
        skills: [
          { name: 'Python', level: 'expert', yearsOfExperience: 7 },
          { name: 'TensorFlow', level: 'expert', yearsOfExperience: 5 },
          { name: 'PyTorch', level: 'advanced', yearsOfExperience: 4 },
        ],
        status: 'new',
        stage: 'Applied',
        source: 'linkedin',
        expectedSalary: 180000,
        currency: 'USD',
        applications: [
          {
            jobId: jobIds.dataScientist,
            appliedAt: new Date('2024-12-22'),
            status: 'new',
          },
        ],
        organizationId: orgIds.acme,
        createdAt: new Date('2024-12-22'),
        assignedTo: userIds.recruiter1,
      },
    ];

    await db.collection('candidates').insertMany(candidates);
    console.log(`✅ Created ${candidates.length} candidates`);

    // ==============================================
    // 5. INTERVIEWS
    // ==============================================
    console.log('\n📅 Seeding interviews...');

    const interviews = [
      {
        candidateId: candidateIds.jane,
        jobId: jobIds.seniorFrontend,
        scheduledAt: new Date('2024-12-20T14:00:00Z'),
        duration: 60,
        timezone: 'America/Los_Angeles',
        type: 'video',
        round: 3,
        roundName: 'Technical Interview - Frontend',
        status: 'scheduled',
        interviewers: [
          {
            userId: userIds.interviewer1,
            role: 'technical',
          },
          {
            userId: userIds.interviewer2,
            role: 'technical',
          },
        ],
        meetingLink: 'https://zoom.us/j/123456789',
        meetingPassword: 'tech123',
        remindersSent: {
          oneDayBefore: true,
          oneHourBefore: false,
        },
        organizationId: orgIds.acme,
        createdAt: new Date('2024-12-10'),
        createdBy: userIds.recruiter1,
      },
      {
        candidateId: candidateIds.jane,
        jobId: jobIds.seniorFrontend,
        scheduledAt: new Date('2024-12-06T15:00:00Z'),
        duration: 30,
        timezone: 'America/Los_Angeles',
        type: 'phone',
        round: 1,
        roundName: 'Phone Screen',
        status: 'completed',
        interviewers: [
          {
            userId: userIds.recruiter1,
            role: 'recruiter',
          },
        ],
        feedback: [
          {
            interviewerId: userIds.recruiter1,
            rating: 4,
            decision: 'yes',
            strengths: [
              'Strong communication skills',
              'Clear explanations of technical concepts',
              'Good culture alignment',
            ],
            weaknesses: [],
            notes: 'Excellent candidate. Proceed to technical round.',
            submittedAt: new Date('2024-12-06T16:00:00Z'),
          },
        ],
        organizationId: orgIds.acme,
        createdAt: new Date('2024-12-02'),
        createdBy: userIds.recruiter1,
      },
      {
        candidateId: candidateIds.david,
        jobId: jobIds.backendEngineer,
        scheduledAt: new Date('2024-12-18T10:00:00Z'),
        duration: 30,
        timezone: 'America/New_York',
        type: 'phone',
        round: 1,
        roundName: 'Phone Screen',
        status: 'scheduled',
        interviewers: [
          {
            userId: userIds.recruiter2,
            role: 'recruiter',
          },
        ],
        organizationId: orgIds.acme,
        createdAt: new Date('2024-12-14'),
        createdBy: userIds.recruiter2,
      },
    ];

    await db.collection('interviews').insertMany(interviews);
    console.log(`✅ Created ${interviews.length} interviews`);

    // ==============================================
    // 6. WORKFLOW DEFINITIONS
    // ==============================================
    console.log('\n⚙️  Seeding workflow definitions...');

    const workflows = [
      {
        id: 'workflow_candidate_screening',
        name: 'Candidate Screening Workflow',
        description: 'Automated workflow for screening new candidates',
        version: '1.0.0',
        entityType: 'candidate',
        states: [
          {
            name: 'new',
            type: 'start',
            transitions: [
              { to: 'screening', event: 'start_screening' },
              { to: 'rejected', event: 'reject' },
            ],
            actions: [
              {
                id: 'welcome_email',
                type: 'email',
                config: {
                  template: 'candidate_welcome',
                  recipients: ['${metadata.candidateEmail}'],
                },
              },
              {
                id: 'notify_recruiter',
                type: 'notification',
                config: {
                  template: 'new_candidate',
                  recipients: ['${metadata.recruiterId}'],
                  title: 'New Candidate',
                  message: 'New candidate ${metadata.candidateName} needs review',
                },
              },
            ],
          },
          {
            name: 'screening',
            type: 'intermediate',
            transitions: [
              { to: 'phone_screen', event: 'pass_screening' },
              { to: 'rejected', event: 'reject' },
            ],
            actions: [
              {
                id: 'schedule_phone_screen',
                type: 'create_task',
                config: {
                  title: 'Schedule phone screen for ${metadata.candidateName}',
                  assignedTo: '${metadata.recruiterId}',
                  priority: 'high',
                },
              },
            ],
          },
          {
            name: 'phone_screen',
            type: 'intermediate',
            transitions: [
              { to: 'technical_interview', event: 'pass_phone_screen' },
              { to: 'rejected', event: 'reject' },
            ],
          },
          {
            name: 'technical_interview',
            type: 'intermediate',
            transitions: [
              { to: 'offer', event: 'pass_interview' },
              { to: 'rejected', event: 'reject' },
            ],
          },
          {
            name: 'offer',
            type: 'intermediate',
            transitions: [
              { to: 'hired', event: 'accept_offer' },
              { to: 'withdrawn', event: 'reject_offer' },
            ],
            actions: [
              {
                id: 'send_offer_email',
                type: 'email',
                config: {
                  template: 'offer_letter',
                  recipients: ['${metadata.candidateEmail}'],
                },
              },
            ],
          },
          {
            name: 'hired',
            type: 'end',
            actions: [
              {
                id: 'onboarding_email',
                type: 'email',
                config: {
                  template: 'onboarding_welcome',
                  recipients: ['${metadata.candidateEmail}'],
                },
              },
            ],
          },
          {
            name: 'rejected',
            type: 'end',
            actions: [
              {
                id: 'rejection_email',
                type: 'email',
                config: {
                  template: 'candidate_rejection',
                  recipients: ['${metadata.candidateEmail}'],
                },
              },
            ],
          },
          {
            name: 'withdrawn',
            type: 'end',
          },
        ],
        initialState: 'new',
        isActive: true,
        organizationId: orgIds.acme,
        createdAt: new Date('2024-11-01'),
        createdBy: userIds.admin,
      },
    ];

    await db.collection('workflows').insertMany(workflows);
    console.log(`✅ Created ${workflows.length} workflow definitions`);

    // ==============================================
    // 7. EMAIL TEMPLATES
    // ==============================================
    console.log('\n📧 Seeding email templates...');

    const emailTemplates = [
      {
        name: 'candidate_welcome',
        subject: 'Thank you for your application to {{company_name}}',
        body: `
Dear {{candidate_name}},

Thank you for applying to the {{job_title}} position at {{company_name}}. We have received your application and our team will review it shortly.

We will be in touch soon regarding the next steps in our hiring process.

Best regards,
{{recruiter_name}}
{{company_name}} Recruiting Team
        `.trim(),
        variables: ['candidate_name', 'job_title', 'company_name', 'recruiter_name'],
        organizationId: orgIds.acme,
        createdAt: new Date('2024-11-01'),
      },
      {
        name: 'interview_invitation',
        subject: 'Interview Invitation - {{job_title}} at {{company_name}}',
        body: `
Dear {{candidate_name}},

We are pleased to invite you for an interview for the {{job_title}} position.

Interview Details:
Date: {{interview_date}}
Time: {{interview_time}}
Duration: {{interview_duration}} minutes
Type: {{interview_type}}
Meeting Link: {{meeting_link}}

Please confirm your availability by replying to this email.

We look forward to speaking with you!

Best regards,
{{recruiter_name}}
        `.trim(),
        variables: ['candidate_name', 'job_title', 'company_name', 'interview_date', 'interview_time', 'interview_duration', 'interview_type', 'meeting_link', 'recruiter_name'],
        organizationId: orgIds.acme,
        createdAt: new Date('2024-11-01'),
      },
      {
        name: 'candidate_rejection',
        subject: 'Update on your application to {{company_name}}',
        body: `
Dear {{candidate_name}},

Thank you for your interest in the {{job_title}} position at {{company_name}}. After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.

We appreciate the time you invested in this process and encourage you to apply for future openings that align with your skills and experience.

We wish you the best in your job search.

Best regards,
{{company_name}} Recruiting Team
        `.trim(),
        variables: ['candidate_name', 'job_title', 'company_name'],
        organizationId: orgIds.acme,
        createdAt: new Date('2024-11-01'),
      },
    ];

    await db.collection('email_templates').insertMany(emailTemplates);
    console.log(`✅ Created ${emailTemplates.length} email templates`);

    // ==============================================
    // SUMMARY
    // ==============================================
    console.log('\n📊 Database Seeding Complete!');
    console.log('=====================================');
    console.log(`Organizations: ${organizations.length}`);
    console.log(`Users: ${users.length}`);
    console.log(`Jobs: ${jobs.length}`);
    console.log(`Candidates: ${candidates.length}`);
    console.log(`Interviews: ${interviews.length}`);
    console.log(`Workflows: ${workflows.length}`);
    console.log(`Email Templates: ${emailTemplates.length}`);
    console.log('=====================================');
    console.log('\n✅ All done! You can now test the application with this data.');
    console.log('\nTest Credentials:');
    console.log('  Admin:     admin@acme-corp.com / Admin123!');
    console.log('  Recruiter: sarah.recruiter@acme-corp.com / Recruiter123!');
    console.log('  Manager:   lisa.manager@acme-corp.com / Manager123!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the seed script
seedDatabase();
