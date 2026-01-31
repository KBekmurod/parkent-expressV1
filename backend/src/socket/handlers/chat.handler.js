const Order = require('../../models/Order.model');
const logger = require('../../utils/logger');

// Note: Message model not yet implemented - messages are handled in memory for now

module.exports = (io, socket) => {
  /**
   * Send message
   */
  socket.on('chat:send', async (data) => {
    try {
      const { orderId, message, recipientType } = data;

      const order = await Order.findById(orderId);

      if (!order) {
        return socket.emit('error', { message: 'Order not found' });
      }

      // Verify user has access
      const userId = socket.user.id;
      const userType = socket.user.type;

      const hasAccess = 
        (userType === 'customer' && order.customer.toString() === userId) ||
        (userType === 'vendor' && order.vendor.toString() === userId) ||
        (userType === 'driver' && order.driver?.toString() === userId);

      if (!hasAccess) {
        return socket.emit('error', { message: 'Access denied' });
      }

      // Create message object (or save to DB if you have Message model)
      const chatMessage = {
        orderId,
        senderId: userId,
        senderType: userType,
        message,
        timestamp: new Date()
      };

      // Broadcast to order room
      io.to(`order:${orderId}`).emit('chat:message', chatMessage);

      // Emit to recipient's room
      if (recipientType === 'customer' && order.customer) {
        io.to(`customer:${order.customer}`).emit('chat:message', chatMessage);
      } else if (recipientType === 'vendor' && order.vendor) {
        io.to(`vendor:${order.vendor}`).emit('chat:message', chatMessage);
      } else if (recipientType === 'driver' && order.driver) {
        io.to(`driver:${order.driver}`).emit('chat:message', chatMessage);
      }

      socket.emit('chat:sent', { messageId: chatMessage.timestamp });
    } catch (error) {
      logger.error('Error sending chat message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  /**
   * Typing indicator
   */
  socket.on('chat:typing', (data) => {
    const { orderId, isTyping } = data;
    const roomName = `order:${orderId}`;
    
    socket.to(roomName).emit('chat:typing', {
      orderId,
      userId: socket.user.id,
      userType: socket.user.type,
      isTyping
    });
  });

  /**
   * Mark message as read
   */
  socket.on('chat:read', (data) => {
    const { orderId, messageId } = data;
    const roomName = `order:${orderId}`;
    
    socket.to(roomName).emit('chat:read', {
      orderId,
      messageId,
      readBy: socket.user.id,
      timestamp: new Date()
    });
  });
};
