const Organization = require('../models/Organization');
const emailService = require('../services/emailService');
const domainService = require('../services/domainService');
const fileUploadService = require('../services/fileUploadService');

/**
 * Start onboarding process
 * POST /api/v1/onboarding/start
 */
exports.startOnboarding = async (req, res) => {
  try {
    const { userId } = req.user; // From auth middleware

    // Check if organization already exists for this user
    let organization = await Organization.findOne({ createdBy: userId });

    if (organization) {
      return res.status(200).json({
        success: true,
        message: 'Onboarding already started',
        data: {
          organizationId: organization._id,
          status: organization.onboarding.status,
          currentStep: organization.onboarding.currentStep,
        },
      });
    }

    // Create new organization
    organization = new Organization({
      name: 'New Organization',
      onboarding: {
        status: 'in_progress',
        currentStep: 'company-profile',
      },
      createdBy: userId,
    });

    await organization.save();

    res.status(201).json({
      success: true,
      message: 'Onboarding started successfully',
      data: {
        organizationId: organization._id,
        status: organization.onboarding.status,
        currentStep: organization.onboarding.currentStep,
      },
    });
  } catch (error) {
    console.error('Start onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start onboarding',
      error: error.message,
    });
  }
};

/**
 * Save company profile
 * POST /api/v1/onboarding/company-profile
 */
exports.saveCompanyProfile = async (req, res) => {
  try {
    const { organizationId } = req.body;
    const {
      companyName,
      industry,
      companySize,
      headquarters,
      taxId,
      website,
    } = req.body;

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    // Update organization details
    organization.name = companyName;
    organization.industry = industry;
    organization.companySize = companySize;
    organization.headquarters = headquarters;
    organization.taxId = taxId;
    organization.website = website;

    // Mark step as completed
    organization.onboarding.completedSteps.push({
      step: 'company-profile',
      completedAt: new Date(),
    });
    organization.onboarding.currentStep = 'subscription';

    await organization.save();

    res.status(200).json({
      success: true,
      message: 'Company profile saved successfully',
      data: {
        organization: {
          id: organization._id,
          name: organization.name,
          slug: organization.slug,
        },
      },
    });
  } catch (error) {
    console.error('Save company profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save company profile',
      error: error.message,
    });
  }
};

/**
 * Save subscription plan
 * POST /api/v1/onboarding/subscription
 */
exports.saveSubscription = async (req, res) => {
  try {
    const { organizationId, subscriptionPlan, billingEmail } = req.body;

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    // Update subscription
    organization.subscription.plan = subscriptionPlan;
    organization.subscription.billingEmail = billingEmail;
    organization.subscription.status = 'trial';
    organization.subscription.trialEndsAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ); // 30 days trial

    // Set limits based on plan
    const planLimits = {
      starter: { users: 5, candidates: 1000, jobs: 20, storage: 5368709120 },
      pro: { users: 25, candidates: 10000, jobs: 100, storage: 53687091200 },
      enterprise: { users: -1, candidates: -1, jobs: -1, storage: -1 }, // Unlimited
    };

    organization.limits = planLimits[subscriptionPlan] || planLimits.starter;

    // Mark step as completed
    organization.onboarding.completedSteps.push({
      step: 'subscription',
      completedAt: new Date(),
    });
    organization.onboarding.currentStep = 'domain';

    await organization.save();

    res.status(200).json({
      success: true,
      message: 'Subscription plan saved successfully',
      data: {
        plan: organization.subscription.plan,
        limits: organization.limits,
        trialEndsAt: organization.subscription.trialEndsAt,
      },
    });
  } catch (error) {
    console.error('Save subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save subscription',
      error: error.message,
    });
  }
};

/**
 * Configure domain
 * POST /api/v1/onboarding/domain
 */
exports.configureDomain = async (req, res) => {
  try {
    const { organizationId, domainType, subdomain, customDomain } = req.body;

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    organization.domain.type = domainType;

    if (domainType === 'subdomain') {
      // Validate subdomain availability
      const existingOrg = await Organization.findOne({
        'domain.subdomain': subdomain,
        _id: { $ne: organizationId },
      });

      if (existingOrg) {
        return res.status(400).json({
          success: false,
          message: 'Subdomain already taken',
        });
      }

      organization.domain.subdomain = subdomain;
      organization.domain.verified = true;
      organization.domain.verifiedAt = new Date();
      organization.domain.sslStatus = 'active'; // Auto-provision for subdomain

      // Mark step as completed
      organization.onboarding.completedSteps.push({
        step: 'domain',
        completedAt: new Date(),
      });
      organization.onboarding.currentStep = 'branding';

      await organization.save();

      res.status(200).json({
        success: true,
        message: 'Subdomain configured successfully',
        data: {
          domainUrl: organization.domainUrl,
          verified: true,
        },
      });
    } else if (domainType === 'custom') {
      organization.domain.customDomain = customDomain;
      organization.domain.verified = false;

      // Generate verification token
      organization.domain.verificationToken = domainService.generateVerificationToken();

      await organization.save();

      // Get DNS instructions
      const dnsInstructions = domainService.getDNSInstructions(customDomain);

      res.status(200).json({
        success: true,
        message: 'Custom domain added. Please configure DNS records.',
        data: {
          domainUrl: `https://${customDomain}`,
          verified: false,
          verificationToken: organization.domain.verificationToken,
          dnsInstructions,
        },
      });
    }
  } catch (error) {
    console.error('Configure domain error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to configure domain',
      error: error.message,
    });
  }
};

/**
 * Verify custom domain
 * POST /api/v1/onboarding/domain/verify
 */
