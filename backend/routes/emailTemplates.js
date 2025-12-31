const express = require('express');
const router = express.Router();
const emailTemplateController = require('../controllers/emailTemplateController');
const { authenticateToken, checkPermission } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all templates
router.get('/', checkPermission('settings.edit'), emailTemplateController.getTemplates);

// Create template
router.post('/', checkPermission('settings.edit'), emailTemplateController.createTemplate);

// Preview template
router.post('/:id/preview', checkPermission('settings.edit'), emailTemplateController.previewTemplate);

// Send test email
router.post('/:id/send-test', checkPermission('settings.edit'), emailTemplateController.sendTestEmail);

// Activate template
router.post('/:id/activate', checkPermission('settings.edit'), emailTemplateController.activateTemplate);

// Get template stats
router.get('/:id/stats', checkPermission('settings.edit'), emailTemplateController.getTemplateStats);

// Get single template
router.get('/:id', checkPermission('settings.edit'), emailTemplateController.getTemplate);

// Update template
router.put('/:id', checkPermission('settings.edit'), emailTemplateController.updateTemplate);

// Delete template
router.delete('/:id', checkPermission('settings.edit'), emailTemplateController.deleteTemplate);

module.exports = router;
