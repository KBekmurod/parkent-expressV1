const axios = require('axios');
const { MESSAGES } = require('../utils/messages');
const logger = require('../../../utils/logger');
const paymentHandler = require('./payment.handler');
const store = require('../../../utils/botStateStore');

const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

const showCart = async (bot, chatId) => {
  try {
    const cart = (await store.getBotCart(chatId)) || [];

    if (cart.length === 0) {
      return await bot.sendMessage(chatId, MESSAGES.uz.emptyCart);
    }

    let total = 0;
    let message = '🛒 *Savat:*\n\n';

    for (const item of cart) {
      const response = await axios.get(`${API_URL}/products/${item.productId}`);
      const product = response.data.data.product;
      const itemTotal = (product.finalPrice || product.price) * item.quantity;
      total += itemTotal;

      message += `${product.name?.uz || product.name}\n`;
      message += `${item.quantity} x ${product.finalPrice || product.price} so'm = ${itemTotal} so'm\n\n`;
    }

    message += `💰 *Jami: ${total} so'm*`;

    const keyboard = {
      inline_keyboard: [
        [{ text: '✅ Buyurtma berish', callback_data: 'cart:checkout' }],
        [
          { text: '🗑️ Savatni tozalash', callback_data: 'cart:clear' },
          { text: '🔙 Orqaga', callback_data: 'menu:restaurants' }
        ]
      ]
    };

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown', reply_markup: keyboard });
  } catch (error) {
    logger.error('Error showing cart:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

const clearCart = async (chatId) => {
  await store.delBotCart(chatId);
};

const handleCartCallback = async (bot, callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const action = callbackQuery.data.split(':')[1];

  if (action === 'view') {
    await bot.answerCallbackQuery(callbackQuery.id);
    await showCart(bot, chatId);
  } else if (action === 'clear') {
    await clearCart(chatId);
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: '🗑️ Savat tozalandi',
      show_alert: true
    });
  } else if (action === 'checkout') {
    await bot.answerCallbackQuery(callbackQuery.id);
    await paymentHandler.showPaymentMethods(bot, chatId);
  }
};

module.exports = {
  showCart,
  clearCart,
  handleCartCallback
};
