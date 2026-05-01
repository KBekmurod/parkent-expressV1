const { getPaymentMethodKeyboard } = require('../keyboards/payment.keyboard');
const { PAYMENT_MESSAGES } = require('../utils/paymentMessages');
const addressHandler = require('./address.handler');
const store = require('../../../utils/botStateStore');
const logger = require('../../../utils/logger');

const showPaymentMethods = async (bot, chatId) => {
  try {
    await bot.sendMessage(chatId, PAYMENT_MESSAGES.uz.selectMethod, {
      parse_mode: 'Markdown',
      reply_markup: getPaymentMethodKeyboard('uz')
    });
  } catch (error) {
    logger.error('Error showing payment methods:', error);
    await bot.sendMessage(chatId, 'Xatolik yuz berdi.');
  }
};

const handlePaymentMethodCallback = async (bot, callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const method = callbackQuery.data.split(':')[1];
  await bot.answerCallbackQuery(callbackQuery.id);

  try {
    const paymentMethod = method === 'card' ? 'card_to_driver' : 'cash';
    await store.setPaymentMethod(chatId, paymentMethod);

    if (method === 'card') {
      await bot.sendMessage(chatId, PAYMENT_MESSAGES.uz.cardSelected, { parse_mode: 'Markdown' });
    } else {
      await bot.sendMessage(chatId, PAYMENT_MESSAGES.uz.cashSelected, { parse_mode: 'Markdown' });
    }

    await addressHandler.requestAddress(bot, chatId);
  } catch (error) {
    logger.error('Error handling payment method:', error);
    await bot.sendMessage(chatId, 'Xatolik yuz berdi.');
  }
};

const getPaymentMethod = async (chatId) => {
  try {
    const method = await store.getPaymentMethod(chatId);
    return method || 'cash';
  } catch {
    return 'cash';
  }
};

const clearPaymentSelection = async (chatId) => {
  try {
    await store.delPaymentMethod(chatId);
  } catch { /* ignore */ }
};

module.exports = {
  showPaymentMethods,
  handlePaymentMethodCallback,
  getPaymentMethod,
  clearPaymentSelection
};
