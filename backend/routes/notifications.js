const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken, checkPermission } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get unread count
router.get('/unread-count', notificationController.getUnreadCount);

// Mark all as read
router.put('/read-all', notificationController.markAllAsRead);

// Notification preferences
router.get('/preferences', notificationController.getPreferences);
router.put('/preferences', notificationController.updatePreferences);

// Get all notifications
router.get('/', notificationController.getNotifications);

// Create notification (admin/system)
router.post('/', checkPermission('notifications.create'), notificationController.createNotification);

// Mark as read
router.put('/:id/read', notificationController.markAsRead);

// Archive notification
router.put('/:id/archive', notificationController.archiveNotification);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
