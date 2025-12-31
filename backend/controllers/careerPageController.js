const CareerPage = require('../models/CareerPage');
const Organization = require('../models/Organization');
const fileUploadService = require('../services/fileUploadService');

/**
 * Get career page for organization
 * GET /api/v1/career-pages
 */
exports.getCareerPage = async (req, res) => {
  try {
    const { organizationId } = req.user;

    let careerPage = await CareerPage.findOne({ organizationId });

    if (!careerPage) {
      // Create default career page
      const organization = await Organization.findById(organizationId);

      careerPage = new CareerPage({
        organizationId,
        title: `Careers at ${organization.name}`,
        hero: {
          headline: `Join ${organization.name}`,
          subheadline: 'Build your career with us and make an impact',
        },
        theme: {
          primaryColor: organization.branding?.colors?.primary || '#3B82F6',
          secondaryColor: organization.branding?.colors?.secondary || '#8B5CF6',
          accentColor: organization.branding?.colors?.accent || '#10B981',
        },
        sections: [
          {
            type: 'about',
            title: 'About Us',
            content: 'We are building something amazing. Join us on this journey.',
            enabled: true,
            order: 0,
          },
          {
            type: 'jobs',
            title: 'Open Positions',
            subtitle: 'Find your next opportunity',
            enabled: true,
            order: 1,
          },
          {
            type: 'benefits',
            title: 'Benefits & Perks',
            subtitle: 'Why work with us',
            enabled: true,
            order: 2,
            items: [
              {
                title: 'Health Insurance',
                description: 'Comprehensive medical, dental, and vision coverage',
                icon: 'heart',
              },
              {
                title: 'Flexible Work',
                description: 'Work from anywhere with flexible hours',
                icon: 'home',
              },
              {
                title: 'Learning Budget',
                description: 'Annual budget for courses and conferences',
                icon: 'book',
              },
            ],
          },
        ],
        contactEmail: organization.contact?.email,
        lastModifiedBy: req.user.userId,
      });

      await careerPage.save();
    }

    res.status(200).json({
      success: true,
      data: { careerPage },
    });
  } catch (error) {
    console.error('Get career page error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get career page',
      error: error.message,
    });
  }
};

/**
 * Update career page
 * PUT /api/v1/career-pages
 */
exports.updateCareerPage = async (req, res) => {
  try {
    const { organizationId, userId } = req.user;
    const updateData = req.body;

    const careerPage = await CareerPage.findOne({ organizationId });

    if (!careerPage) {
      return res.status(404).json({
        success: false,
        message: 'Career page not found',
      });
    }

    // Update fields
    if (updateData.title) careerPage.title = updateData.title;
    if (updateData.metaDescription) careerPage.metaDescription = updateData.metaDescription;
    if (updateData.metaKeywords) careerPage.metaKeywords = updateData.metaKeywords;

    if (updateData.hero) {
      careerPage.hero = { ...careerPage.hero.toObject(), ...updateData.hero };
    }

    if (updateData.theme) {
      careerPage.theme = { ...careerPage.theme.toObject(), ...updateData.theme };
    }

    if (updateData.sections) {
      careerPage.sections = updateData.sections;
    }

    if (updateData.socialLinks) {
      careerPage.socialLinks = updateData.socialLinks;
    }

    if (updateData.showJobCount !== undefined) {
      careerPage.showJobCount = updateData.showJobCount;
    }

    if (updateData.enableApplications !== undefined) {
      careerPage.enableApplications = updateData.enableApplications;
    }

    if (updateData.contactEmail) {
      careerPage.contactEmail = updateData.contactEmail;
    }

    careerPage.lastModifiedBy = userId;
    await careerPage.save();

    res.status(200).json({
      success: true,
      message: 'Career page updated successfully',
      data: { careerPage },
    });
  } catch (error) {
    console.error('Update career page error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update career page',
      error: error.message,
    });
  }
};

/**
 * Upload hero background image
 * POST /api/v1/career-pages/upload-hero
 */
exports.uploadHeroImage = async (req, res) => {
  try {
    const { organizationId, userId } = req.user;
    const { file } = req;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided',
      });
    }

    const careerPage = await CareerPage.findOne({ organizationId });

    if (!careerPage) {
      return res.status(404).json({
        success: false,
        message: 'Career page not found',
      });
    }

    const uploadResult = await fileUploadService.uploadFile(file, 'career-pages');

    careerPage.hero.backgroundImage = {
      url: uploadResult.url,
      filename: uploadResult.filename,
    };
    careerPage.lastModifiedBy = userId;
    await careerPage.save();

    res.status(200).json({
      success: true,
      message: 'Hero image uploaded successfully',
      data: {
        url: uploadResult.url,
        filename: uploadResult.filename,
      },
    });
  } catch (error) {
    console.error('Upload hero image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload hero image',
      error: error.message,
    });
  }
};

