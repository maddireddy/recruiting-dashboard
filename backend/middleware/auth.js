const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Authenticate JWT token
 */
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required',
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    req.user = user;
    next();
  });
};

/**
 * Check if user has required permission
 */
exports.checkPermission = (permission) => {
  return (req, res, next) => {
    const { permissions } = req.user;

    if (!permissions || !permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: `Permission denied: ${permission} required`,
      });
    }

    next();
  };
};

/**
 * Check if user has required role
 */
exports.checkRole = (roles) => {
  return (req, res, next) => {
    const { role } = req.user;

    if (!roles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${role} not authorized for this action`,
      });
    }

    next();
  };
};

/**
 * Generate JWT token
 */
exports.generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Verify JWT token
 */
exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};
