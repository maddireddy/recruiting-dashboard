const mongoose = require('mongoose');
const { Schema } = mongoose;

const WebhookDeliverySchema = new Schema({
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'retrying'],
    default: 'pending',
  },
  httpStatus: Number,
  responseTime: Number,
  requestBody: Schema.Types.Mixed,
  responseBody: Schema.Types.Mixed,
  errorMessage: String,
  attemptNumber: { type: Number, default: 1 },
  nextRetryAt: Date,
  deliveredAt: Date,
}, {
  timestamps: true,
});

const WebhookSchema = new Schema({
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'URL must be a valid HTTP/HTTPS endpoint',
    },
  },
  secret: {
    type: String,
    required: true,
    // Used for HMAC signature verification
  },
  events: [{
    type: String,
    enum: [
      'candidate.created',
      'candidate.updated',
      'candidate.deleted',
      'employee.created',
      'employee.updated',
      'employee.terminated',
      'job.created',
      'job.updated',
      'job.closed',
      'interview.scheduled',
      'interview.completed',
      'interview.cancelled',
      'offer.sent',
      'offer.accepted',
      'offer.rejected',
      'application.submitted',
      'application.reviewed',
      'department.created',
      'department.updated',
      'onboarding.completed',
      'workflow.completed',
      'notification.sent',
    ],
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  },
  headers: {
    type: Map,
    of: String,
    default: {},
  },
  retryPolicy: {
    enabled: { type: Boolean, default: true },
    maxAttempts: { type: Number, default: 3 },
    backoffMultiplier: { type: Number, default: 2 }, // Exponential backoff
    initialRetryDelayMs: { type: Number, default: 1000 }, // 1 second
  },
  deliveryStats: {
    totalAttempts: { type: Number, default: 0 },
    successfulDeliveries: { type: Number, default: 0 },
    failedDeliveries: { type: Number, default: 0 },
    lastDeliveryStatus: String,
    lastDeliveryAt: Date,
    lastErrorAt: Date,
    lastErrorMessage: String,
  },
  recentDeliveries: [WebhookDeliverySchema],

  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexes
WebhookSchema.index({ organizationId: 1, status: 1 });
WebhookSchema.index({ organizationId: 1, events: 1 });

// Methods
WebhookSchema.methods.addDeliveryLog = function(deliveryData) {
  // Keep only last 50 deliveries
  if (this.recentDeliveries.length >= 50) {
    this.recentDeliveries.shift();
  }

  this.recentDeliveries.push(deliveryData);

  // Update stats
  this.deliveryStats.totalAttempts += 1;
  if (deliveryData.status === 'success') {
    this.deliveryStats.successfulDeliveries += 1;
  } else if (deliveryData.status === 'failed') {
    this.deliveryStats.failedDeliveries += 1;
  }

  this.deliveryStats.lastDeliveryStatus = deliveryData.status;
  this.deliveryStats.lastDeliveryAt = new Date();

  if (deliveryData.status === 'failed') {
    this.deliveryStats.lastErrorAt = new Date();
    this.deliveryStats.lastErrorMessage = deliveryData.errorMessage;
  }
};

WebhookSchema.methods.shouldRetry = function(attemptNumber) {
  if (!this.retryPolicy.enabled) return false;
  if (attemptNumber >= this.retryPolicy.maxAttempts) return false;
  return true;
};

WebhookSchema.methods.calculateNextRetryDelay = function(attemptNumber) {
  const baseDelay = this.retryPolicy.initialRetryDelayMs;
  const multiplier = this.retryPolicy.backoffMultiplier;
  return baseDelay * Math.pow(multiplier, attemptNumber - 1);
};

WebhookSchema.statics.getActiveWebhooksForEvent = async function(organizationId, eventType) {
  return this.find({
    organizationId,
    status: 'active',
    events: eventType,
  });
};

module.exports = mongoose.model('Webhook', WebhookSchema);
