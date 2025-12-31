# SaaS Platform - Implementation Roadmap
## Technical Implementation Guide

---

## Executive Summary

This document outlines the complete implementation plan to transform the existing Recruiting Dashboard into a full-fledged **Multi-Tenant Recruitment SaaS Platform** with support for:
1. **Greenfield customers** - complete setup from scratch
2. **Migration customers** - gap analysis and data migration

---

## 🎯 Implementation Phases

### Phase 1: Organization Onboarding & Setup (Priority: P0)
**Timeline: 2-3 weeks**

#### Frontend Components to Build:
```
src/pages/onboarding/
├── OnboardingWizard.tsx          # Main multi-step wizard
├── steps/
│   ├── CompanyProfile.tsx        # Step 1: Company info
│   ├── SubscriptionPlan.tsx      # Step 2: Plan selection
│   ├── DomainSetup.tsx           # Step 3: Domain config
│   ├── BrandingSetup.tsx         # Step 4: Logo, colors
│   ├── EmailConfiguration.tsx    # Step 5: Email setup
│   └── Complete.tsx              # Step 6: Summary

src/components/onboarding/
├── OnboardingProgress.tsx        # Progress indicator
├── DomainVerification.tsx        # Domain verification UI
├── DNSInstructions.tsx           # DNS setup helper
├── BrandingPreview.tsx           # Live branding preview
└── SetupChecklist.tsx            # Post-setup checklist
```

#### Backend APIs to Build:
```javascript
// Organization Setup
POST   /api/v1/onboarding/start
POST   /api/v1/onboarding/company-profile
POST   /api/v1/onboarding/subscription
POST   /api/v1/onboarding/domain
  ├─ Body: { domainType: 'subdomain' | 'custom', domain: string }
  ├─ Actions: Register subdomain, validate custom domain
  └─ Returns: Verification instructions

POST   /api/v1/onboarding/branding
  ├─ Body: { logo: File, primaryColor, secondaryColor, fonts }
  └─ Actions: Upload to S3, generate theme CSS

POST   /api/v1/onboarding/email-config
  ├─ Body: { emailDomain, smtpProvider, apiKey }
  └─ Actions: Verify domain, setup SMTP, configure DKIM/SPF

GET    /api/v1/onboarding/status
POST   /api/v1/onboarding/complete
```

#### Database Schemas:
```javascript
// Organization Schema Enhancement
{
  // ... existing fields

  onboarding: {
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending'
    },
    completedSteps: [{
      step: String,
      completedAt: Date
    }],
    currentStep: String,
  },

  domain: {
    type: {
      type: String,
      enum: ['subdomain', 'custom'],
      default: 'subdomain'
    },
    subdomain: String,  // e.g., 'acmecorp'
    customDomain: String,  // e.g., 'careers.acme.com'
    verified: Boolean,
    verificationToken: String,
    sslStatus: {
      type: String,
      enum: ['pending', 'issued', 'active'],
      default: 'pending'
    }
  },

  branding: {
    logo: {
      url: String,
      filename: String,
      uploadedAt: Date
    },
    favicon: {
      url: String,
      filename: String
    },
    colors: {
      primary: String,  // Hex color
      secondary: String,
      accent: String,
      text: String,
      background: String
    },
    fonts: {
      heading: String,
      body: String
    },
    customCSS: String
  },

  email: {
    domain: String,
    verified: Boolean,
    smtpProvider: {
      type: String,
      enum: ['sendgrid', 'aws-ses', 'mailgun', 'smtp']
    },
    smtpConfig: {
      host: String,
      port: Number,
      username: String,
      password: String,  // Encrypted
      secure: Boolean
    },
    dnsRecords: {
      mx: [{ priority: Number, value: String }],
      txt: [String],  // SPF, DKIM
      cname: [{ name: String, value: String }]
    },
    deliverabilityStatus: {
      spf: Boolean,
      dkim: Boolean,
      dmarc: Boolean
    }
  }
}
```

