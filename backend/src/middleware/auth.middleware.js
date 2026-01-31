const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin.model');
const User = require('../models/User.model');
const Vendor = require('../models/Vendor.model');
const Driver = require('../models/Driver.model');

/**
 * Verify JWT token and attach user to request
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed'
    });
  }
};

/**
 * Admin authorization middleware
 * Checks if user is admin
 */
const adminAuth = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const admin = await Admin.findById(req.user.id);

    if (!admin || !admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authorization error'
    });
  }
};

/**
 * Role-based authorization
 * @param {Array} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.admin.role}' is not authorized to access this route`
      });
    }

    next();
  };
};

/**
 * Telegram user authentication
 * For bot webhook requests
 */
const telegramAuth = (userType) => {
  return async (req, res, next) => {
    try {
      const { telegramId } = req.body;

      if (!telegramId) {
        return res.status(400).json({
          success: false,
          message: 'Telegram ID is required'
        });
      }

      let user;
      switch (userType) {
        case 'customer':
          user = await User.findOne({ telegramId });
          break;
        case 'vendor':
          user = await Vendor.findOne({ telegramId });
          break;
        case 'driver':
          user = await Driver.findOne({ telegramId });
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid user type'
          });
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.status && user.status === 'blocked') {
        return res.status(403).json({
          success: false,
          message: 'User is blocked'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Authentication error'
      });
    }
  };
};

module.exports = {
  protect,
  adminAuth,
  authorize,
  telegramAuth
};
