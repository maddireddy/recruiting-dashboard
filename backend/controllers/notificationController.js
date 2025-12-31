const Notification = require('../models/Notification');

/**
 * Get user's notifications
 * GET /api/v1/notifications
 */
exports.getNotifications = async (req, res) => {
  try {
    const { userId, organizationId } = req.user;
    const {
      status,
      type,
      priority,
      page = 1,
      limit = 20,
      unreadOnly = false,
    } = req.query;

    const query = { userId, organizationId };

    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (unreadOnly === 'true') query.status = 'unread';

    const notifications = await Notification.find(query)
      .populate('senderId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((page - 1) * limit)
      .lean();

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.getUnreadCount(userId, organizationId);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications',
      error: error.message,
    });
  }
};

/**
 * Get unread notification count
 * GET /api/v1/notifications/unread-count
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const { userId, organizationId } = req.user;

    const unreadCount = await Notification.getUnreadCount(userId, organizationId);

    res.status(200).json({
      success: true,
      data: { unreadCount },
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message,
    });
  }
};

/**
 * Mark notification as read
 * PUT /api/v1/notifications/:id/read
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, organizationId } = req.user;

    const notification = await Notification.findOne({
      _id: id,
      userId,
      organizationId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    await notification.markAsRead();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: { notification },
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message,
    });
  }
};

/**
 * Mark all notifications as read
 * PUT /api/v1/notifications/read-all
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const { userId, organizationId } = req.user;

    const result = await Notification.markAllAsRead(userId, organizationId);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message,
    });
  }
};

/**
 * Archive notification
 * PUT /api/v1/notifications/:id/archive
 */
exports.archiveNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, organizationId } = req.user;

    const notification = await Notification.findOne({
      _id: id,
      userId,
      organizationId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    await notification.markAsArchived();

    res.status(200).json({
      success: true,
      message: 'Notification archived',
      data: { notification },
    });
  } catch (error) {
    console.error('Archive notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive notification',
      error: error.message,
    });
  }
};

/**
 * Delete notification
 * DELETE /api/v1/notifications/:id
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, organizationId } = req.user;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId,
      organizationId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message,
    });
  }
};

/**
 * Create notification (internal/admin use)
 * POST /api/v1/notifications
 */
exports.createNotification = async (req, res) => {
  try {
    const { organizationId, userId: senderId } = req.user;
    const {
      userId,
      type,
      priority,
      title,
      message,
      icon,
      actionUrl,
      actionText,
      entityType,
      entityId,
      metadata,
    } = req.body;

    const notification = await Notification.createNotification({
      userId,
      organizationId,
      type,
      priority,
      title,
      message,
      icon,
      actionUrl,
      actionText,
      entityType,
      entityId,
      senderId,
      metadata,
    });

    res.status(201).json({
      success: true,
      message: 'Notification created',
      data: { notification },
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message,
    });
  }
};

/**
 * Get notification preferences
 * GET /api/v1/notifications/preferences
 */
exports.getPreferences = async (req, res) => {
  try {
    const { userId } = req.user;

    // TODO: Implement UserPreferences model or add to User model
    // For now, return default preferences
    const defaultPreferences = {
      channels: {
        inApp: true,
        email: true,
        sms: false,
        push: true,
      },
      types: {
        employee_created: { inApp: true, email: true },
        employee_updated: { inApp: true, email: false },
        department_created: { inApp: true, email: true },
        candidate_applied: { inApp: true, email: true },
        interview_scheduled: { inApp: true, email: true },
        interview_reminder: { inApp: true, email: true },
        offer_sent: { inApp: true, email: true },
        workflow_assigned: { inApp: true, email: true },
        mention: { inApp: true, email: true },
        comment: { inApp: true, email: false },
        system: { inApp: true, email: false },
        announcement: { inApp: true, email: true },
      },
      digestFrequency: 'daily', // 'realtime', 'hourly', 'daily', 'weekly'
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
    };

    res.status(200).json({
      success: true,
      data: { preferences: defaultPreferences },
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification preferences',
      error: error.message,
    });
  }
};

/**
 * Update notification preferences
 * PUT /api/v1/notifications/preferences
 */
exports.updatePreferences = async (req, res) => {
  try {
    const { userId } = req.user;
    const preferences = req.body;

    // TODO: Save to UserPreferences model or User model

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated',
      data: { preferences },
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences',
      error: error.message,
    });
  }
};
