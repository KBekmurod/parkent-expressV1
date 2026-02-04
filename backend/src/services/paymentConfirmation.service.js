const CardPayment = require('../models/CardPayment.model');
const logger = require('../utils/logger');

const requestCustomerConfirmation = async (orderId, customerTelegramId, bot) => {
  try {
    const payment = await CardPayment.findOne({ orderId }).populate('orderId');
    if (!payment) return;

    const keyboard = {
      inline_keyboard: [[
        { text: '✅ Ha, to\'ladim', callback_data: `confirm:yes:${payment._id}` },
        { text: '❌ Yo\'q', callback_data: `confirm:no:${payment._id}` }
      ]]
    };

    await bot.sendMessage(customerTelegramId, 
      `✅ Buyurtma yetkazildi!\n\n📦 Order: #${payment.orderId.orderNumber}\n💰 ${payment.amount.toLocaleString()} so'm\n\n❓ Kurer kartasiga to'lovni qildingizmi?`,
      { parse_mode: 'Markdown', reply_markup: keyboard }
    );

    payment.confirmationRequestedAt = new Date();
    await payment.save();
  } catch (error) {
    logger.error('Error requesting confirmation:', error);
  }
};

const handleCustomerResponse = async (paymentId, confirmed) => {
  try {
    const payment = await CardPayment.findById(paymentId);
    if (!payment) return { success: false };

    payment.customerConfirmed = confirmed;
    payment.customerConfirmedAt = new Date();
    
    if (!confirmed) {
      payment.settlementStatus = 'disputed';
      logger.warn(`🚨 DISPUTED PAYMENT: ${paymentId}`);
    }
    
    await payment.save();
    return { success: true, message: confirmed ? 'Rahmat!' : 'Xabaringiz qabul qilindi' };
  } catch (error) {
    logger.error('Error handling response:', error);
    return { success: false };
  }
};

module.exports = { requestCustomerConfirmation, handleCustomerResponse };
