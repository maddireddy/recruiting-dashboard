const crypto = require('crypto');

/**
 * Email Service - Handles email provisioning and sending
 * Supports SendGrid, AWS SES, Mailgun, and custom SMTP
 */

/**
 * Test SMTP configuration
 */
exports.testConfiguration = async (provider, config) => {
  try {
    // Simulate testing based on provider
    switch (provider) {
      case 'sendgrid':
        return testSendGrid(config);
      case 'aws-ses':
        return testAWSSES(config);
      case 'mailgun':
        return testMailgun(config);
      case 'smtp':
        return testSMTP(config);
      default:
        return { success: false, error: 'Unknown provider' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Provision email account for employee
 */
exports.provisionEmailAccount = async ({
  email,
  firstName,
  lastName,
  organizationId,
  smtpProvider,
  smtpConfig,
}) => {
  try {
    // Generate temporary password
    const tempPassword = generateStrongPassword();

    // In production, this would create the actual email account
    // For now, simulate success
    console.log(`[EmailService] Provisioning email: ${email}`);
    console.log(`[EmailService] Temporary password: ${tempPassword}`);

    // Send welcome email to new account
    await sendWelcomeEmailToEmployee(email, {
      firstName,
      lastName,
      tempPassword,
      smtpProvider,
      smtpConfig,
    });

    return {
      success: true,
      credentials: {
        email,
        tempPassword,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Reset employee password
 */
exports.resetEmployeePassword = async ({
  email,
  tempPassword,
  smtpProvider,
  smtpConfig,
}) => {
  try {
    // Send password reset email
    await sendPasswordResetEmail(email, tempPassword, {
      smtpProvider,
      smtpConfig,
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Generate DNS records for email authentication
 */
exports.generateDNSRecords = (domain) => {
  return {
    mx: [
      { priority: 10, value: `mx1.recruitpro.com` },
      { priority: 20, value: `mx2.recruitpro.com` },
    ],
    txt: [
      `v=spf1 include:_spf.recruitpro.com ~all`,
      `v=DMARC1; p=none; rua=mailto:dmarc@${domain}`,
    ],
    cname: [
      { name: `dkim._domainkey.${domain}`, value: `dkim.recruitpro.com` },
    ],
  };
};

/**
 * Send welcome email to organization
 */
exports.sendWelcomeEmail = async (email, data) => {
  try {
    const { companyName, domainUrl, plan } = data;

    console.log(`[EmailService] Sending welcome email to: ${email}`);
    console.log(`[EmailService] Company: ${companyName}`);
    console.log(`[EmailService] Domain: ${domainUrl}`);
    console.log(`[EmailService] Plan: ${plan}`);

    // In production, send actual email via chosen provider
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Generate temporary password
 */
exports.generateTemporaryPassword = generateStrongPassword;

// Helper Functions

function generateStrongPassword() {
  const length = 16;
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    password += charset[randomIndex];
  }

  return password;
}

async function testSendGrid(config) {
  // In production, test actual SendGrid connection
  const { apiKey } = config;

  if (!apiKey || apiKey.length < 20) {
    return { success: false, error: 'Invalid API key' };
  }

  console.log('[EmailService] Testing SendGrid configuration...');
  // Simulate success
  return { success: true };
}

async function testAWSSES(config) {
  const { apiKey } = config;

  if (!apiKey) {
    return { success: false, error: 'Missing AWS credentials' };
  }

  console.log('[EmailService] Testing AWS SES configuration...');
  return { success: true };
}

async function testMailgun(config) {
  const { apiKey } = config;

  if (!apiKey) {
    return { success: false, error: 'Missing Mailgun API key' };
  }

  console.log('[EmailService] Testing Mailgun configuration...');
  return { success: true };
}

async function testSMTP(config) {
  const { host, port, username, password } = config;

  if (!host || !port || !username || !password) {
    return { success: false, error: 'Missing SMTP credentials' };
  }

  console.log(`[EmailService] Testing SMTP configuration: ${host}:${port}...`);
  return { success: true };
}

async function sendWelcomeEmailToEmployee(email, data) {
  const { firstName, lastName, tempPassword } = data;

  console.log(`[EmailService] Sending welcome email to employee: ${email}`);
  console.log(`[EmailService] Name: ${firstName} ${lastName}`);
  console.log(`[EmailService] Temp Password: ${tempPassword}`);

  // In production, send actual email
  return { success: true };
}

async function sendPasswordResetEmail(email, tempPassword, config) {
  console.log(`[EmailService] Sending password reset email to: ${email}`);
  console.log(`[EmailService] New temp password: ${tempPassword}`);

  // In production, send actual email
  return { success: true };
}
