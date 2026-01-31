const logger = require('../../utils/logger');

module.exports = (io, socket) => {
  /**
   * Send notification to user
   */
  socket.sendNotification = (userType, userId, notification) => {
    const room = `${userType}:${userId}`;
    io.to(room).emit('notification', {
      ...notification,
      timestamp: new Date()
    });
    logger.info(`Notification sent to ${room}: ${notification.title}`);
  };

  /**
   * Mark notification as read
   */
  socket.on('notification:read', (notificationId) => {
    logger.info(`Notification ${notificationId} marked as read by ${socket.user.id}`);
    socket.emit('notification:read:success', { notificationId });
  });

  /**
   * Get unread notification count
   */
  socket.on('notification:count', () => {
    // In real app, fetch from database
    socket.emit('notification:count', { count: 0 });
  });

  /**
   * Subscribe to notifications
   */
  socket.on('notification:subscribe', () => {
    socket.emit('notification:subscribed', {
      message: 'Subscribed to notifications'
    });
  });
};
