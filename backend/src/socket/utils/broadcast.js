const logger = require('../../utils/logger');

/**
 * Broadcast order status change to all relevant parties
 * @param {string} orderId - Order ID
 * @param {string} status - New order status
 * @param {object} order - Order object with customer, vendor, driver populated
 */
const broadcastOrderStatus = (orderId, status, order) => {
  try {
    const { getIO } = require('../index');
    const io = getIO();
    const roomName = `order:${orderId}`;
    
    // Broadcast to order room
    io.to(roomName).emit('order:status:changed', {
      orderId,
      status,
      timeline: order.timeline,
      timestamp: new Date()
    });

    // Also emit to customer, vendor, driver rooms
    if (order.customer) {
      io.to(`customer:${order.customer}`).emit('order:update', {
        orderId,
        status,
        message: `Order status updated to ${status}`
      });
    }
    if (order.vendor) {
      io.to(`vendor:${order.vendor}`).emit('order:update', {
        orderId,
        status,
        message: `Order status updated to ${status}`
      });
    }
    if (order.driver) {
      io.to(`driver:${order.driver}`).emit('order:update', {
        orderId,
        status,
        message: `Order status updated to ${status}`
      });
    }
    
    logger.info(`Order status broadcast: ${orderId} -> ${status}`);
  } catch (error) {
    logger.error('Error broadcasting order status:', error);
  }
};

/**
 * Send notification to a specific user
 * @param {string} userType - Type of user (customer, vendor, driver, admin)
 * @param {string} userId - User ID
 * @param {object} notification - Notification object with title, message, etc.
 */
const sendNotification = (userType, userId, notification) => {
  try {
    const { getIO } = require('../index');
    const io = getIO();
    const room = `${userType}:${userId}`;
    
    io.to(room).emit('notification', {
      ...notification,
      timestamp: new Date()
    });
    
    logger.info(`Notification sent to ${room}: ${notification.title}`);
  } catch (error) {
    logger.error('Error sending notification:', error);
  }
};

/**
 * Broadcast driver location update
 * @param {string} driverId - Driver ID
 * @param {object} location - Location object with lat, lng
 * @param {array} orderIds - Array of order IDs to notify
 */
const broadcastDriverLocation = (driverId, location, orderIds) => {
  try {
    const { getIO } = require('../index');
    const io = getIO();
    
    orderIds.forEach(orderId => {
      // Emit to order room
      io.to(`order:${orderId}`).emit('driver:location:update', {
        orderId,
        driverId,
        location,
        timestamp: new Date()
      });
    });
    
    logger.info(`Driver location broadcast: ${driverId} to ${orderIds.length} orders`);
  } catch (error) {
    logger.error('Error broadcasting driver location:', error);
  }
};

module.exports = {
  broadcastOrderStatus,
  sendNotification,
  broadcastDriverLocation
};
