const axios = require('axios');
const { MESSAGES } = require('../utils/messages');
const logger = require('../../../utils/logger');

const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

// Store location tracking states
if (!global.driverLocationTracking) {
  global.driverLocationTracking = new Map();
}

/**
 * Handle location message
 */
const handleLocationMessage = async (bot, msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id.toString();
  const location = msg.location;

  try {
    // Get driver
    const response = await axios.get(`${API_URL}/drivers/telegram/${telegramId}`);
    const driver = response.data.data.driver;

    if (!driver) {
      await bot.sendMessage(chatId, MESSAGES.uz.error);
      return;
    }

    // Update driver location
    await updateDriverLocation(driver._id, location.latitude, location.longitude);

    // If driver has active orders, update those as well
    await updateActiveOrdersLocation(driver._id, location.latitude, location.longitude);

    logger.info(`Driver ${driver._id} location updated: ${location.latitude}, ${location.longitude}`);
  } catch (error) {
    logger.error('Error handling location message:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Start location tracking
 */
const startLocationTracking = async (bot, chatId, driverId) => {
  try {
    // Check if already tracking
    if (global.driverLocationTracking.has(driverId)) {
      return;
    }

    // Request initial location
    await bot.sendMessage(
      chatId,
      MESSAGES.uz.shareLocation,
      {
        reply_markup: {
          keyboard: [
            [{ text: '📍 Joylashuvni yuborish', request_location: true }]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      }
    );

    // Start tracking interval (every 30 seconds)
    const trackingInterval = setInterval(async () => {
      try {
        // Request live location
        await bot.sendMessage(
          chatId,
          MESSAGES.uz.shareLocation,
          {
            reply_markup: {
              keyboard: [
                [{ text: '📍 Joylashuvni yuborish', request_location: true }]
              ],
              resize_keyboard: true,
              one_time_keyboard: true
            }
          }
        );
      } catch (error) {
        logger.error('Error requesting location update:', error);
      }
    }, 30000); // 30 seconds

    // Store tracking state
    global.driverLocationTracking.set(driverId, {
      chatId,
      interval: trackingInterval,
      startTime: Date.now()
    });

    await bot.sendMessage(chatId, MESSAGES.uz.locationTrackingStarted);
    logger.info(`Location tracking started for driver ${driverId}`);
  } catch (error) {
    logger.error('Error starting location tracking:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Stop location tracking
 */
const stopLocationTracking = async (bot, chatId, driverId) => {
  try {
    const tracking = global.driverLocationTracking.get(driverId);
    
    if (!tracking) {
      return;
    }

    // Clear interval
    clearInterval(tracking.interval);
    
    // Remove tracking state
    global.driverLocationTracking.delete(driverId);

    await bot.sendMessage(chatId, MESSAGES.uz.locationTrackingStopped);
    logger.info(`Location tracking stopped for driver ${driverId}`);
  } catch (error) {
    logger.error('Error stopping location tracking:', error);
  }
};

/**
 * Update driver location in database
 */
const updateDriverLocation = async (driverId, latitude, longitude) => {
  try {
    await axios.put(`${API_URL}/drivers/${driverId}/location`, {
      latitude,
      longitude,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Error updating driver location in DB:', error);
    throw error;
  }
};

/**
 * Update active orders with driver location
 */
const updateActiveOrdersLocation = async (driverId, latitude, longitude) => {
  try {
    // Get driver's active orders
    const response = await axios.get(`${API_URL}/orders/driver/${driverId}`, {
      params: { status: 'picked_up,on_the_way' }
    });
    
    const orders = response.data.data.orders;

    // Update each order with driver location
    for (const order of orders) {
      await axios.put(`${API_URL}/orders/${order._id}/driver-location`, {
        latitude,
        longitude,
        timestamp: new Date()
      });

      // Emit socket event for real-time tracking
      try {
        const socketData = {
          orderId: order._id,
          driverLocation: {
            latitude,
            longitude,
            timestamp: new Date()
          }
        };
        
        // Note: Socket.io emit would be done via backend API
        await axios.post(`${API_URL}/orders/${order._id}/emit-location`, socketData);
      } catch (socketError) {
        logger.error('Error emitting socket event:', socketError);
      }
    }
  } catch (error) {
    logger.error('Error updating active orders location:', error);
  }
};

/**
 * Toggle live location sharing
 */
const toggleLiveLocation = async (bot, chatId, driverId, enable) => {
  try {
    if (enable) {
      await startLocationTracking(bot, chatId, driverId);
    } else {
      await stopLocationTracking(bot, chatId, driverId);
    }
  } catch (error) {
    logger.error('Error toggling live location:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Get driver's current location
 */
const getDriverLocation = async (driverId) => {
  try {
    const response = await axios.get(`${API_URL}/drivers/${driverId}`);
    const driver = response.data.data.driver;
    return driver.location;
  } catch (error) {
    logger.error('Error getting driver location:', error);
    return null;
  }
};

module.exports = {
  handleLocationMessage,
  startLocationTracking,
  stopLocationTracking,
  updateDriverLocation,
  updateActiveOrdersLocation,
  toggleLiveLocation,
  getDriverLocation
};