#### Services to Implement:
```typescript
// src/services/onboarding.service.ts
class OnboardingService {
  async startOnboarding(organizationId: string): Promise<OnboardingSession>
  async saveStep(step: string, data: any): Promise<void>
  async verifyDomain(domain: string): Promise<VerificationInstructions>
  async checkDomainVerification(domain: string): Promise<boolean>
  async uploadBranding(files: Files, colors: BrandingColors): Promise<void>
  async generateThemeCSS(branding: Branding): Promise<string>
  async setupEmailInfrastructure(config: EmailConfig): Promise<void>
  async completeOnboarding(): Promise<void>
}

// src/services/domain.service.ts
class DomainService {
  async registerSubdomain(subdomain: string): Promise<void>
  async verifyCustomDomain(domain: string): Promise<boolean>
  async generateSSLCertificate(domain: string): Promise<void>
  async configureDNS(domain: string, records: DNSRecords): Promise<void>
}

// src/services/email-infrastructure.service.ts
class EmailInfrastructureService {
  async verifyEmailDomain(domain: string): Promise<VerificationStatus>
  async setupSMTP(provider: SMTPProvider, config: SMTPConfig): Promise<void>
  async configureDKIM(domain: string): Promise<DKIMKeys>
  async configureSPF(domain: string): Promise<SPFRecord>
  async testEmailDeliverability(domain: string): Promise<TestResults>
}
```

---

### Phase 2: Employee Management System (Priority: P0)
**Timeline: 2 weeks**

#### Frontend Components:
```
src/pages/employees/
├── EmployeeDirectory.tsx         # Main directory page
├── EmployeeCreate.tsx            # Create employee wizard
├── EmployeeProfile.tsx           # Employee detail view
├── BulkEmployeeImport.tsx        # CSV import
└── EmployeeBadge.tsx             # Badge generator

src/components/employees/
├── EmployeeCard.tsx
├── EmployeeForm.tsx
├── EmailProvisioningForm.tsx
├── BadgeDesigner.tsx
├── BadgePreview.tsx
├── DepartmentHierarchy.tsx
├── EmployeeAccessLogs.tsx
└── EmployeeIDGenerator.tsx
```

#### Backend APIs:
```javascript
// Employee Management
POST   /api/v1/employees
  ├─ Body: { firstName, lastName, email, department, role }
  ├─ Actions: Generate employee ID, provision email, create badge
  └─ Returns: Employee object with ID and email

POST   /api/v1/employees/bulk-import
  ├─ Body: FormData with CSV file
  └─ Returns: Import summary with success/failures

POST   /api/v1/employees/:id/provision-email
  ├─ Body: { emailFormat: 'firstname.lastname' | 'firstinitial.lastname' }
  └─ Returns: Provisioned email address

GET    /api/v1/employees/:id/badge
  ├─ Query: { format: 'pdf' | 'png', template: 'standard' | 'modern' }
  └─ Returns: Badge file (PDF or PNG)

GET    /api/v1/employees/:id/access-logs
  ├─ Query: { from, to, limit, offset }
  └─ Returns: Paginated access logs

POST   /api/v1/employees/:id/send-credentials
  └─ Actions: Send welcome email with login credentials

GET    /api/v1/employees/available-employee-id
  └─ Returns: Next available employee ID

// Department Management
GET    /api/v1/departments
POST   /api/v1/departments
PUT    /api/v1/departments/:id
DELETE /api/v1/departments/:id
```

