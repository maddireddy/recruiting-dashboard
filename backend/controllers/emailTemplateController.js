const EmailTemplate = require('../models/EmailTemplate');
const emailService = require('../services/emailService');

/**
 * Get all email templates
 * GET /api/v1/email-templates
 */
exports.getTemplates = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { status, category } = req.query;

    const query = { organizationId };
    if (status) query.status = status;
    if (category) query.category = category;

    const templates = await EmailTemplate.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ category: 1, name: 1 });

    res.status(200).json({
      success: true,
      data: { templates },
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get email templates',
      error: error.message,
    });
  }
};

/**
 * Get single email template
 * GET /api/v1/email-templates/:id
 */
exports.getTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    const template = await EmailTemplate.findOne({
      _id: id,
      organizationId,
    })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Email template not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { template },
    });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get email template',
      error: error.message,
    });
  }
};

/**
 * Create email template
 * POST /api/v1/email-templates
 */
exports.createTemplate = async (req, res) => {
  try {
    const { organizationId, userId } = req.user;
    const {
      name,
      slug,
      description,
      category,
      subject,
      body,
      bodyHtml,
      fromName,
      fromEmail,
      replyTo,
      variables,
      attachments,
      isDefault,
    } = req.body;

    // Check for duplicate slug
    const existing = await EmailTemplate.findOne({
      organizationId,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email template with this slug already exists',
      });
    }

    const template = new EmailTemplate({
      name,
      slug,
      description,
      organizationId,
      category,
      subject,
      body,
      bodyHtml,
      fromName,
      fromEmail,
      replyTo,
      variables,
      attachments,
      isDefault,
      status: 'draft',
      createdBy: userId,
      updatedBy: userId,
    });

    await template.save();

    res.status(201).json({
      success: true,
      message: 'Email template created',
      data: { template },
    });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create email template',
      error: error.message,
    });
  }
};

/**
 * Update email template
 * PUT /api/v1/email-templates/:id
 */
exports.updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId, userId } = req.user;
    const updates = req.body;

    const template = await EmailTemplate.findOne({
      _id: id,
      organizationId,
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Email template not found',
      });
    }

    // Create new version if content changed
    if (updates.subject || updates.body || updates.bodyHtml) {
      await template.createNewVersion(updates, userId);
    } else {
      // Regular update
      Object.keys(updates).forEach((key) => {
        if (updates[key] !== undefined) {
          template[key] = updates[key];
        }
      });
      template.updatedBy = userId;
      await template.save();
    }

    res.status(200).json({
      success: true,
      message: 'Email template updated',
      data: { template },
    });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update email template',
      error: error.message,
    });
  }
};

/**
 * Delete email template
 * DELETE /api/v1/email-templates/:id
 */
exports.deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    const template = await EmailTemplate.findOneAndDelete({
      _id: id,
      organizationId,
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Email template not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Email template deleted',
    });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete email template',
      error: error.message,
    });
  }
};

/**
 * Preview email template with variables
 * POST /api/v1/email-templates/:id/preview
 */
exports.previewTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;
    const { variables } = req.body;

    const template = await EmailTemplate.findOne({
      _id: id,
      organizationId,
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Email template not found',
      });
    }

    const rendered = template.render(variables || {});

    res.status(200).json({
      success: true,
      data: { rendered },
    });
  } catch (error) {
    console.error('Preview template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to preview email template',
      error: error.message,
    });
  }
};

/**
 * Send test email using template
 * POST /api/v1/email-templates/:id/send-test
 */
exports.sendTestEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;
    const { testEmail, variables } = req.body;

    if (!testEmail) {
      return res.status(400).json({
        success: false,
        message: 'Test email address is required',
      });
    }

    const template = await EmailTemplate.findOne({
      _id: id,
      organizationId,
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Email template not found',
      });
    }

    const rendered = template.render(variables || {});

    // Send via email service
    await emailService.sendEmail({
      to: testEmail,
      subject: `[TEST] ${rendered.subject}`,
      text: rendered.body,
      html: rendered.bodyHtml,
      from: template.fromEmail,
      fromName: template.fromName,
      replyTo: template.replyTo,
    });

    res.status(200).json({
      success: true,
      message: `Test email sent to ${testEmail}`,
    });
  } catch (error) {
    console.error('Send test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message,
    });
  }
};

/**
 * Activate/publish email template
 * POST /api/v1/email-templates/:id/activate
 */
exports.activateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId, userId } = req.user;

    const template = await EmailTemplate.findOne({
      _id: id,
      organizationId,
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Email template not found',
      });
    }

    template.status = 'active';
    template.updatedBy = userId;
    await template.save();

    res.status(200).json({
      success: true,
      message: 'Email template activated',
      data: { template },
    });
  } catch (error) {
    console.error('Activate template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate email template',
      error: error.message,
    });
  }
};

/**
 * Get template usage statistics
 * GET /api/v1/email-templates/:id/stats
 */
exports.getTemplateStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    const template = await EmailTemplate.findOne({
      _id: id,
      organizationId,
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Email template not found',
      });
    }

    const stats = {
      usageCount: template.usageCount,
      lastUsedAt: template.lastUsedAt,
      version: template.version,
      versionHistory: template.previousVersions.length,
      status: template.status,
    };

    res.status(200).json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    console.error('Get template stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get template statistics',
      error: error.message,
    });
  }
};
