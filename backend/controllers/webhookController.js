const Webhook = require('../models/Webhook');
const { testWebhook, generateSignature } = require('../services/webhookService');
const crypto = require('crypto');

/**
 * Get all webhooks for organization
 * GET /api/v1/webhooks
 */
exports.getWebhooks = async (req, res) => {
  try {
    const { status, event } = req.query;
    const organizationId = req.user.organizationId;

    const query = { organizationId };
    if (status) query.status = status;
    if (event) query.events = event;

    const webhooks = await Webhook.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        webhooks,
        count: webhooks.length,
      },
    });
  } catch (error) {
    console.error('Get webhooks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve webhooks',
      error: error.message,
    });
  }
};

/**
 * Get single webhook
 * GET /api/v1/webhooks/:id
 */
exports.getWebhook = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;

    const webhook = await Webhook.findOne({ _id: id, organizationId })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!webhook) {
      return res.status(404).json({
        success: false,
        message: 'Webhook not found',
      });
    }

    res.json({
      success: true,
      data: { webhook },
    });
  } catch (error) {
    console.error('Get webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve webhook',
      error: error.message,
    });
  }
};

/**
 * Create webhook
 * POST /api/v1/webhooks
 */
exports.createWebhook = async (req, res) => {
  try {
    const {
      name,
      url,
      events,
      headers,
      retryPolicy,
    } = req.body;

    const organizationId = req.user.organizationId;
    const userId = req.user._id;

    // Validate required fields
    if (!name || !url || !events || events.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Name, URL, and at least one event are required',
      });
    }

    // Generate secure random secret
    const secret = crypto.randomBytes(32).toString('hex');

    const webhook = new Webhook({
      organizationId,
      name,
      url,
      secret,
      events,
      headers: headers ? new Map(Object.entries(headers)) : new Map(),
      retryPolicy,
      createdBy: userId,
      updatedBy: userId,
    });

    await webhook.save();

    res.status(201).json({
      success: true,
      data: {
        webhook,
        message: 'Webhook created successfully. Save the secret - it will not be shown again!',
      },
    });
  } catch (error) {
    console.error('Create webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create webhook',
      error: error.message,
    });
  }
};

/**
 * Update webhook
 * PUT /api/v1/webhooks/:id
 */
exports.updateWebhook = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      url,
      events,
      status,
      headers,
      retryPolicy,
    } = req.body;

    const organizationId = req.user.organizationId;
    const userId = req.user._id;

    const webhook = await Webhook.findOne({ _id: id, organizationId });

    if (!webhook) {
      return res.status(404).json({
        success: false,
        message: 'Webhook not found',
      });
    }

    // Update fields
    if (name) webhook.name = name;
    if (url) webhook.url = url;
    if (events) webhook.events = events;
    if (status) webhook.status = status;
    if (headers) webhook.headers = new Map(Object.entries(headers));
    if (retryPolicy) webhook.retryPolicy = { ...webhook.retryPolicy, ...retryPolicy };

    webhook.updatedBy = userId;

    await webhook.save();

    res.json({
      success: true,
      data: { webhook },
      message: 'Webhook updated successfully',
    });
  } catch (error) {
    console.error('Update webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update webhook',
      error: error.message,
    });
  }
};

/**
 * Delete webhook
 * DELETE /api/v1/webhooks/:id
 */
exports.deleteWebhook = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;

    const webhook = await Webhook.findOneAndDelete({ _id: id, organizationId });

    if (!webhook) {
      return res.status(404).json({
        success: false,
        message: 'Webhook not found',
      });
    }

    res.json({
      success: true,
      message: 'Webhook deleted successfully',
    });
  } catch (error) {
    console.error('Delete webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete webhook',
      error: error.message,
    });
  }
};

/**
 * Test webhook endpoint
 * POST /api/v1/webhooks/:id/test
 */
