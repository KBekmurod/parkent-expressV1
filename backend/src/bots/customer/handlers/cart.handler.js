const axios = require('axios');
const { MESSAGES } = require('../utils/messages');
const logger = require('../../../utils/logger');

const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

// Import cart storage from vendor handler
const { userCarts } = require('./vendor.handler');

/**
 * Show cart
 */
const showCart = async (bot, chatId) => {
  try {
    const cart = userCarts.get(chatId) || [];

    if (cart.length === 0) {
      return await bot.sendMessage(chatId, MESSAGES.uz.emptyCart);
    }

    // Fetch product details
    let total = 0;
    let message = '🛒 *Savat:*\n\n';

    for (const item of cart) {
      const response = await axios.get(`${API_URL}/products/${item.productId}`);
      const product = response.data.data.product;
      const itemTotal = product.finalPrice * item.quantity;
      total += itemTotal;

      message += `${product.name.uz}\n`;
      message += `${item.quantity} x ${product.finalPrice} so'm = ${itemTotal} so'm\n\n`;
    }

    message += `💰 *Jami: ${total} so'm*`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '✅ Buyurtma berish', callback_data: 'cart:checkout' }
        ],
        [
          { text: '🗑️ Savatni tozalash', callback_data: 'cart:clear' },
          { text: '🔙 Orqaga', callback_data: 'menu:restaurants' }
        ]
      ]
    };

    await bot.sendMessage(
      chatId,
      message,
      { 
        parse_mode: 'Markdown',
        reply_markup: keyboard
      }
    );

  } catch (error) {
    logger.error('Error showing cart:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Clear cart
 */
const clearCart = (chatId) => {
  userCarts.delete(chatId);
};

/**
 * Handle cart callback
 */
const handleCartCallback = async (bot, callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const action = callbackQuery.data.split(':')[1];

  await bot.answerCallbackQuery(callbackQuery.id);

  if (action === 'view') {
    await showCart(bot, chatId);
  } else if (action === 'clear') {
    clearCart(chatId);
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: '🗑️ Savat tozalandi',
      show_alert: true
    });
    await bot.sendMessage(chatId, MESSAGES.uz.cartCleared);
  } else if (action === 'checkout') {
    // Proceed to address selection
    const addressHandler = require('./address.handler');
    await addressHandler.requestAddress(bot, chatId);
  }
};

module.exports = {
  showCart,
  clearCart,
  handleCartCallback
};
