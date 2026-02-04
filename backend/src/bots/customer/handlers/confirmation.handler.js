const { handleCustomerResponse } = require('../../../services/paymentConfirmation.service');

const handleConfirmationCallback = async (bot, callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const [_, action, paymentId] = callbackQuery.data.split(':');
  
  await bot.answerCallbackQuery(callbackQuery.id);
  
  const result = await handleCustomerResponse(paymentId, action === 'yes');
  await bot.sendMessage(chatId, result.message);
  
  try {
    await bot.deleteMessage(chatId, callbackQuery.message.message_id);
  } catch (e) {}
};

module.exports = { handleConfirmationCallback };