#### Database Schemas:
```javascript
// Employee Schema
const EmployeeSchema = new Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    match: /^EMP-\d{4,}$/  // Format: EMP-0001, EMP-0002, etc.
  },

  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    photo: {
      url: String,
      filename: String
    },
    dateOfBirth: Date,
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String
    }
  },

  employment: {
    joinDate: { type: Date, required: true },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },
    title: String,
    reportingTo: {
      type: Schema.Types.ObjectId,
      ref: 'Employee'
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'intern']
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on-leave', 'terminated'],
      default: 'active'
    }
  },

  emailAccount: {
    email: String,  // firstname.lastname@company.com
    provisioned: Boolean,
    provisionedAt: Date,
    aliases: [String],
    forwardingEnabled: Boolean,
    forwardTo: String
  },

  badge: {
    generated: Boolean,
    generatedAt: Date,
    template: String,
    qrCode: String,
    barcodeNumber: String,
    lastPrinted: Date
  },

  access: {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String,
    permissions: [String],
    lastLogin: Date,
    loginCount: Number
  },

  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },

  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: Date,
  updatedAt: Date
});

// Auto-increment employee ID
EmployeeSchema.pre('save', async function(next) {
  if (this.isNew && !this.employeeId) {
    const lastEmployee = await this.constructor
      .findOne({ organizationId: this.organizationId })
      .sort({ employeeId: -1 });

    const lastId = lastEmployee ?
      parseInt(lastEmployee.employeeId.replace('EMP-', '')) : 0;

    this.employeeId = `EMP-${String(lastId + 1).padStart(4, '0')}`;
  }
  next();
});

// Department Schema
const DepartmentSchema = new Schema({
  name: { type: String, required: true },
  code: String,  // HR, ENG, SALES, etc.
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Department'
  },
  head: {
    type: Schema.Types.ObjectId,
    ref: 'Employee'
  },
  description: String,
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  }
});

// Access Log Schema
const AccessLogSchema = new Schema({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: ['login', 'logout', 'create', 'update', 'delete', 'view']
  },
  resource: String,  // candidates, jobs, etc.
  resourceId: Schema.Types.ObjectId,
  ipAddress: String,
  userAgent: String,
  metadata: Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  }
});
```

#### Services:
```typescript
// src/services/employee.service.ts
class EmployeeService {
  async createEmployee(data: EmployeeData): Promise<Employee>
  async generateEmployeeId(organizationId: string): Promise<string>
  async provisionEmail(employeeId: string, format: EmailFormat): Promise<string>
  async generateBadge(employeeId: string, template: string): Promise<Buffer>
  async bulkImport(file: File): Promise<ImportResults>
  async sendWelcomeEmail(employeeId: string): Promise<void>
  async getAccessLogs(employeeId: string, filters: LogFilters): Promise<AccessLog[]>
}

// src/services/badge-generator.service.ts
class BadgeGeneratorService {
  async generatePDF(employee: Employee, template: string): Promise<Buffer>
  async generateQRCode(employeeId: string): Promise<string>
  async generateBarcode(employeeId: string): Promise<string>
}

// src/services/email-provisioning.service.ts
class EmailProvisioningService {
  async createEmailAccount(employee: Employee): Promise<EmailAccount>
  async setupForwarding(email: string, forwardTo: string): Promise<void>
  async createAlias(email: string, alias: string): Promise<void>
  async sendCredentials(employee: Employee): Promise<void>
}
```

---

### Phase 3: Website/CMS Builder (Priority: P0)
**Timeline: 3-4 weeks**

#### Frontend Components:
```
src/pages/website-builder/
├── WebsiteBuilder.tsx            # Main builder page
├── PageEditor.tsx                # Visual page editor
├── TemplateGallery.tsx           # Pre-built templates
├── ThemeCustomizer.tsx           # Theme settings
├── PublicPreview.tsx             # Preview mode
└── PublishWorkflow.tsx           # Publish/unpublish

src/components/cms/
├── PageBuilder/
│   ├── DragDropEditor.tsx        # Drag-drop interface
│   ├── ComponentPalette.tsx      # Available components
│   ├── CanvasArea.tsx            # Drop zone
│   ├── PropertiesPanel.tsx       # Edit component props
│   └── LayersPanel.tsx           # Page structure
├── blocks/
│   ├── HeroBlock.tsx             # Hero section
│   ├── JobListingsBlock.tsx      # Job listings widget
│   ├── TextBlock.tsx             # Rich text
│   ├── ImageBlock.tsx            # Images
│   ├── FormBlock.tsx             # Forms
│   ├── TestimonialsBlock.tsx     # Testimonials
│   └── CTABlock.tsx              # Call-to-action
└── MediaLibrary.tsx              # Asset management
```

