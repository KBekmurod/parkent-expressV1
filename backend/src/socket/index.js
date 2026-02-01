const socketIO = require('socket.io');
const logger = require('../utils/logger');
const { socketAuth } = require('./middleware/socketAuth');
const orderHandler = require('./handlers/order.handler');
const locationHandler = require('./handlers/location.handler');
const chatHandler = require('./handlers/chat.handler');
const notificationHandler = require('./handlers/notification.handler');

let io;

/**
 * Initialize Socket.io server
 */
const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Authentication middleware
  io.use(socketAuth);

  // Connection handler
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} - User: ${socket.user?.type} ${socket.user?.id}`);

    // Join user-specific room
    if (socket.user) {
      const userRoom = `${socket.user.type}:${socket.user.id}`;
      socket.join(userRoom);
      logger.info(`User joined room: ${userRoom}`);
    }

    // Register event handlers
    orderHandler(io, socket);
    locationHandler(io, socket);
    chatHandler(io, socket);
    notificationHandler(io, socket);

    // Disconnect handler
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
      
      // If driver, update online status
      if (socket.user?.type === 'driver') {
        const Driver = require('../models/Driver.model');
        Driver.findByIdAndUpdate(socket.user.id, { isOnline: false }).catch(err => {
          logger.error('Error updating driver status on disconnect:', err);
        });
      }
    });

    // Error handler
    socket.on('error', (error) => {
      logger.error(`Socket error: ${socket.id}`, error);
    });
  });

  logger.info('✅ Socket.io initialized');
  return io;
};

/**
 * Get Socket.io instance
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

/**
 * Emit event to specific room
 */
const emitToRoom = (room, event, data) => {
  if (io) {
    io.to(room).emit(event, data);
    logger.info(`Emitted ${event} to room ${room}`);
  }
};

/**
 * Emit event to specific user
 */
const emitToUser = (userType, userId, event, data) => {
  const room = `${userType}:${userId}`;
  emitToRoom(room, event, data);
};

module.exports = {
  initSocket,
  getIO,
  emitToRoom,
  emitToUser,
  // Export broadcast utilities for use in controllers
  ...require('./utils/broadcast')
};
