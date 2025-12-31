const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboardingController');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes require authentication
router.use(authenticateToken);

// Start onboarding
router.post('/start', onboardingController.startOnboarding);

// Save company profile
router.post('/company-profile', onboardingController.saveCompanyProfile);

// Save subscription
router.post('/subscription', onboardingController.saveSubscription);

// Configure domain
router.post('/domain', onboardingController.configureDomain);

// Verify domain
router.post('/domain/verify', onboardingController.verifyDomain);

// Save branding (with file uploads)
router.post(
  '/branding',
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 },
  ]),
  onboardingController.saveBranding
);

// Configure email
router.post('/email-config', onboardingController.configureEmail);

// Complete onboarding
router.post('/complete', onboardingController.completeOnboarding);

// Get onboarding status
router.get('/status', onboardingController.getOnboardingStatus);

module.exports = router;
