const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

/**
 * File Upload Service - Handles file uploads to S3 or local storage
 * In production, integrate with AWS S3, Google Cloud Storage, or Azure Blob
 */

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Ensure upload directory exists
const ensureUploadDir = async () => {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
};

/**
 * Upload file
 */
exports.uploadFile = async (file, folder = 'general') => {
  try {
    await ensureUploadDir();

    const folderPath = path.join(UPLOAD_DIR, folder);
    await fs.mkdir(folderPath, { recursive: true });

    // Generate unique filename
    const ext = path.extname(file.originalname);
    const hash = crypto.randomBytes(16).toString('hex');
    const filename = `${hash}${ext}`;
    const filepath = path.join(folderPath, filename);

    // Save file
    await fs.writeFile(filepath, file.buffer);

    const url = `${BASE_URL}/uploads/${folder}/${filename}`;

    console.log(`[FileUploadService] File uploaded: ${url}`);

    return {
      url,
      filename,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    };
  } catch (error) {
    console.error(`[FileUploadService] Upload failed:`, error);
    throw error;
  }
};

/**
 * Delete file
 */
exports.deleteFile = async (filepath) => {
  try {
    const fullPath = path.join(UPLOAD_DIR, filepath);
    await fs.unlink(fullPath);
    console.log(`[FileUploadService] File deleted: ${filepath}`);
    return { success: true };
  } catch (error) {
    console.error(`[FileUploadService] Delete failed:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Get file info
 */
exports.getFileInfo = async (filepath) => {
  try {
    const fullPath = path.join(UPLOAD_DIR, filepath);
    const stats = await fs.stat(fullPath);

    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
    };
  } catch (error) {
    return null;
  }
};

/**
 * Validate file type
 */
exports.validateFileType = (file, allowedTypes) => {
  const fileExt = path.extname(file.originalname).toLowerCase();
  return allowedTypes.some((type) => {
    if (type.startsWith('.')) {
      return fileExt === type;
    }
    return file.mimetype.startsWith(type);
  });
};

/**
 * Validate file size
 */
exports.validateFileSize = (file, maxSizeBytes) => {
  return file.size <= maxSizeBytes;
};

/**
 * In production, integrate with AWS S3:
 */
/*
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

exports.uploadToS3 = async (file, folder) => {
  const ext = path.extname(file.originalname);
  const hash = crypto.randomBytes(16).toString('hex');
  const key = `${folder}/${hash}${ext}`;

  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
  };

  const result = await s3.upload(params).promise();
  return {
    url: result.Location,
    key: result.Key,
    bucket: result.Bucket,
  };
};
*/