exports.testWebhookEndpoint = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;

    const webhook = await Webhook.findOne({ _id: id, organizationId });

    if (!webhook) {
      return res.status(404).json({
        success: false,
        message: 'Webhook not found',
      });
    }

    const testResult = await testWebhook(webhook.url, webhook.secret);

    // Log the test delivery
    webhook.addDeliveryLog({
      status: testResult.success ? 'success' : 'failed',
      httpStatus: testResult.httpStatus,
      responseTime: testResult.responseTime,
      requestBody: { event: 'webhook.test', timestamp: new Date() },
      responseBody: testResult.response,
      errorMessage: testResult.error,
      attemptNumber: 1,
      deliveredAt: testResult.success ? new Date() : undefined,
    });

    await webhook.save();

    res.json({
      success: true,
      data: testResult,
    });
  } catch (error) {
    console.error('Test webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test webhook',
      error: error.message,
    });
  }
};

/**
 * Get webhook delivery logs
 * GET /api/v1/webhooks/:id/logs
 */
exports.getWebhookLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, status } = req.query;
    const organizationId = req.user.organizationId;

    const webhook = await Webhook.findOne({ _id: id, organizationId });

    if (!webhook) {
      return res.status(404).json({
        success: false,
        message: 'Webhook not found',
      });
    }

    let logs = webhook.recentDeliveries || [];

    // Filter by status if provided
    if (status) {
      logs = logs.filter(log => log.status === status);
    }

    // Sort by newest first
    logs = logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Limit results
    logs = logs.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        logs,
        count: logs.length,
        stats: webhook.deliveryStats,
      },
    });
  } catch (error) {
    console.error('Get webhook logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve webhook logs',
      error: error.message,
    });
  }
};

/**
 * Regenerate webhook secret
 * POST /api/v1/webhooks/:id/regenerate-secret
 */
exports.regenerateSecret = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    const userId = req.user._id;

    const webhook = await Webhook.findOne({ _id: id, organizationId });

    if (!webhook) {
      return res.status(404).json({
        success: false,
        message: 'Webhook not found',
      });
    }

    // Generate new secret
    const newSecret = crypto.randomBytes(32).toString('hex');
    webhook.secret = newSecret;
    webhook.updatedBy = userId;

    await webhook.save();

    res.json({
      success: true,
      data: {
        webhook,
        message: 'Secret regenerated successfully. Update your webhook receiver with the new secret!',
      },
    });
  } catch (error) {
    console.error('Regenerate secret error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate secret',
      error: error.message,
    });
  }
};

/**
 * Get available webhook events
 * GET /api/v1/webhooks/events
 */
exports.getAvailableEvents = async (req, res) => {
  try {
    const events = [
      { value: 'candidate.created', label: 'Candidate Created', category: 'candidates' },
      { value: 'candidate.updated', label: 'Candidate Updated', category: 'candidates' },
      { value: 'candidate.deleted', label: 'Candidate Deleted', category: 'candidates' },
      { value: 'employee.created', label: 'Employee Created', category: 'employees' },
      { value: 'employee.updated', label: 'Employee Updated', category: 'employees' },
      { value: 'employee.terminated', label: 'Employee Terminated', category: 'employees' },
      { value: 'job.created', label: 'Job Created', category: 'jobs' },
      { value: 'job.updated', label: 'Job Updated', category: 'jobs' },
      { value: 'job.closed', label: 'Job Closed', category: 'jobs' },
      { value: 'interview.scheduled', label: 'Interview Scheduled', category: 'interviews' },
      { value: 'interview.completed', label: 'Interview Completed', category: 'interviews' },
      { value: 'interview.cancelled', label: 'Interview Cancelled', category: 'interviews' },
      { value: 'offer.sent', label: 'Offer Sent', category: 'offers' },
      { value: 'offer.accepted', label: 'Offer Accepted', category: 'offers' },
      { value: 'offer.rejected', label: 'Offer Rejected', category: 'offers' },
      { value: 'application.submitted', label: 'Application Submitted', category: 'applications' },
      { value: 'application.reviewed', label: 'Application Reviewed', category: 'applications' },
      { value: 'department.created', label: 'Department Created', category: 'departments' },
      { value: 'department.updated', label: 'Department Updated', category: 'departments' },
      { value: 'onboarding.completed', label: 'Onboarding Completed', category: 'onboarding' },
      { value: 'workflow.completed', label: 'Workflow Completed', category: 'workflows' },
      { value: 'notification.sent', label: 'Notification Sent', category: 'notifications' },
    ];

    res.json({
      success: true,
      data: { events },
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve events',
      error: error.message,
    });
  }
};
