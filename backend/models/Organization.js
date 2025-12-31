const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrganizationSchema = new Schema({
  // Basic Info
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  industry: {
    type: String,
    required: true,
  },
  companySize: {
    type: String,
    enum: [
      '1-10 employees',
      '11-50 employees',
      '51-200 employees',
      '201-500 employees',
      '501-1000 employees',
      '1000+ employees',
    ],
  },

  // Headquarters
  headquarters: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: {
      type: String,
      default: 'United States',
    },
  },

  taxId: String,
  website: String,

  // Onboarding Status
  onboarding: {
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
    completedSteps: [{
      step: String,
      completedAt: Date,
    }],
    currentStep: String,
    completedAt: Date,
  },

  // Subscription
  subscription: {
    plan: {
      type: String,
      enum: ['starter', 'pro', 'enterprise'],
      default: 'starter',
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'past_due', 'trial'],
      default: 'trial',
    },
    billingEmail: String,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    trialEndsAt: Date,
  },

  // Usage Limits
  limits: {
    users: { type: Number, default: 5 },
    candidates: { type: Number, default: 1000 },
    jobs: { type: Number, default: 20 },
    storage: { type: Number, default: 5368709120 }, // 5GB in bytes
  },

  // Current Usage
  usage: {
    users: { type: Number, default: 0 },
    candidates: { type: Number, default: 0 },
    jobs: { type: Number, default: 0 },
    storage: { type: Number, default: 0 },
  },

  // Domain Configuration
  domain: {
    type: {
      type: String,
      enum: ['subdomain', 'custom'],
      default: 'subdomain',
    },
    subdomain: {
      type: String,
      lowercase: true,
      trim: true,
    },
    customDomain: String,
    verified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verifiedAt: Date,
    sslStatus: {
      type: String,
      enum: ['pending', 'issued', 'active', 'failed'],
      default: 'pending',
    },
    sslIssuedAt: Date,
  },

  // Branding
  branding: {
    logo: {
      url: String,
      filename: String,
      size: Number,
      uploadedAt: Date,
    },
    favicon: {
      url: String,
      filename: String,
      uploadedAt: Date,
    },
    colors: {
      primary: {
        type: String,
        default: '#3B82F6',
      },
      secondary: {
        type: String,
        default: '#8B5CF6',
      },
      accent: {
        type: String,
        default: '#10B981',
      },
    },
    fonts: {
      heading: {
        type: String,
        default: 'Inter',
      },
      body: {
        type: String,
        default: 'Inter',
      },
    },
    customCSS: String,
  },

  // Email Configuration
  email: {
    domain: String,
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: Date,
    smtpProvider: {
      type: String,
      enum: ['sendgrid', 'aws-ses', 'mailgun', 'smtp', ''],
    },
    smtpConfig: {
      host: String,
      port: Number,
      username: String,
      password: String, // Should be encrypted
      secure: Boolean,
      apiKey: String, // For SendGrid, Mailgun, etc.
    },
    dnsRecords: {
      mx: [{ priority: Number, value: String }],
      txt: [String],
      cname: [{ name: String, value: String }],
    },
    deliverabilityStatus: {
      spf: { type: Boolean, default: false },
      dkim: { type: Boolean, default: false },
      dmarc: { type: Boolean, default: false },
    },
  },

  // Settings
  settings: {
    timezone: {
      type: String,
      default: 'America/New_York',
    },
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY',
    },
    currency: {
      type: String,
      default: 'USD',
    },
    language: {
      type: String,
      default: 'en',
    },
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'suspended', 'deleted'],
    default: 'active',
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to update timestamps
OrganizationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate slug from name
OrganizationSchema.pre('save', async function(next) {
  if (this.isNew && !this.slug) {
    let slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);

    // Ensure unique slug
    let slugExists = await this.constructor.findOne({ slug });
    let counter = 1;
    while (slugExists) {
      slug = `${slug}${counter}`;
      slugExists = await this.constructor.findOne({ slug });
      counter++;
    }

    this.slug = slug;
  }
  next();
});

// Auto-set subdomain from slug
OrganizationSchema.pre('save', function(next) {
  if (this.domain.type === 'subdomain' && !this.domain.subdomain) {
    this.domain.subdomain = this.slug;
  }
  next();
});

// Virtual for full domain URL
OrganizationSchema.virtual('domainUrl').get(function() {
  if (this.domain.type === 'custom' && this.domain.customDomain) {
    return `https://${this.domain.customDomain}`;
  }
  return `https://${this.domain.subdomain}.recruitpro.com`;
});

// Virtual for email domain
OrganizationSchema.virtual('emailDomain').get(function() {
  if (this.email.domain) {
    return this.email.domain;
  }
  if (this.domain.type === 'custom' && this.domain.customDomain) {
    return this.domain.customDomain;
  }
  return `${this.domain.subdomain}.recruitpro.com`;
});

// Methods
OrganizationSchema.methods.isWithinLimit = function(resource) {
  return this.usage[resource] < this.limits[resource];
};

OrganizationSchema.methods.incrementUsage = function(resource, amount = 1) {
  this.usage[resource] += amount;
  return this.save();
};

OrganizationSchema.methods.decrementUsage = function(resource, amount = 1) {
  this.usage[resource] = Math.max(0, this.usage[resource] - amount);
  return this.save();
};

module.exports = mongoose.model('Organization', OrganizationSchema);
