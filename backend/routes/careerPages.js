const express = require('express');
const router = express.Router();
const careerPageController = require('../controllers/careerPageController');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public route (NO AUTH)
router.get('/public/:slug', careerPageController.getPublicCareerPage);

// All other routes require authentication
router.use(authenticateToken);

// Get career page
router.get('/', checkPermission('settings.edit'), careerPageController.getCareerPage);

// Update career page
router.put('/', checkPermission('settings.edit'), careerPageController.updateCareerPage);

// Upload hero image
router.post(
  '/upload-hero',
  checkPermission('settings.edit'),
  upload.single('file'),
  careerPageController.uploadHeroImage
);

// Publish/Unpublish
router.post('/publish', checkPermission('settings.edit'), careerPageController.publishCareerPage);
router.post(
  '/unpublish',
  checkPermission('settings.edit'),
  careerPageController.unpublishCareerPage
);

// Section management
router.post('/sections', checkPermission('settings.edit'), careerPageController.addSection);
router.delete(
  '/sections/:sectionId',
  checkPermission('settings.edit'),
  careerPageController.removeSection
);
router.put(
  '/sections/reorder',
  checkPermission('settings.edit'),
  careerPageController.reorderSections
);

module.exports = router;
