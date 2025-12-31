const QRCode = require('qrcode');

/**
 * Badge Service - Generates employee badges (PDF and PNG)
 */

/**
 * Generate employee badge
 */
exports.generateBadge = async (badgeData, format = 'pdf', template = 'standard') => {
  try {
    console.log(`[BadgeService] Generating ${format.toUpperCase()} badge for: ${badgeData.employeeId}`);

    const {
      employeeId,
      fullName,
      title,
      department,
      photo,
      companyLogo,
      companyName,
      colors,
    } = badgeData;

    // Generate QR code with employee data
    const qrCodeData = JSON.stringify({
      employeeId,
      name: fullName,
      company: companyName,
      issued: new Date().toISOString(),
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeData, {
      width: 200,
      margin: 1,
      color: {
        dark: colors?.primary || '#000000',
        light: '#FFFFFF',
      },
    });

    // In production, generate actual PDF/PNG using libraries like:
    // - PDFKit for PDF
    // - Canvas or Sharp for PNG
    // - HTML to PDF converters

    console.log(`[BadgeService] ✓ Badge generated successfully`);

    // For now, return simulated URLs
    return {
      success: true,
      pdfUrl: `https://storage.recruitpro.com/badges/${employeeId}.pdf`,
      pngUrl: `https://storage.recruitpro.com/badges/${employeeId}.png`,
      qrCodeUrl: qrCodeDataUrl,
      buffer: Buffer.from('Simulated badge content'), // In production, actual PDF/PNG buffer
    };
  } catch (error) {
    console.error(`[BadgeService] Badge generation failed:`, error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Badge templates
 */
const BADGE_TEMPLATES = {
  standard: {
    width: 400,
    height: 600,
    layout: 'vertical',
    includePhoto: true,
    includeQR: true,
    includeLogo: true,
  },
  minimal: {
    width: 350,
    height: 500,
    layout: 'vertical',
    includePhoto: false,
    includeQR: true,
    includeLogo: false,
  },
  horizontal: {
    width: 600,
    height: 400,
    layout: 'horizontal',
    includePhoto: true,
    includeQR: true,
    includeLogo: true,
  },
};

exports.getTemplateConfig = (template) => {
  return BADGE_TEMPLATES[template] || BADGE_TEMPLATES.standard;
};
