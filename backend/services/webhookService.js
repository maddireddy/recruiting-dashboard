const crypto = require('crypto');
const axios = require('axios');
const Webhook = require('../models/Webhook');

/**
 * Generate HMAC signature for webhook payload
 * @param {string} payload - JSON stringified payload
 * @param {string} secret - Webhook secret
 * @returns {string} HMAC signature
 */
function generateSignature(payload, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
}

/**
 * Deliver webhook to endpoint
 * @param {Object} webhook - Webhook document
 * @param {Object} payload - Event payload
 * @param {number} attemptNumber - Attempt number (for retries)
 * @returns {Promise<Object>} Delivery result
 */
async function deliverWebhook(webhook, payload, attemptNumber = 1) {
  const startTime = Date.now();
  const payloadString = JSON.stringify(payload);
  const signature = generateSignature(payloadString, webhook.secret);

  const headers = {
    'Content-Type': 'application/json',
    'X-Webhook-Signature': signature,
    'X-Webhook-Event': payload.event,
    'X-Webhook-Delivery-ID': new Date().getTime().toString(),
    'X-Webhook-Attempt': attemptNumber.toString(),
    'User-Agent': 'RecruitingDashboard-Webhooks/1.0',
    ...Object.fromEntries(webhook.headers || new Map()),
  };

  const deliveryLog = {
    status: 'pending',
    attemptNumber,
    requestBody: payload,
  };

  try {
    const response = await axios.post(webhook.url, payload, {
      headers,
      timeout: 10000, // 10 second timeout
      validateStatus: (status) => status >= 200 && status < 600, // Don't throw on any status
    });

    const responseTime = Date.now() - startTime;
    const isSuccess = response.status >= 200 && response.status < 300;

    deliveryLog.httpStatus = response.status;
    deliveryLog.responseTime = responseTime;
    deliveryLog.responseBody = response.data;
    deliveryLog.status = isSuccess ? 'success' : 'failed';
    deliveryLog.deliveredAt = new Date();

    if (!isSuccess) {
      deliveryLog.errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }

    // Save delivery log
    webhook.addDeliveryLog(deliveryLog);
    await webhook.save();

    return {
      success: isSuccess,
      httpStatus: response.status,
      responseTime,
      shouldRetry: !isSuccess && webhook.shouldRetry(attemptNumber),
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    deliveryLog.status = 'failed';
    deliveryLog.responseTime = responseTime;
    deliveryLog.errorMessage = error.message;

    if (error.response) {
      deliveryLog.httpStatus = error.response.status;
      deliveryLog.responseBody = error.response.data;
    }

    // Save delivery log
    webhook.addDeliveryLog(deliveryLog);

    // Schedule retry if applicable
    if (webhook.shouldRetry(attemptNumber)) {
      const retryDelay = webhook.calculateNextRetryDelay(attemptNumber);
      const nextRetryAt = new Date(Date.now() + retryDelay);

      deliveryLog.status = 'retrying';
      deliveryLog.nextRetryAt = nextRetryAt;

      // TODO: Implement retry queue (Redis/BullMQ in production)
      console.log(`[Webhook] Scheduling retry for webhook ${webhook._id} in ${retryDelay}ms`);

      // For now, save the retry timestamp
      await webhook.save();

      return {
        success: false,
        error: error.message,
        shouldRetry: true,
        nextRetryAt,
        attemptNumber,
      };
    }

    await webhook.save();

    return {
      success: false,
      error: error.message,
      shouldRetry: false,
    };
  }
}

/**
 * Emit event to all subscribed webhooks
 * @param {string} organizationId - Organization ID
 * @param {string} eventType - Event type (e.g., 'candidate.created')
 * @param {Object} eventData - Event payload data
 */
async function emitEvent(organizationId, eventType, eventData) {
  try {
    const webhooks = await Webhook.getActiveWebhooksForEvent(organizationId, eventType);

    if (webhooks.length === 0) {
      console.log(`[Webhook] No webhooks configured for event: ${eventType}`);
      return;
    }

    console.log(`[Webhook] Emitting event ${eventType} to ${webhooks.length} webhooks`);

    const payload = {
      event: eventType,
      timestamp: new Date().toISOString(),
      organizationId: organizationId.toString(),
      data: eventData,
    };

    // Deliver to all webhooks in parallel (non-blocking)
    const deliveryPromises = webhooks.map(webhook =>
      deliverWebhook(webhook, payload).catch(err => {
        console.error(`[Webhook] Failed to deliver to ${webhook.url}:`, err.message);
      })
    );

    // Don't wait for delivery to complete (fire and forget)
    // In production, this would be handled by a queue worker
    Promise.allSettled(deliveryPromises);

    return {
      eventType,
      webhookCount: webhooks.length,
      timestamp: payload.timestamp,
    };
  } catch (error) {
    console.error(`[Webhook] Error emitting event ${eventType}:`, error.message);
    throw error;
  }
}

/**
 * Test webhook endpoint
 * @param {string} url - Webhook URL
 * @param {string} secret - Webhook secret
 * @returns {Promise<Object>} Test result
 */
async function testWebhook(url, secret) {
  const testPayload = {
    event: 'webhook.test',
    timestamp: new Date().toISOString(),
    data: {
      message: 'This is a test webhook delivery',
    },
  };

  const payloadString = JSON.stringify(testPayload);
  const signature = generateSignature(payloadString, secret);

  const startTime = Date.now();

  try {
    const response = await axios.post(url, testPayload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': 'webhook.test',
        'User-Agent': 'RecruitingDashboard-Webhooks/1.0',
      },
      timeout: 10000,
    });

    const responseTime = Date.now() - startTime;

    return {
      success: true,
      httpStatus: response.status,
      responseTime,
      message: 'Webhook test successful',
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return {
      success: false,
      httpStatus: error.response?.status,
      responseTime,
      error: error.message,
      message: 'Webhook test failed',
    };
  }
}

/**
 * Verify webhook signature (for webhook receivers)
 * @param {string} payload - Request body string
 * @param {string} signature - Signature from X-Webhook-Signature header
 * @param {string} secret - Webhook secret
 * @returns {boolean} Whether signature is valid
 */
function verifySignature(payload, signature, secret) {
  const expectedSignature = generateSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

module.exports = {
  generateSignature,
  deliverWebhook,
  emitEvent,
  testWebhook,
  verifySignature,
};
