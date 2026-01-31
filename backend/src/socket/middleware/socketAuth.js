const jwt = require('jsonwebtoken');
const User = require('../../models/User.model');
const Vendor = require('../../models/Vendor.model');
const Driver = require('../../models/Driver.model');
const Admin = require('../../models/Admin.model');
const logger = require('../../utils/logger');

/**
 * Socket.io authentication middleware
 */
const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      return next(new Error('Invalid token'));
    }

    // Try to find user in different collections
    let user;
    let userType;

    // Check Admin
    user = await Admin.findById(decoded.id);
    if (user) {
      userType = 'admin';
    }

    // Check User (Customer)
    if (!user) {
      user = await User.findById(decoded.id);
      if (user) {
        userType = 'customer';
      }
    }

    // Check Vendor
    if (!user) {
      user = await Vendor.findById(decoded.id);
      if (user) {
        userType = 'vendor';
      }
    }

    // Check Driver
    if (!user) {
      user = await Driver.findById(decoded.id);
      if (user) {
        userType = 'driver';
      }
    }

    if (!user) {
      return next(new Error('User not found'));
    }

    // Check if user is active
    if (user.status && user.status !== 'active') {
      return next(new Error('User account is not active'));
    }

    // Attach user info to socket
    socket.user = {
      id: user._id.toString(),
      type: userType,
      data: user
    };

    next();
  } catch (error) {
    logger.error('Socket authentication error:', error);
    next(new Error('Authentication failed'));
  }
};

module.exports = {
  socketAuth
};
