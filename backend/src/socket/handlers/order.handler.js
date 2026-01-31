const Order = require('../../models/Order.model');
const logger = require('../../utils/logger');

module.exports = (io, socket) => {
  /**
   * Join order room
   */
  socket.on('order:join', async (orderId) => {
    try {
      const order = await Order.findById(orderId);

      if (!order) {
        return socket.emit('error', { message: 'Order not found' });
      }

      // Verify user has access to this order
      const userId = socket.user.id;
      const userType = socket.user.type;

      const hasAccess = 
        (userType === 'customer' && order.customer.toString() === userId) ||
        (userType === 'vendor' && order.vendor.toString() === userId) ||
        (userType === 'driver' && order.driver?.toString() === userId) ||
        userType === 'admin';

      if (!hasAccess) {
        return socket.emit('error', { message: 'Access denied' });
      }

      // Join order room
      const roomName = `order:${orderId}`;
      socket.join(roomName);

      socket.emit('order:joined', { orderId, room: roomName });
      logger.info(`Socket ${socket.id} joined order room: ${roomName}`);
    } catch (error) {
      logger.error('Error joining order room:', error);
      socket.emit('error', { message: 'Failed to join order room' });
    }
  });

  /**
   * Leave order room
   */
  socket.on('order:leave', (orderId) => {
    const roomName = `order:${orderId}`;
    socket.leave(roomName);
    socket.emit('order:left', { orderId });
    logger.info(`Socket ${socket.id} left order room: ${roomName}`);
  });

  /**
   * Request order status
   */
  socket.on('order:status', async (orderId) => {
    try {
      const order = await Order.findById(orderId)
        .populate('customer', 'firstName lastName phone')
        .populate('vendor', 'name phone location')
        .populate('driver', 'firstName lastName phone vehicle currentLocation')
        .populate('items.product', 'name photo');

      if (!order) {
        return socket.emit('error', { message: 'Order not found' });
      }

      socket.emit('order:status:update', {
        orderId: order._id,
        status: order.status,
        timeline: order.timeline,
        order: order
      });
    } catch (error) {
      logger.error('Error getting order status:', error);
      socket.emit('error', { message: 'Failed to get order status' });
    }
  });

  /**
   * Broadcast order status change (called from controller)
   * This is a server-side function, not a socket event
   */
  socket.broadcastOrderStatus = (orderId, status, order) => {
    const roomName = `order:${orderId}`;
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
  };
};
