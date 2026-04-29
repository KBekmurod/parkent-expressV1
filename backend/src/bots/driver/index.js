const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const logger = require('../../utils/logger');
const store = require('../../utils/botStateStore');

// Handlers
const startHandler = require('./handlers/start.handler');
const ordersHandler = require('./handlers/orders.handler');
const locationHandler = require('./handlers/location.handler');
const earningsHandler = require('./handlers/earnings.handler');
const profileHandler = require('./handlers/profile.handler');
const cardPaymentHandler = require('./handlers/cardPayment.handler');
const settlementHandler = require('./handlers/settlement.handler');

let driverBot;

const initDriverBot = () => {
  const token = process.env.DRIVER_BOT_TOKEN;

  if (!token) {
    logger.warn('⚠️ Driver Bot token topilmadi. Bot o\'chirildi.');
    return null;
  }

  try {
    driverBot = new TelegramBot(token, { polling: true });

    driverBot.onText(/\/start/, startHandler.handleStart(driverBot));

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
      } else if (data.startsWith('settlement:')) {
        settlementHandler.handleSettlementCallback(driverBot, callbackQuery);
      }
    });

    driverBot.on('message', async (msg) => {
      const chatId = msg.chat.id;

      if (msg.contact) {
        startHandler.handleContact(driverBot)(msg);
      } else if (msg.location) {
        locationHandler.handleLocationMessage(driverBot, msg);
      } else if (msg.photo) {
        // Ro'yxatdan o'tish jarayonida ekanligini Redis orqali tekshirish
        const regState = await store.getDriverReg(chatId);
        if (regState) {
          startHandler.handlePhotoMessage(driverBot, msg);
        } else {
          cardPaymentHandler.handleReceiptUpload(driverBot, msg);
        }
      } else if (msg.text && !msg.text.startsWith('/')) {
        handleTextCommand(driverBot, msg);
      }
    });

    driverBot.on('polling_error', (error) => {
      logger.error('Driver Bot polling error:', error);
    });

    logger.info('✅ Driver Bot ishga tushdi');
    return driverBot;
  } catch (error) {
    logger.error('❌ Driver Bot ishga tushmadi:', error);
    return null;
  }
};

const handleTextCommand = async (bot, msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const telegramId = chatId.toString();

  try {
    // Ro'yxatdan o'tish jarayonida ekanligini tekshirish
    const regState = await store.getDriverReg(chatId);
    if (regState) {
      await startHandler.handleTextMessage(bot)(msg);
      return;
    }

    // Rad etish sababi kutilayotganini tekshirish
    const rejectOrderId = await store.getDriverReject(chatId);
    if (rejectOrderId) {
      await ordersHandler.handleRejectionReasonInput(bot, msg);
      return;
    }

    const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';
    const response = await axios.get(`${API_URL}/drivers/telegram/${telegramId}`);
    const driver = response.data.data.driver;

    if (text === '📦 Faol buyurtmalar') {
      await ordersHandler.showActiveOrders(bot, chatId, driver._id);
    } else if (text === '📋 Tarix') {
      await ordersHandler.showOrderHistory(bot, chatId, driver._id);
    } else if (text === '💰 Daromad') {
      await earningsHandler.showEarnings(bot, chatId, driver._id);
    } else if (text === '💰 Mening hisobim') {
      await settlementHandler.showDailyCollections(bot, chatId, driver._id);
    } else if (text === '🔄 Online') {
      await profileHandler.toggleOnlineStatus(bot, chatId, driver._id, true);
    } else if (text === '⏸️ Offline') {
      await profileHandler.toggleOnlineStatus(bot, chatId, driver._id, false);
    } else if (text === '👤 Profil') {
      await profileHandler.showProfile(bot, chatId, driver._id);
    } else if (text === '⚙️ Sozlamalar') {
      await profileHandler.showSettings(bot, chatId);
    }
  } catch (error) {
    logger.error('Matn komandasi xatosi:', error);
  }
};

const getDriverBot = () => {
  return driverBot || null;
};

module.exports = {
  initDriverBot,
  getDriverBot,
  driverBot
};