#### Backend APIs:
```javascript
// CMS Pages
GET    /api/v1/cms/pages
GET    /api/v1/cms/pages/:id
POST   /api/v1/cms/pages
  ├─ Body: { title, slug, content, template, status }
  └─ Returns: Created page

PUT    /api/v1/cms/pages/:id
DELETE /api/v1/cms/pages/:id

POST   /api/v1/cms/pages/:id/publish
POST   /api/v1/cms/pages/:id/unpublish

// Templates
GET    /api/v1/cms/templates
GET    /api/v1/cms/templates/:id
POST   /api/v1/cms/templates

// Media Library
GET    /api/v1/cms/media
POST   /api/v1/cms/media/upload
DELETE /api/v1/cms/media/:id

// Public API (for rendering public career site)
GET    /public/:organizationSlug
GET    /public/:organizationSlug/jobs
GET    /public/:organizationSlug/jobs/:jobId
POST   /public/:organizationSlug/jobs/:jobId/apply
```

#### Database Schemas:
```javascript
// CMS Page Schema
const CMSPageSchema = new Schema({
  title: { type: String, required: true },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  content: {
    blocks: [{
      id: String,
      type: String,  // hero, text, image, jobs, form, etc.
      properties: Schema.Types.Mixed,
      order: Number
    }]
  },

  template: {
    type: String,
    enum: ['blank', 'modern', 'corporate', 'startup', 'creative']
  },

  seo: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],
    ogImage: String,
    canonicalUrl: String
  },

  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },

  publishedAt: Date,
  publishedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },

  createdAt: Date,
  updatedAt: Date
});

// Website Theme Schema
const WebsiteThemeSchema = new Schema({
  name: String,
  colors: {
    primary: String,
    secondary: String,
    accent: String,
    text: String,
    background: String,
    surface: String
  },
  fonts: {
    heading: String,
    body: String
  },
  customCSS: String,
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  }
});

// Media Asset Schema
const MediaAssetSchema = new Schema({
  filename: String,
  originalName: String,
  mimeType: String,
  size: Number,  // bytes
  url: String,  // S3 URL
  thumbnail: String,
  alt: String,
  tags: [String],
  folder: String,
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  uploadedAt: Date
});
```

---

### Phase 4: Gap Analysis & Migration Tools (Priority: P1)
**Timeline: 2 weeks**

#### Frontend Components:
```
src/pages/migration/
├── GapAnalysis.tsx               # Gap analysis dashboard
├── DataImport.tsx                # Import wizard
├── MappingTool.tsx               # Field mapping
├── ValidationReport.tsx          # Data validation
└── MigrationProgress.tsx         # Progress tracker

src/components/migration/
├── FeatureChecklist.tsx          # Feature comparison
├── DataPreview.tsx               # Preview imported data
├── FieldMapper.tsx               # Map old → new fields
├── ImportErrors.tsx              # Error handling
└── RollbackControls.tsx          # Rollback UI
```

#### Backend APIs:
```javascript
// Gap Analysis
POST   /api/v1/migration/analyze
  ├─ Body: { currentSystem, dataSize, features }
  └─ Returns: Gap analysis report

// Data Import
POST   /api/v1/migration/candidates/import
POST   /api/v1/migration/jobs/import
POST   /api/v1/migration/users/import
POST   /api/v1/migration/documents/import

POST   /api/v1/migration/validate
  ├─ Body: Import data
  └─ Returns: Validation results

GET    /api/v1/migration/status
GET    /api/v1/migration/errors

POST   /api/v1/migration/rollback
```

---

### Phase 5: Bench Sales Enhancement (Priority: P1)
**Timeline: 2 weeks**

#### Frontend Components:
```
src/pages/bench-sales/
├── BenchDashboard.tsx
├── ResourceMarketing.tsx
├── ClientRequirements.tsx
├── MatchingEngine.tsx
└── RevenueTracking.tsx
```

---

## 🚀 Immediate Next Steps (This Sprint)

Let me now start implementing the **highest priority features**:

1. ✅ Created feature checklist documentation
2. ✅ Created PowerPoint presentation outline
3. 🔄 NOW: Implement Organization Onboarding Wizard (Frontend)
4. NEXT: Implement Employee Management System
5. NEXT: Implement Website Builder basics

---

**Document Version:** 1.0
**Last Updated:** 2025-12-31
