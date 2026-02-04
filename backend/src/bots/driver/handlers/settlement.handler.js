const { calculateDailyCollection, getDriverPendingSettlement, driverConfirmSettlement } = require('../../../services/settlement.service');

const showDailyCollections = async (bot, chatId, driverId) => {
  const today = await calculateDailyCollection(driverId);

  let message = `💰 *BUGUNGI KARTA TO'LOVLAR*\n\n`;
  message += `Jami: ${today.paymentCount} ta\n`;
  message += `💵 Summa: ${today.totalAmount.toLocaleString()} so'm\n\n`;
  
  if (today.payments.length > 0) {
    message += `⚠️ Bu pulni bugun qaytaring!`;
  }

  const keyboard = {
    inline_keyboard: [[
      { text: '📤 Pul qaytardim', callback_data: 'settlement:confirm' }
    ]]
  };

  await bot.sendMessage(chatId, message, { parse_mode: 'Markdown', reply_markup: keyboard });
};

const handleSettlementCallback = async (bot, callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  
  await bot.answerCallbackQuery(callbackQuery.id);

  const axios = require('axios');
  const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';
  
  if (data === 'settlement:confirm') {
    const response = await axios.get(`${API_URL}/drivers/telegram/${chatId}`);
    const driver = response.data.data.driver;

    const pending = await getDriverPendingSettlement(driver._id);
    
    if (pending.totalAmount === 0) {
      return await bot.sendMessage(chatId, 'Qaytarish uchun to\'lovlar yo\'q');
    }

    const keyboard = {
      inline_keyboard: [[
        { text: '✅ Ha', callback_data: 'settlement:yes' },
        { text: '❌ Yo\'q', callback_data: 'settlement:no' }
      ]]
    };

    await bot.sendMessage(chatId, 
      `${pending.totalAmount.toLocaleString()} so'm qaytardingizmi?`,
      { reply_markup: keyboard }
    );
  } else if (data === 'settlement:yes') {
    const response = await axios.get(`${API_URL}/drivers/telegram/${chatId}`);
    const driver = response.data.data.driver;
    
    const result = await driverConfirmSettlement(driver._id);
    await bot.sendMessage(chatId, `✅ ${result.count} ta to'lov tasdiqlandi. Rahmat!`);
  } else if (data === 'settlement:no') {
    await bot.sendMessage(chatId, 'Iltimos, imkon qadar tezroq qaytaring.');
  }
};

module.exports = { showDailyCollections, handleSettlementCallback };
