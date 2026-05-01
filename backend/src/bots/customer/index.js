const TelegramBot = require('node-telegram-bot-api');
const logger = require('../../utils/logger');
const store = require('../../utils/botStateStore');

const startHandler = require('./handlers/start.handler');
const menuHandler = require('./handlers/menu.handler');
const vendorHandler = require('./handlers/vendor.handler');
const cartHandler = require('./handlers/cart.handler');
const orderHandler = require('./handlers/order.handler');
const addressHandler = require('./handlers/address.handler');
const profileHandler = require('./handlers/profile.handler');
const paymentHandler = require('./handlers/payment.handler');
const confirmationHandler = require('./handlers/confirmation.handler');

let customerBot;

const initCustomerBot = () => {
  const token = process.env.CUSTOMER_BOT_TOKEN;
  if (!token) {
    logger.warn('⚠️ Customer Bot token topilmadi. Bot o\'chirildi.');
    return null;
  }

  try {
    customerBot = new TelegramBot(token, { polling: true });

    customerBot.onText(/\/start/, startHandler.handleStart(customerBot));

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
      } else if (data.startsWith('confirm:')) {
        confirmationHandler.handleConfirmationCallback(customerBot, callbackQuery);
      }
    });

    customerBot.on('message', async (msg) => {
      if (msg.contact) {
        startHandler.handleContact(customerBot)(msg);
        return;
      }

      if (msg.location) {
        addressHandler.handleLocationMessage(customerBot, msg);
        return;
      }

      if (msg.text && !msg.text.startsWith('/')) {
        const chatId = msg.chat.id;

        // 1. Manzil nomi kutilayotganmi?
        const pendingAddress = await store.getPendingAddress(chatId);
        if (pendingAddress) {
          const handled = await addressHandler.handleAddressTitle(customerBot, msg);
          if (handled) return;
        }

        // 2. Asosiy menyu komandalar
        menuHandler.handleTextMessage(customerBot, msg);
      }
    });

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

const getCustomerBot = () => customerBot || null;

module.exports = { initCustomerBot, getCustomerBot, customerBot };
