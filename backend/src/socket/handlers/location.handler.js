const Driver = require('../../models/Driver.model');
const Order = require('../../models/Order.model');
const logger = require('../../utils/logger');

module.exports = (io, socket) => {
  /**
   * Update driver location
   */
  socket.on('location:update', async (data) => {
    try {
      if (socket.user.type !== 'driver') {
        return socket.emit('error', { message: 'Only drivers can update location' });
      }

      const { lat, lng } = data;

      if (!lat || !lng) {
        return socket.emit('error', { message: 'Latitude and longitude required' });
      }

      // Update driver location in database
      const driver = await Driver.findByIdAndUpdate(
        socket.user.id,
        {
          currentLocation: { lat, lng },
          isOnline: true
        },
        { new: true }
      );

      if (!driver) {
        return socket.emit('error', { message: 'Driver not found' });
      }

      // Broadcast location to all active orders of this driver
      const activeOrders = await Order.find({
        driver: socket.user.id,
        status: { $in: ['assigned', 'picked_up', 'on_the_way'] }
      });

      activeOrders.forEach(order => {
        // Emit to order room
        io.to(`order:${order._id}`).emit('driver:location:update', {
          orderId: order._id,
          driverId: socket.user.id,
          location: { lat, lng },
          timestamp: new Date()
        });

        // Emit to customer room
        io.to(`customer:${order.customer}`).emit('driver:location:update', {
          orderId: order._id,
          location: { lat, lng }
        });
      });

      socket.emit('location:updated', { lat, lng });
    } catch (error) {
      logger.error('Error updating driver location:', error);
      socket.emit('error', { message: 'Failed to update location' });
    }
  });

  /**
   * Start tracking driver location
   */
  socket.on('location:start-tracking', async (orderId) => {
    try {
      const order = await Order.findById(orderId);

      if (!order) {
        return socket.emit('error', { message: 'Order not found' });
      }

      if (!order.driver) {
        return socket.emit('error', { message: 'No driver assigned' });
      }

      // Join driver location room
      const roomName = `driver-location:${order.driver}`;
      socket.join(roomName);

      // Get current driver location
      const driver = await Driver.findById(order.driver);

      if (driver && driver.currentLocation) {
        socket.emit('driver:location:update', {
          orderId,
          driverId: order.driver,
          location: driver.currentLocation,
          timestamp: new Date()
        });
      }

      socket.emit('location:tracking-started', { orderId, driverId: order.driver });
    } catch (error) {
      logger.error('Error starting location tracking:', error);
      socket.emit('error', { message: 'Failed to start tracking' });
    }
  });

  /**
   * Stop tracking driver location
   */
  socket.on('location:stop-tracking', async (orderId) => {
    try {
      const order = await Order.findById(orderId);
      if (order && order.driver) {
        const roomName = `driver-location:${order.driver}`;
        socket.leave(roomName);
        socket.emit('location:tracking-stopped', { orderId });
      } else {
        socket.emit('error', { message: 'Order not found or no driver assigned' });
      }
    } catch (error) {
      logger.error('Error stopping location tracking:', error);
      socket.emit('error', { message: 'Failed to stop tracking' });
    }
  });
};
