const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const logger = require('../../../utils/logger');
const { CARD_PAYMENT_MESSAGES } = require('../utils/cardMessages');

const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

/**
 * Show card payment info when order is card payment type
 */
const showCardPaymentInfo = async (bot, chatId, order, driver) => {
  try {
    if (order.paymentMethod !== 'card_to_driver') {
      return; // Not a card payment order
    }

    // Get driver's card number (you should set this in driver profile)
    const cardNumber = driver.cardNumber || '8600 **** **** ****';
    
    const message = CARD_PAYMENT_MESSAGES.uz.showCard
      .replace('{cardNumber}', formatCardNumber(cardNumber))
      .replace('{amount}', order.total.toLocaleString());

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

    // Create card payment record in backend
    try {
      await axios.post(`${API_URL}/card-payments`, {
        orderId: order._id,
        driverId: driver._id,
        customerId: order.customer,
        amount: order.total
      });
      logger.info(`Card payment record created for order ${order._id}`);
    } catch (apiError) {
      logger.error('Error creating card payment record:', apiError.message);
      // Continue anyway - driver can still upload receipt
    }

  } catch (error) {
    logger.error('Error showing card payment info:', error);
  }
};

/**
 * Format card number (mask middle digits)
 */
const formatCardNumber = (cardNumber) => {
  if (!cardNumber) return '8600 **** **** ****';
  
  // Remove spaces
  const cleaned = cardNumber.replace(/\s/g, '');
  
  // Format: 8600 1234 5678 9012 → 8600 **** **** 9012
  if (cleaned.length === 16) {
    return `${cleaned.substring(0, 4)} **** **** ${cleaned.substring(12)}`;
  }
  
  return cardNumber;
};

/**
 * Handle receipt photo upload from driver
 */
const handleReceiptUpload = async (bot, msg) => {
  const chatId = msg.chat.id;
  const photo = msg.photo;

  if (!photo || photo.length === 0) {
    return await bot.sendMessage(chatId, CARD_PAYMENT_MESSAGES.uz.uploadError);
  }

  let tempPath = null;

  try {
    // Get the largest photo (best quality)
    const fileId = photo[photo.length - 1].file_id;
    
    // Get file info from Telegram
    const file = await bot.getFile(fileId);
    const filePath = file.file_path;
    
    // Download file from Telegram
    const fileUrl = `https://api.telegram.org/file/bot${process.env.DRIVER_BOT_TOKEN}/${filePath}`;
    const response = await axios.get(fileUrl, { responseType: 'stream' });
    
    // Save temporarily
    tempPath = `./uploads/temp/receipt-${Date.now()}.jpg`;
    
    // Ensure directory exists
    const tempDir = './uploads/temp';
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const writer = fs.createWriteStream(tempPath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // Ask which order this receipt is for (if driver has multiple active card orders)
    // For simplicity, we'll assume it's for the most recent card payment order
    
    // Get driver's pending card payments
    const telegramId = chatId.toString();
    const driverResponse = await axios.get(`${API_URL}/drivers/telegram/${telegramId}`);
    const driver = driverResponse.data.data.driver;
    
    const paymentsResponse = await axios.get(`${API_URL}/card-payments/driver/${driver._id}`, {
      params: { status: 'pending' }
    });
    
    const pendingPayments = paymentsResponse.data.data.payments;
    
    if (pendingPayments.length === 0) {
      return await bot.sendMessage(
        chatId,
        'Sizda chek yuklash uchun kutilayotgan karta to\'lovlar yo\'q.'
      );
    }

    // Get the most recent one
    const payment = pendingPayments[0];
    
    // Upload to backend
    const formData = new FormData();
    formData.append('receipt', fs.createReadStream(tempPath));
    
    await axios.post(
      `${API_URL}/card-payments/${payment._id}/receipt`,
      formData,
      {
        headers: formData.getHeaders()
      }
    );

    // Fetch order number if needed (orderId might be just an ID string)
    let orderNumber = '';
    if (payment.orderId) {
      if (typeof payment.orderId === 'object' && payment.orderId.orderNumber) {
        orderNumber = payment.orderId.orderNumber;
      } else {
        // orderId is just a string ID, fetch the order if needed
        try {
          const orderResponse = await axios.get(`${API_URL}/orders/${payment.orderId}`);
          orderNumber = orderResponse.data.data.order.orderNumber;
        } catch (err) {
          logger.warn('Could not fetch order number:', err.message);
          orderNumber = payment.orderId.toString().substring(0, 8);
        }
      }
    }

    // Success message
    await bot.sendMessage(
      chatId,
      CARD_PAYMENT_MESSAGES.uz.receiptReceived
        .replace('{amount}', payment.amount.toLocaleString())
        .replace('{orderNumber}', orderNumber),
      { parse_mode: 'Markdown' }
    );

    logger.info(`Receipt uploaded for payment ${payment._id} by driver ${driver._id}`);

  } catch (error) {
    logger.error('Error handling receipt upload:', error);
    await bot.sendMessage(chatId, CARD_PAYMENT_MESSAGES.uz.uploadError);
  } finally {
    // Clean up temporary file
    if (tempPath && fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
      } catch (cleanupError) {
        logger.error('Error cleaning up temp file:', cleanupError);
      }
    }
  }
};

/**
 * Show receipt upload instructions
 */
const showReceiptUploadInstructions = async (bot, chatId) => {
  await bot.sendMessage(
    chatId,
    CARD_PAYMENT_MESSAGES.uz.requestReceipt,
    { parse_mode: 'Markdown' }
  );
};

module.exports = {
  showCardPaymentInfo,
  handleReceiptUpload,
  showReceiptUploadInstructions,
  formatCardNumber
};
