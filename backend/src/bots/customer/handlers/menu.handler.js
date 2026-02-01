const { getMainMenuKeyboard } = require('../keyboards/mainMenu');
const vendorHandler = require('./vendor.handler');
const cartHandler = require('./cart.handler');
const profileHandler = require('./profile.handler');
const orderHandler = require('./order.handler');
const logger = require('../../../utils/logger');

/**
 * Handle menu callback
 */
const handleMenuCallback = async (bot, callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data.split(':');
  const action = data[1];

  await bot.answerCallbackQuery(callbackQuery.id);

  try {
    switch (action) {
      case 'main':
        await bot.sendMessage(
          chatId,
          '🏠 Bosh menyu',
          { reply_markup: getMainMenuKeyboard('uz') }
        );
        break;

      case 'restaurants':
        await vendorHandler.showVendorList(bot, chatId);
        break;

      case 'cart':
        await cartHandler.showCart(bot, chatId);
        break;

      case 'orders':
        await orderHandler.showOrderHistory(bot, chatId);
        break;

      case 'profile':
        await profileHandler.showProfile(bot, chatId);
        break;

      default:
        await bot.sendMessage(chatId, '❓ Noma\'lum buyruq');
    }
  } catch (error) {
    logger.error('Error in menu callback:', error);
    await bot.sendMessage(chatId, '❌ Xatolik yuz berdi');
  }
};

/**
 * Handle text message
 */
const handleTextMessage = async (bot, msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  try {
    // Main menu buttons
    if (text === '🍽️ Restoran tanlash' || text === '🍽️ Выбрать ресторан') {
      await vendorHandler.showVendorList(bot, chatId);
    } else if (text === '📦 Mening buyurtmalarim' || text === '📦 Мои заказы') {
      await orderHandler.showOrderHistory(bot, chatId);
    } else if (text === '👤 Profil' || text === '👤 Профиль') {
      await profileHandler.showProfile(bot, chatId);
    } else if (text === '⚙️ Sozlamalar' || text === '⚙️ Настройки') {
      await bot.sendMessage(chatId, 'Sozlamalar tez orada...');
    }
  } catch (error) {
    logger.error('Error in text message handler:', error);
    await bot.sendMessage(chatId, '❌ Xatolik yuz berdi');
  }
};

module.exports = {
  handleMenuCallback,
  handleTextMessage
};
