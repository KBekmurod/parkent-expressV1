const { getPaymentMethodKeyboard } = require('../keyboards/payment.keyboard');
const { PAYMENT_MESSAGES } = require('../utils/paymentMessages');
const addressHandler = require('./address.handler');
const logger = require('../../../utils/logger');

// Temporary storage for payment method selection (per chat)
// NOTE: This is an in-memory Map and will lose data on bot restart.
// For production with multiple bot instances or high reliability needs,
// consider using Redis or passing payment method via callback_data instead.
// Current approach is acceptable for single-instance bots with low restart frequency.
const paymentSelections = new Map();

/**
 * Show payment method selection
 */
const showPaymentMethods = async (bot, chatId) => {
  try {
    const keyboard = getPaymentMethodKeyboard('uz');
    
    await bot.sendMessage(
      chatId,
      PAYMENT_MESSAGES.uz.selectMethod,
      { 
        parse_mode: 'Markdown',
        reply_markup: keyboard 
      }
    );
  } catch (error) {
    logger.error('Error showing payment methods:', error);
    await bot.sendMessage(chatId, 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
  }
};

/**
 * Handle payment method selection
 */
const handlePaymentMethodCallback = async (bot, callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data; // payment:cash or payment:card
  const method = data.split(':')[1]; // 'cash' or 'card'

  await bot.answerCallbackQuery(callbackQuery.id);

  try {
    // Store selection temporarily
    paymentSelections.set(chatId, method === 'card' ? 'card_to_driver' : 'cash');

    if (method === 'card') {
      // Show card payment instructions
      await bot.sendMessage(
        chatId,
        PAYMENT_MESSAGES.uz.cardSelected,
        { parse_mode: 'Markdown' }
      );
    } else {
      // Show cash confirmation
      await bot.sendMessage(
        chatId,
        PAYMENT_MESSAGES.uz.cashSelected,
        { parse_mode: 'Markdown' }
      );
    }

    // Proceed to address selection
    await addressHandler.requestAddress(bot, chatId);

  } catch (error) {
    logger.error('Error handling payment method:', error);
    await bot.sendMessage(chatId, 'Xatolik yuz berdi.');
  }
};

/**
 * Get selected payment method for chat
 */
const getPaymentMethod = (chatId) => {
  return paymentSelections.get(chatId) || 'cash';
};

/**
 * Clear payment selection after order created
 */
const clearPaymentSelection = (chatId) => {
  paymentSelections.delete(chatId);
};

module.exports = {
  showPaymentMethods,
  handlePaymentMethodCallback,
  getPaymentMethod,
  clearPaymentSelection
};
