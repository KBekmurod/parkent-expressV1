const axios = require('axios');
const { MESSAGES } = require('../utils/messages');
const logger = require('../../../utils/logger');

const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

/**
 * Request delivery address
 */
const requestAddress = async (bot, chatId) => {
  try {
    const telegramId = chatId.toString();
    
    // Get user addresses
    const response = await axios.get(`${API_URL}/users/telegram/${telegramId}`);
    const user = response.data.data.user;

    if (user.addresses && user.addresses.length > 0) {
      // Show saved addresses
      const keyboard = {
        inline_keyboard: [
          ...user.addresses.map((addr, index) => [{
            text: `📍 ${addr.title}`,
            callback_data: `address:select:${index}`
          }]),
          [
            { text: '➕ Yangi manzil qo\'shish', callback_data: 'address:new' }
          ]
        ]
      };

      await bot.sendMessage(
        chatId,
        MESSAGES.uz.selectAddress,
        { reply_markup: keyboard }
      );
    } else {
      // Request new address
      await bot.sendMessage(
        chatId,
        MESSAGES.uz.requestLocation,
        {
          reply_markup: {
            keyboard: [
              [{ text: '📍 Manzilni yuborish', request_location: true }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
          }
        }
      );
    }

  } catch (error) {
    logger.error('Error requesting address:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Handle location message
 */
const handleLocationMessage = async (bot, msg) => {
  const chatId = msg.chat.id;
  const { latitude, longitude } = msg.location;

  // Request address title
  await bot.sendMessage(chatId, MESSAGES.uz.requestAddressTitle);

  // Store location temporarily (in production, use session storage)
  global.pendingAddresses = global.pendingAddresses || new Map();
  global.pendingAddresses.set(chatId, { lat: latitude, lng: longitude });
};

/**
 * Handle address callback
 */
const handleAddressCallback = async (bot, callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data.split(':');
  const action = data[1];

  await bot.answerCallbackQuery(callbackQuery.id);

  if (action === 'select') {
    const addressIndex = parseInt(data[2]);
    
    // Get user
    const telegramId = chatId.toString();
    const response = await axios.get(`${API_URL}/users/telegram/${telegramId}`);
    const user = response.data.data.user;
    const address = user.addresses[addressIndex];

    // Proceed to order creation
    const orderHandler = require('./order.handler');
    await orderHandler.createOrder(bot, chatId, user._id, address);
    
  } else if (action === 'new') {
    await bot.sendMessage(
      chatId,
      MESSAGES.uz.requestLocation,
      {
        reply_markup: {
          keyboard: [
            [{ text: '📍 Manzilni yuborish', request_location: true }]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      }
    );
  }
};

module.exports = {
  requestAddress,
  handleLocationMessage,
  handleAddressCallback
};
