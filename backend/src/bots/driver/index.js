const TelegramBot = require('node-telegram-bot-api');
const logger = require('../../utils/logger');

// Handlers
const startHandler = require('./handlers/start.handler');
const ordersHandler = require('./handlers/orders.handler');
const locationHandler = require('./handlers/location.handler');
const earningsHandler = require('./handlers/earnings.handler');
const profileHandler = require('./handlers/profile.handler');

let driverBot;

/**
 * Initialize Driver Bot
 */
const initDriverBot = () => {
  const token = process.env.DRIVER_BOT_TOKEN;

  if (!token) {
    logger.warn('⚠️ Driver Bot token not provided. Bot disabled.');
    return null;
  }

  try {
    driverBot = new TelegramBot(token, { polling: true });

    // Command handlers
    driverBot.onText(/\/start/, startHandler.handleStart(driverBot));

    // Callback query handler
    driverBot.on('callback_query', (callbackQuery) => {
      const data = callbackQuery.data;

      if (data.startsWith('order:')) {
        ordersHandler.handleOrderCallback(driverBot, callbackQuery);
      } else if (data.startsWith('status:')) {
        profileHandler.handleStatusCallback(driverBot, callbackQuery);
      } else if (data.startsWith('earnings:')) {
        earningsHandler.handleEarningsCallback(driverBot, callbackQuery);
      } else if (data.startsWith('profile:')) {
        profileHandler.handleProfileCallback(driverBot, callbackQuery);
      } else if (data.startsWith('vehicle:')) {
        startHandler.handleVehicleTypeCallback(driverBot, callbackQuery);
      }
    });

    // Message handlers
    driverBot.on('message', (msg) => {
      const chatId = msg.chat.id;
      
      if (msg.contact) {
        startHandler.handleContact(driverBot)(msg);
      } else if (msg.location) {
        locationHandler.handleLocationMessage(driverBot, msg);
      } else if (msg.photo) {
        startHandler.handlePhotoMessage(driverBot, msg);
      } else if (msg.text && !msg.text.startsWith('/')) {
        handleTextCommand(driverBot, msg);
      }
    });

    // Error handler
    driverBot.on('polling_error', (error) => {
      logger.error('Driver Bot polling error:', error);
    });

    logger.info('✅ Driver Bot initialized');
    return driverBot;
  } catch (error) {
    logger.error('❌ Driver Bot initialization failed:', error);
    return null;
  }
};

/**
 * Handle text commands from main menu
 */
const handleTextCommand = async (bot, msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const telegramId = chatId.toString();

  try {
    // Check if in registration flow
    if (global.driverRegistrations?.has(chatId)) {
      await startHandler.handleTextMessage(bot)(msg);
      return;
    }

    // Check if waiting for rejection reason
    if (global.driverOrderRejectionInputs?.has(chatId)) {
      await ordersHandler.handleRejectionReasonInput(bot, msg);
      return;
    }

    // Get driver
    const axios = require('axios');
    const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';
    const response = await axios.get(`${API_URL}/drivers/telegram/${telegramId}`);
    const driver = response.data.data.driver;

    // Handle main menu commands
    if (text === '📦 Faol buyurtmalar' || text === '📦 Активные заказы') {
      await ordersHandler.showActiveOrders(bot, chatId, driver._id);
    } else if (text === '📋 Tarix' || text === '📋 История') {
      await ordersHandler.showOrderHistory(bot, chatId, driver._id);
    } else if (text === '💰 Daromad' || text === '💰 Доход') {
      await earningsHandler.showEarnings(bot, chatId, driver._id);
    } else if (text === '🔄 Online' || text === '🔄 Онлайн') {
      await profileHandler.toggleOnlineStatus(bot, chatId, driver._id, true);
    } else if (text === '⏸️ Offline' || text === '⏸️ Оффлайн') {
      await profileHandler.toggleOnlineStatus(bot, chatId, driver._id, false);
    } else if (text === '👤 Profil' || text === '👤 Профиль') {
      await profileHandler.showProfile(bot, chatId, driver._id);
    } else if (text === '⚙️ Sozlamalar' || text === '⚙️ Настройки') {
      await profileHandler.showSettings(bot, chatId);
    }
  } catch (error) {
    logger.error('Error handling text command:', error);
  }
};

/**
 * Get Driver Bot instance
 */
const getDriverBot = () => {
  if (!driverBot) {
    throw new Error('Driver Bot not initialized');
  }
  return driverBot;
};

module.exports = {
  initDriverBot,
  getDriverBot
};
