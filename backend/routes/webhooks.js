const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');
const { authenticateToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// All routes require authentication
router.use(authenticateToken);

// Get available events (public for all authenticated users)
router.get('/events', webhookController.getAvailableEvents);

// Webhook CRUD operations (require admin permission)
router.get('/', checkPermission('webhooks.view'), webhookController.getWebhooks);
router.get('/:id', checkPermission('webhooks.view'), webhookController.getWebhook);
router.post('/', checkPermission('webhooks.create'), webhookController.createWebhook);
router.put('/:id', checkPermission('webhooks.update'), webhookController.updateWebhook);
router.delete('/:id', checkPermission('webhooks.delete'), webhookController.deleteWebhook);

// Webhook operations
router.post('/:id/test', checkPermission('webhooks.test'), webhookController.testWebhookEndpoint);
router.get('/:id/logs', checkPermission('webhooks.view'), webhookController.getWebhookLogs);
router.post('/:id/regenerate-secret', checkPermission('webhooks.update'), webhookController.regenerateSecret);

module.exports = router;
