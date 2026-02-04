const TelegramBot = require('node-telegram-bot-api');
const logger = require('../../utils/logger');

// Handlers
const startHandler = require('./handlers/start.handler');
const menuHandler = require('./handlers/menu.handler');
const vendorHandler = require('./handlers/vendor.handler');
const cartHandler = require('./handlers/cart.handler');
const orderHandler = require('./handlers/order.handler');
const addressHandler = require('./handlers/address.handler');
const profileHandler = require('./handlers/profile.handler');
const paymentHandler = require('./handlers/payment.handler');

let customerBot;

/**
 * Initialize Customer Bot
 */
const initCustomerBot = () => {
  const token = process.env.CUSTOMER_BOT_TOKEN;

  if (!token) {
    logger.warn('⚠️ Customer Bot token not provided. Bot disabled.');
    return null;
  }

  try {
    customerBot = new TelegramBot(token, { polling: true });

    // Command handlers
    customerBot.onText(/\/start/, startHandler.handleStart(customerBot));

    // Callback query handler
    customerBot.on('callback_query', (callbackQuery) => {
      const data = callbackQuery.data;

      if (data.startsWith('menu:')) {
        menuHandler.handleMenuCallback(customerBot, callbackQuery);
      } else if (data.startsWith('vendor:')) {
        vendorHandler.handleVendorCallback(customerBot, callbackQuery);
      } else if (data.startsWith('product:')) {
        vendorHandler.handleProductCallback(customerBot, callbackQuery);
      } else if (data.startsWith('cart:')) {
        cartHandler.handleCartCallback(customerBot, callbackQuery);
      } else if (data.startsWith('order:')) {
        orderHandler.handleOrderCallback(customerBot, callbackQuery);
      } else if (data.startsWith('address:')) {
        addressHandler.handleAddressCallback(customerBot, callbackQuery);
      } else if (data.startsWith('profile:')) {
        profileHandler.handleProfileCallback(customerBot, callbackQuery);
      } else if (data.startsWith('payment:')) {
        paymentHandler.handlePaymentMethodCallback(customerBot, callbackQuery);
      }
    });

    // Message handlers
    customerBot.on('message', (msg) => {
      // Handle contact (phone number)
      if (msg.contact) {
        startHandler.handleContact(customerBot)(msg);
        return;
      }
      
      // Handle location
      if (msg.location) {
        addressHandler.handleLocationMessage(customerBot, msg);
        return;
      }
      
      // Handle text messages (menu navigation)
      if (msg.text && !msg.text.startsWith('/')) {
        menuHandler.handleTextMessage(customerBot, msg);
      }
    });

    // Error handler
    customerBot.on('polling_error', (error) => {
      logger.error('Customer Bot polling error:', error);
    });

    logger.info('✅ Customer Bot initialized');
    return customerBot;
  } catch (error) {
    logger.error('❌ Customer Bot initialization failed:', error);
    return null;
  }
};

/**
 * Get Customer Bot instance
 */
const getCustomerBot = () => {
  if (!customerBot) {
    throw new Error('Customer Bot not initialized');
  }
  return customerBot;
};

module.exports = {
  initCustomerBot,
  getCustomerBot
};
