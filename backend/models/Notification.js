const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema(
  {
    // Recipient
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Organization (multi-tenant)
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },

    // Notification Type
    type: {
      type: String,
      enum: [
        'employee_created',
        'employee_updated',
        'department_created',
        'candidate_applied',
        'interview_scheduled',
        'interview_reminder',
        'offer_sent',
        'workflow_assigned',
        'mention',
        'comment',
        'system',
        'announcement',
      ],
      required: true,
    },

    // Priority
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },

    // Content
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    icon: String, // Icon name or emoji

    // Action/Link
    actionUrl: String, // Where to navigate when clicked
    actionText: String, // Button text (e.g., "View Candidate", "Review Interview")

    // Related Entity
    entityType: {
      type: String,
      enum: ['employee', 'department', 'candidate', 'job', 'interview', 'offer', 'workflow'],
    },
    entityId: Schema.Types.ObjectId,

    // Status
    status: {
      type: String,
      enum: ['unread', 'read', 'archived'],
      default: 'unread',
    },

    // Delivery Channels
    channels: {
      inApp: {
        sent: { type: Boolean, default: true },
        sentAt: Date,
      },
      email: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
        emailId: String, // Reference to email service
      },
      sms: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
      },
      push: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
      },
    },

    // Timestamps
    readAt: Date,
    archivedAt: Date,
    expiresAt: Date, // Auto-delete after this date

    // Sender (optional, for user-generated notifications)
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    // Metadata
    metadata: Schema.Types.Mixed, // Additional context data
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
NotificationSchema.index({ userId: 1, status: 1, createdAt: -1 });
NotificationSchema.index({ organizationId: 1, type: 1 });
NotificationSchema.index({ userId: 1, organizationId: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Methods
NotificationSchema.methods.markAsRead = function () {
  this.status = 'read';
  this.readAt = new Date();
  return this.save();
};

NotificationSchema.methods.markAsArchived = function () {
  this.status = 'archived';
  this.archivedAt = new Date();
  return this.save();
};

// Statics
NotificationSchema.statics.createNotification = async function (data) {
  const notification = new this({
    userId: data.userId,
    organizationId: data.organizationId,
    type: data.type,
    priority: data.priority || 'medium',
    title: data.title,
    message: data.message,
    icon: data.icon,
    actionUrl: data.actionUrl,
    actionText: data.actionText,
    entityType: data.entityType,
    entityId: data.entityId,
    senderId: data.senderId,
    metadata: data.metadata,
  });

  await notification.save();

  // TODO: Emit real-time event via Socket.io
  // io.to(`user:${data.userId}`).emit('notification', notification);

  return notification;
};

NotificationSchema.statics.getUnreadCount = async function (userId, organizationId) {
  return this.countDocuments({
    userId,
    organizationId,
    status: 'unread',
  });
};

NotificationSchema.statics.markAllAsRead = async function (userId, organizationId) {
  return this.updateMany(
    { userId, organizationId, status: 'unread' },
    { $set: { status: 'read', readAt: new Date() } }
  );
};

NotificationSchema.statics.deleteOldNotifications = async function (daysOld = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return this.deleteMany({
    status: 'archived',
    archivedAt: { $lt: cutoffDate },
  });
};

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;