/**
 * Publish career page
 * POST /api/v1/career-pages/publish
 */
exports.publishCareerPage = async (req, res) => {
  try {
    const { organizationId } = req.user;

    const careerPage = await CareerPage.findOne({ organizationId });

    if (!careerPage) {
      return res.status(404).json({
        success: false,
        message: 'Career page not found',
      });
    }

    await careerPage.publish();

    res.status(200).json({
      success: true,
      message: 'Career page published successfully',
      data: { careerPage },
    });
  } catch (error) {
    console.error('Publish career page error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish career page',
      error: error.message,
    });
  }
};

/**
 * Unpublish career page
 * POST /api/v1/career-pages/unpublish
 */
exports.unpublishCareerPage = async (req, res) => {
  try {
    const { organizationId } = req.user;

    const careerPage = await CareerPage.findOne({ organizationId });

    if (!careerPage) {
      return res.status(404).json({
        success: false,
        message: 'Career page not found',
      });
    }

    await careerPage.unpublish();

    res.status(200).json({
      success: true,
      message: 'Career page unpublished successfully',
      data: { careerPage },
    });
  } catch (error) {
    console.error('Unpublish career page error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unpublish career page',
      error: error.message,
    });
  }
};

/**
 * Get public career page by slug (NO AUTH REQUIRED)
 * GET /api/v1/public/career-pages/:slug
 */
exports.getPublicCareerPage = async (req, res) => {
  try {
    const { slug } = req.params;

    const careerPage = await CareerPage.getPublishedPage(slug);

    if (!careerPage) {
      return res.status(404).json({
        success: false,
        message: 'Career page not found or not published',
      });
    }

    // Get organization details
    const organization = await Organization.findById(careerPage.organizationId).select(
      'name branding domain'
    );

    // Get active jobs count (if jobs section enabled)
    let activeJobsCount = 0;
    const jobsSection = careerPage.sections.find((s) => s.type === 'jobs' && s.enabled);
    if (jobsSection) {
      const Job = require('../models/Job');
      activeJobsCount = await Job.countDocuments({
        organizationId: careerPage.organizationId,
        status: 'open',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        careerPage,
        organization: {
          name: organization.name,
          logo: organization.branding?.logo?.url,
        },
        activeJobsCount,
      },
    });
  } catch (error) {
    console.error('Get public career page error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get career page',
      error: error.message,
    });
  }
};

/**
 * Add section to career page
 * POST /api/v1/career-pages/sections
 */
exports.addSection = async (req, res) => {
  try {
    const { organizationId, userId } = req.user;
    const sectionData = req.body;

    const careerPage = await CareerPage.findOne({ organizationId });

    if (!careerPage) {
      return res.status(404).json({
        success: false,
        message: 'Career page not found',
      });
    }

    await careerPage.addSection(sectionData);
    careerPage.lastModifiedBy = userId;
    await careerPage.save();

    res.status(201).json({
      success: true,
      message: 'Section added successfully',
      data: { careerPage },
    });
  } catch (error) {
    console.error('Add section error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add section',
      error: error.message,
    });
  }
};

/**
 * Remove section from career page
 * DELETE /api/v1/career-pages/sections/:sectionId
 */
exports.removeSection = async (req, res) => {
  try {
    const { organizationId, userId } = req.user;
    const { sectionId } = req.params;

    const careerPage = await CareerPage.findOne({ organizationId });

    if (!careerPage) {
      return res.status(404).json({
        success: false,
        message: 'Career page not found',
      });
    }

    await careerPage.removeSection(sectionId);
    careerPage.lastModifiedBy = userId;
    await careerPage.save();

    res.status(200).json({
      success: true,
      message: 'Section removed successfully',
      data: { careerPage },
    });
  } catch (error) {
    console.error('Remove section error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove section',
      error: error.message,
    });
  }
};

/**
 * Reorder sections
 * PUT /api/v1/career-pages/sections/reorder
 */
exports.reorderSections = async (req, res) => {
  try {
    const { organizationId, userId } = req.user;
    const { sectionIds } = req.body;

    if (!Array.isArray(sectionIds)) {
      return res.status(400).json({
        success: false,
        message: 'sectionIds must be an array',
      });
    }

    const careerPage = await CareerPage.findOne({ organizationId });

    if (!careerPage) {
      return res.status(404).json({
        success: false,
        message: 'Career page not found',
      });
    }

    await careerPage.reorderSections(sectionIds);
    careerPage.lastModifiedBy = userId;
    await careerPage.save();

    res.status(200).json({
      success: true,
      message: 'Sections reordered successfully',
      data: { careerPage },
    });
  } catch (error) {
    console.error('Reorder sections error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder sections',
      error: error.message,
    });
  }
};
