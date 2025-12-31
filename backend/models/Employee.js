const mongoose = require('mongoose');
const { Schema } = mongoose;

const EmployeeSchema = new Schema({
  // Auto-generated Employee ID
  employeeId: {
    type: String,
    required: true,
    unique: true,
    match: /^EMP-\d{4,}$/,
    index: true,
  },

  // Personal Information
  personalInfo: {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    phone: String,
    photo: {
      url: String,
      filename: String,
      size: Number,
      uploadedAt: Date,
    },
    dateOfBirth: Date,
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },
  },

  // Employment Information
  employment: {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
      index: true,
    },
    departmentName: String, // Denormalized for quick access
    reportingTo: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
    },
    joinDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'intern'],
      default: 'full-time',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on-leave', 'terminated'],
      default: 'active',
      index: true,
    },
    terminationDate: Date,
    terminationReason: String,
  },

  // Email Account (Provisioned)
  emailAccount: {
    email: String,
    provisioned: {
      type: Boolean,
      default: false,
    },
    provisionedAt: Date,
    emailFormat: {
      type: String,
      enum: ['firstname.lastname', 'firstinitial.lastname', 'firstname_lastname'],
    },
    aliases: [String],
    forwardingEnabled: Boolean,
    forwardTo: String,
    lastPasswordReset: Date,
  },

  // Digital Badge
  badge: {
    generated: {
      type: Boolean,
      default: false,
    },
    generatedAt: Date,
    template: {
      type: String,
      default: 'standard',
    },
    qrCode: String,
    barcodeNumber: String,
    pdfUrl: String,
    pngUrl: String,
    lastPrinted: Date,
  },

  // Access & Permissions
  access: {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    role: {
      type: String,
      enum: ['ADMIN', 'RECRUITER', 'HIRING_MANAGER', 'INTERVIEWER', 'CANDIDATE'],
      required: true,
      default: 'RECRUITER',
      index: true,
    },
    permissions: [{
      type: String,
    }],
    lastLogin: Date,
    loginCount: {
      type: Number,
      default: 0,
    },
    accountLocked: {
      type: Boolean,
      default: false,
    },
    lockReason: String,
  },

  // Organization
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },

  // Metadata
  metadata: {
    importedFrom: String,
    externalId: String,
    tags: [String],
    customFields: Schema.Types.Mixed,
  },

  // Audit Trail
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for common queries
EmployeeSchema.index({ organizationId: 1, 'employment.status': 1 });
EmployeeSchema.index({ organizationId: 1, 'employment.department': 1 });
EmployeeSchema.index({ organizationId: 1, employeeId: 1 });
EmployeeSchema.index({ 'personalInfo.email': 1 });
EmployeeSchema.index({ 'emailAccount.email': 1 });

// Text search index
EmployeeSchema.index({
  'personalInfo.firstName': 'text',
  'personalInfo.lastName': 'text',
  'personalInfo.email': 'text',
  employeeId: 'text',
  'employment.title': 'text',
});

// Pre-save hooks
EmployeeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Auto-generate employee ID if not provided
EmployeeSchema.pre('save', async function(next) {
  if (this.isNew && !this.employeeId) {
    try {
      // Find the last employee ID for this organization
      const lastEmployee = await this.constructor
        .findOne({ organizationId: this.organizationId })
        .sort({ employeeId: -1 })
        .select('employeeId');

      let nextNumber = 1;
      if (lastEmployee && lastEmployee.employeeId) {
        const lastNumber = parseInt(lastEmployee.employeeId.replace('EMP-', ''));
        nextNumber = lastNumber + 1;
      }

      this.employeeId = `EMP-${String(nextNumber).padStart(4, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Auto-populate department name
EmployeeSchema.pre('save', async function(next) {
  if (this.isModified('employment.department') && this.employment.department) {
    try {
      const Department = mongoose.model('Department');
      const dept = await Department.findById(this.employment.department);
      if (dept) {
        this.employment.departmentName = dept.name;
      }
    } catch (error) {
      // Continue even if department lookup fails
    }
  }
  next();
});

// Virtual for full name
EmployeeSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Virtual for initials
EmployeeSchema.virtual('initials').get(function() {
  return `${this.personalInfo.firstName[0]}${this.personalInfo.lastName[0]}`.toUpperCase();
});

// Virtual for primary email
EmployeeSchema.virtual('primaryEmail').get(function() {
  return this.emailAccount.email || this.personalInfo.email;
});

// Methods
EmployeeSchema.methods.generateEmployeeEmail = function(format, domain) {
  const { firstName, lastName } = this.personalInfo;
  const fn = firstName.toLowerCase();
  const ln = lastName.toLowerCase();

  let emailPrefix;
  switch (format) {
    case 'firstname.lastname':
      emailPrefix = `${fn}.${ln}`;
      break;
    case 'firstinitial.lastname':
      emailPrefix = `${fn[0]}.${ln}`;
      break;
    case 'firstname_lastname':
      emailPrefix = `${fn}_${ln}`;
      break;
    default:
      emailPrefix = `${fn}.${ln}`;
  }

  return `${emailPrefix}@${domain}`;
};

EmployeeSchema.methods.markEmailAsProvisioned = function(email) {
  this.emailAccount.email = email;
  this.emailAccount.provisioned = true;
  this.emailAccount.provisionedAt = Date.now();
  return this.save();
};

EmployeeSchema.methods.markBadgeAsGenerated = function(urls) {
  this.badge.generated = true;
  this.badge.generatedAt = Date.now();
  if (urls.pdf) this.badge.pdfUrl = urls.pdf;
  if (urls.png) this.badge.pngUrl = urls.png;
  if (urls.qrCode) this.badge.qrCode = urls.qrCode;
  return this.save();
};

EmployeeSchema.methods.updateLoginInfo = function() {
  this.access.lastLogin = Date.now();
  this.access.loginCount += 1;
  return this.save();
};

// Static methods
EmployeeSchema.statics.getNextEmployeeId = async function(organizationId) {
  const lastEmployee = await this.findOne({ organizationId })
    .sort({ employeeId: -1 })
    .select('employeeId');

  let nextNumber = 1;
  if (lastEmployee && lastEmployee.employeeId) {
    const lastNumber = parseInt(lastEmployee.employeeId.replace('EMP-', ''));
    nextNumber = lastNumber + 1;
  }

  return `EMP-${String(nextNumber).padStart(4, '0')}`;
};

EmployeeSchema.statics.findByEmployeeId = function(employeeId, organizationId) {
  return this.findOne({ employeeId, organizationId });
};

EmployeeSchema.statics.searchEmployees = function(organizationId, searchTerm) {
  return this.find({
    organizationId,
    $text: { $search: searchTerm },
  }).select('employeeId personalInfo employment emailAccount');
};

// Ensure virtuals are included in JSON
EmployeeSchema.set('toJSON', { virtuals: true });
EmployeeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Employee', EmployeeSchema);
