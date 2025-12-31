const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmailTemplateSchema = new Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    description: String,

    // Organization (multi-tenant)
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },

    // Template Type/Category
    category: {
      type: String,
      enum: [
        'employee_welcome',
        'employee_offboarding',
        'candidate_application_received',
        'interview_invitation',
        'interview_reminder',
        'interview_feedback_request',
        'offer_letter',
        'rejection',
        'password_reset',
        'email_verification',
        'notification_digest',
        'custom',
      ],
      required: true,
    },

    // Email Content
    subject: {
      type: String,
      required: true,
      maxlength: 200,
    },
    body: {
      type: String,
      required: true,
    },
    bodyHtml: String, // HTML version

    // From Address
    fromName: String,
    fromEmail: String,
    replyTo: String,

    // Variables/Placeholders
    variables: [
      {
        name: String, // e.g., "candidateName", "jobTitle"
        description: String,
        example: String,
        required: Boolean,
      },
    ],

    // Attachments
    attachments: [
      {
        name: String,
        url: String,
        type: String, // 'pdf', 'docx', etc.
      },
    ],

    // Status
    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'draft',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },

    // Usage Stats
    usageCount: {
      type: Number,
      default: 0,
    },
    lastUsedAt: Date,

    // Version Control
    version: {
      type: Number,
      default: 1,
    },
    previousVersions: [
      {
        version: Number,
        subject: String,
        body: String,
        updatedAt: Date,
        updatedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],

    // Metadata
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique slug per organization
EmailTemplateSchema.index({ organizationId: 1, slug: 1 }, { unique: true });
EmailTemplateSchema.index({ organizationId: 1, category: 1 });
EmailTemplateSchema.index({ status: 1 });

// Methods
EmailTemplateSchema.methods.render = function (variables = {}) {
  let renderedSubject = this.subject;
  let renderedBody = this.body;
  let renderedBodyHtml = this.bodyHtml || this.body;

  // Replace variables in format {{variableName}}
  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    renderedSubject = renderedSubject.replace(regex, variables[key]);
    renderedBody = renderedBody.replace(regex, variables[key]);
    renderedBodyHtml = renderedBodyHtml.replace(regex, variables[key]);
  });

  return {
    subject: renderedSubject,
    body: renderedBody,
    bodyHtml: renderedBodyHtml,
  };
};

EmailTemplateSchema.methods.createNewVersion = function (updates, userId) {
  // Save current version to history
  this.previousVersions.push({
    version: this.version,
    subject: this.subject,
    body: this.body,
    updatedAt: new Date(),
    updatedBy: userId,
  });

  // Update to new version
  this.version += 1;
  this.subject = updates.subject || this.subject;
  this.body = updates.body || this.body;
  this.bodyHtml = updates.bodyHtml || this.bodyHtml;
  this.updatedBy = userId;

  return this.save();
};

EmailTemplateSchema.methods.incrementUsage = function () {
  this.usageCount += 1;
  this.lastUsedAt = new Date();
  return this.save();
};

// Statics
EmailTemplateSchema.statics.getDefaultTemplate = async function (organizationId, category) {
  return this.findOne({
    organizationId,
    category,
    status: 'active',
    isDefault: true,
  });
};

EmailTemplateSchema.statics.getActiveTemplates = async function (organizationId) {
  return this.find({
    organizationId,
    status: 'active',
  }).sort({ category: 1, name: 1 });
};

// Pre-save hook to generate slug
EmailTemplateSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

const EmailTemplate = mongoose.model('EmailTemplate', EmailTemplateSchema);

module.exports = EmailTemplate;
