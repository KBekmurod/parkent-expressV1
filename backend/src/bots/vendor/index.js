const TelegramBot = require('node-telegram-bot-api');
const logger = require('../../utils/logger');
const store = require('../../utils/botStateStore');

// Handlers
const startHandler = require('./handlers/start.handler');
const ordersHandler = require('./handlers/orders.handler');
const menuHandler = require('./handlers/menu.handler');
const profileHandler = require('./handlers/profile.handler');
const statsHandler = require('./handlers/stats.handler');

let vendorBot;

/**
 * Initialize Vendor Bot
 */
const initVendorBot = () => {
  const token = process.env.VENDOR_BOT_TOKEN;

  if (!token) {
    logger.warn('⚠️ Vendor Bot token not provided. Bot disabled.');
    return null;
  }

  try {
    vendorBot = new TelegramBot(token, { polling: true });

    // Command handlers
    vendorBot.onText(/\/start/, startHandler.handleStart(vendorBot));

    // Callback query handler
    vendorBot.on('callback_query', (callbackQuery) => {
      const data = callbackQuery.data;

      if (data.startsWith('order:')) {
        ordersHandler.handleOrderCallback(vendorBot, callbackQuery);
      } else if (data.startsWith('menu:')) {
        menuHandler.handleMenuCallback(vendorBot, callbackQuery);
      } else if (data.startsWith('product:')) {
        menuHandler.handleProductCallback(vendorBot, callbackQuery);
      } else if (data.startsWith('profile:')) {
        profileHandler.handleProfileCallback(vendorBot, callbackQuery);
      } else if (data.startsWith('stats:')) {
        statsHandler.handleStatsCallback(vendorBot, callbackQuery);
      }
    });

    // Message handlers
    vendorBot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      
      if (msg.contact) {
        startHandler.handleContact(vendorBot)(msg);
      } else if (msg.location) {
        startHandler.handleLocationMessage(vendorBot, msg);
      } else if (msg.photo) {
        menuHandler.handlePhotoMessage(vendorBot, msg);
      } else if (msg.document) {
        menuHandler.handleDocumentMessage(vendorBot, msg);
      } else if (msg.text && !msg.text.startsWith('/')) {
        // Ro'yxatdan o'tish jarayonida ekanligini tekshirish
        if (await store.getVendorReg(chatId)) {
          startHandler.handleTextMessage(vendorBot)(msg);
        } else if ((await store.getProductCreate(chatId)) || (await store.getProductEdit(chatId))) {
          menuHandler.handleTextMessage(vendorBot, msg);
        } else if (await store.getVendorReject(chatId)) {
          ordersHandler.handleRejectionReasonInput(vendorBot, msg);
        } else {
          // Asosiy menyu komandalari
          handleTextCommand(vendorBot, msg);
        }
      }
    });

    // Error handler
    vendorBot.on('polling_error', (error) => {
      logger.error('Vendor Bot polling error:', error);
    });

    logger.info('✅ Vendor Bot initialized');
    return vendorBot;
  } catch (error) {
    logger.error('❌ Vendor Bot initialization failed:', error);
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
    // Get vendor
    const axios = require('axios');
    const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';
    const response = await axios.get(`${API_URL}/vendors/telegram/${telegramId}`);
    const vendor = response.data.data.vendor;

    if (text === '📦 Faol buyurtmalar' || text === '📦 Активные заказы') {
      await ordersHandler.showActiveOrders(bot, chatId, vendor._id);
    } else if (text === '📋 Tarix' || text === '📋 История') {
      await ordersHandler.showOrderHistory(bot, chatId, vendor._id);
    } else if (text === '🍽️ Menyu' || text === '🍽️ Меню') {
      await menuHandler.showMenu(bot, chatId, vendor._id);
    } else if (text === '📊 Statistika' || text === '📊 Статистика') {
      await statsHandler.showStats(bot, chatId, vendor._id);
    } else if (text === '👤 Profil' || text === '👤 Профиль') {
      await profileHandler.showProfile(bot, chatId, vendor._id);
    }
  } catch (error) {
    logger.error('Error handling text command:', error);
  }
};

/**
 * Get Vendor Bot instance
 */
const getVendorBot = () => {
  return vendorBot || null;
};

module.exports = {
  initVendorBot,
  getVendorBot
};