exports.verifyDomain = async (req, res) => {
  try {
    const { organizationId } = req.body;

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    if (organization.domain.type !== 'custom') {
      return res.status(400).json({
        success: false,
        message: 'Not a custom domain',
      });
    }

    // Verify DNS records
    const isVerified = await domainService.verifyDNSRecords(
      organization.domain.customDomain
    );

    if (isVerified) {
      organization.domain.verified = true;
      organization.domain.verifiedAt = new Date();
      organization.domain.sslStatus = 'pending';

      // Mark step as completed
      organization.onboarding.completedSteps.push({
        step: 'domain',
        completedAt: new Date(),
      });
      organization.onboarding.currentStep = 'branding';

      // Initiate SSL certificate provisioning
      domainService.provisionSSL(organization.domain.customDomain);

      await organization.save();

      res.status(200).json({
        success: true,
        message: 'Domain verified successfully',
        data: {
          verified: true,
          sslStatus: organization.domain.sslStatus,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'DNS records not found or incorrect',
        data: {
          verified: false,
        },
      });
    }
  } catch (error) {
    console.error('Verify domain error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify domain',
      error: error.message,
    });
  }
};

/**
 * Save branding
 * POST /api/v1/onboarding/branding
 */
exports.saveBranding = async (req, res) => {
  try {
    const { organizationId, colors, fonts } = req.body;
    const { logo, favicon } = req.files || {};

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    // Upload logo to S3
    if (logo) {
      const logoUpload = await fileUploadService.uploadFile(logo[0], 'logos');
      organization.branding.logo = {
        url: logoUpload.url,
        filename: logoUpload.filename,
        size: logoUpload.size,
        uploadedAt: new Date(),
      };
    }

    // Upload favicon to S3
    if (favicon) {
      const faviconUpload = await fileUploadService.uploadFile(
        favicon[0],
        'favicons'
      );
      organization.branding.favicon = {
        url: faviconUpload.url,
        filename: faviconUpload.filename,
        uploadedAt: new Date(),
      };
    }

    // Save colors and fonts
    if (colors) {
      organization.branding.colors = JSON.parse(colors);
    }

    if (fonts) {
      organization.branding.fonts = JSON.parse(fonts);
    }

    // Mark step as completed
    organization.onboarding.completedSteps.push({
      step: 'branding',
      completedAt: new Date(),
    });
    organization.onboarding.currentStep = 'email';

    await organization.save();

    res.status(200).json({
      success: true,
      message: 'Branding saved successfully',
      data: {
        branding: organization.branding,
      },
    });
  } catch (error) {
    console.error('Save branding error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save branding',
      error: error.message,
    });
  }
};

/**
 * Configure email
 * POST /api/v1/onboarding/email-config
 */
exports.configureEmail = async (req, res) => {
  try {
    const { organizationId, smtpProvider, smtpConfig } = req.body;

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    // Set email domain
    organization.email.domain = organization.emailDomain;

    if (smtpProvider && smtpProvider !== '') {
      organization.email.smtpProvider = smtpProvider;
      organization.email.smtpConfig = smtpConfig;

      // Test email configuration
      const testResult = await emailService.testConfiguration(
        smtpProvider,
        smtpConfig
      );

      if (!testResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Email configuration test failed',
          error: testResult.error,
        });
      }

      organization.email.verified = true;
      organization.email.verifiedAt = new Date();

      // Configure DNS records for email
      organization.email.dnsRecords = emailService.generateDNSRecords(
        organization.email.domain
      );

      organization.email.deliverabilityStatus = {
        spf: true,
        dkim: true,
        dmarc: true,
      };
    }

    // Mark step as completed
    organization.onboarding.completedSteps.push({
      step: 'email',
      completedAt: new Date(),
    });
    organization.onboarding.currentStep = 'complete';

    await organization.save();

    res.status(200).json({
      success: true,
      message: 'Email configuration saved successfully',
      data: {
        emailDomain: organization.email.domain,
        verified: organization.email.verified,
        dnsRecords: organization.email.dnsRecords,
      },
    });
  } catch (error) {
    console.error('Configure email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to configure email',
      error: error.message,
    });
  }
};

/**
 * Complete onboarding
 * POST /api/v1/onboarding/complete
 */
exports.completeOnboarding = async (req, res) => {
  try {
    const { organizationId } = req.body;

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    organization.onboarding.status = 'completed';
    organization.onboarding.completedAt = new Date();
    organization.status = 'active';

    await organization.save();

    // Send welcome email
    if (organization.email.verified && organization.subscription.billingEmail) {
      await emailService.sendWelcomeEmail(
        organization.subscription.billingEmail,
        {
          companyName: organization.name,
          domainUrl: organization.domainUrl,
          plan: organization.subscription.plan,
        }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully',
      data: {
        organization: {
          id: organization._id,
          name: organization.name,
          slug: organization.slug,
          domainUrl: organization.domainUrl,
          plan: organization.subscription.plan,
        },
      },
    });
  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete onboarding',
      error: error.message,
    });
  }
};

/**
 * Get onboarding status
 * GET /api/v1/onboarding/status
 */
exports.getOnboardingStatus = async (req, res) => {
  try {
    const { organizationId } = req.query;

    const organization = await Organization.findById(organizationId).select(
      'onboarding name slug domain subscription'
    );

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        status: organization.onboarding.status,
        currentStep: organization.onboarding.currentStep,
        completedSteps: organization.onboarding.completedSteps,
        organization: {
          name: organization.name,
          slug: organization.slug,
          domainUrl: organization.domainUrl,
        },
      },
    });
  } catch (error) {
    console.error('Get onboarding status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get onboarding status',
      error: error.message,
    });
  }
};
