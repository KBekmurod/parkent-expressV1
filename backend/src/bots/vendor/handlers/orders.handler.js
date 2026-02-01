const axios = require('axios');
const { MESSAGES } = require('../utils/messages');
const { getOrderStatusActionKeyboard, getRejectReasonKeyboard } = require('../keyboards/orderMenu');
const { formatPrice, formatDateTime, getOrderStatusText } = require('../utils/helpers');
const logger = require('../../../utils/logger');

const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

// Store rejection reason inputs
if (!global.orderRejectionInputs) {
  global.orderRejectionInputs = new Map();
}

/**
 * Show active orders
 */
const showActiveOrders = async (bot, chatId, vendorId) => {
  try {
    const response = await axios.get(`${API_URL}/orders/vendor/${vendorId}`, {
      params: { status: 'pending,accepted,preparing' }
    });
    
    const orders = response.data.data.orders;

    if (orders.length === 0) {
      await bot.sendMessage(chatId, MESSAGES.uz.noActiveOrders);
      return;
    }

    // Send each order
    for (const order of orders.slice(0, 10)) { // Limit to 10 orders
      await sendOrderDetails(bot, chatId, order, 'uz');
    }
  } catch (error) {
    logger.error('Error showing active orders:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Show order history
 */
const showOrderHistory = async (bot, chatId, vendorId) => {
  try {
    const response = await axios.get(`${API_URL}/orders/vendor/${vendorId}`, {
      params: { status: 'ready,delivered,cancelled,rejected' }
    });
    
    const orders = response.data.data.orders;

    if (orders.length === 0) {
      await bot.sendMessage(chatId, MESSAGES.uz.noOrderHistory);
      return;
    }

    // Send summary
    let message = '📋 *Buyurtmalar tarixi*\n\n';
    
    orders.slice(0, 10).forEach((order, i) => {
      message += `${i + 1}. *${order.orderNumber}*\n`;
      message += `   ${getOrderStatusText(order.status, 'uz')}\n`;
      message += `   💰 ${formatPrice(order.total)}\n`;
      message += `   🕐 ${formatDateTime(order.createdAt)}\n\n`;
    });

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    logger.error('Error showing order history:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Send order details
 */
const sendOrderDetails = async (bot, chatId, order, language = 'uz') => {
  try {
    let message = `📦 *Buyurtma: ${order.orderNumber}*\n\n`;
    
    // Customer info
    message += `👤 Mijoz: ${order.customer.firstName} ${order.customer.lastName || ''}\n`;
    message += `📱 Telefon: ${order.customer.phone}\n`;
    message += `📍 Manzil: ${order.deliveryAddress.address}\n\n`;
    
    // Order items
    message += `📋 *Mahsulotlar:*\n`;
    order.items.forEach((item, i) => {
      const productName = item.product.name?.uz || item.product.name;
      message += `${i + 1}. ${productName} x${item.quantity} - ${formatPrice(item.price * item.quantity)}\n`;
    });
    
    // Totals
    message += `\n💰 Jami: *${formatPrice(order.total)}*\n`;
    message += `💳 To'lov: ${order.paymentMethod === 'cash' ? 'Naqd' : 'Karta'}\n`;
    
    // Status
    message += `\n🔄 Holat: ${getOrderStatusText(order.status, language)}\n`;
    message += `🕐 ${formatDateTime(order.createdAt)}`;
    
    // Customer note
    if (order.customerNote) {
      message += `\n\n📝 Izoh: _${order.customerNote}_`;
    }

    const keyboard = getOrderStatusActionKeyboard(order._id, order.status, language);
    
    await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  } catch (error) {
    logger.error('Error sending order details:', error);
    throw error;
  }
};

/**
 * Handle order callback queries
 */
const handleOrderCallback = async (bot, callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;
  const telegramId = callbackQuery.from.id.toString();

  try {
    // Get vendor
    const vendorResponse = await axios.get(`${API_URL}/vendors/telegram/${telegramId}`);
    const vendor = vendorResponse.data.data.vendor;

    const parts = data.split(':');
    const action = parts[1];
    const orderId = parts[2];

    if (action === 'accept') {
      await acceptOrder(bot, chatId, messageId, orderId);
    } else if (action === 'reject') {
      await showRejectReasons(bot, chatId, messageId, orderId);
    } else if (action === 'reject_reason') {
      const reason = parts[3];
      if (reason === 'custom') {
        // Ask for custom reason
        global.orderRejectionInputs.set(chatId, orderId);
        await bot.sendMessage(chatId, MESSAGES.uz.enterCustomReason);
      } else {
        await rejectOrder(bot, chatId, messageId, orderId, getReasonText(reason));
      }
    } else if (action === 'prepare') {
      await updateOrderStatus(bot, chatId, messageId, orderId, 'preparing');
    } else if (action === 'ready') {
      await updateOrderStatus(bot, chatId, messageId, orderId, 'ready');
    } else if (action === 'details') {
      await showOrderDetails(bot, chatId, orderId);
    } else if (action === 'list') {
      await showActiveOrders(bot, chatId, vendor._id);
    }

    await bot.answerCallbackQuery(callbackQuery.id);
  } catch (error) {
    logger.error('Error handling order callback:', error);
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: MESSAGES.uz.error,
      show_alert: true
    });
  }
};

/**
 * Accept order
 */
const acceptOrder = async (bot, chatId, messageId, orderId) => {
  try {
    const response = await axios.put(`${API_URL}/orders/${orderId}/status`, {
      status: 'accepted'
    });

    const order = response.data.data.order;

    await bot.editMessageText(
      MESSAGES.uz.orderAccepted(order.orderNumber),
      {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
        reply_markup: getOrderStatusActionKeyboard(orderId, 'accepted', 'uz')
      }
    );

    logger.info(`Order ${order.orderNumber} accepted`);
  } catch (error) {
    logger.error('Error accepting order:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Show reject reasons
 */
const showRejectReasons = async (bot, chatId, messageId, orderId) => {
  await bot.editMessageReplyMarkup(
    getRejectReasonKeyboard(orderId, 'uz'),
    {
      chat_id: chatId,
      message_id: messageId
    }
  );
};

/**
 * Reject order
 */
const rejectOrder = async (bot, chatId, messageId, orderId, reason) => {
  try {
    const response = await axios.put(`${API_URL}/orders/${orderId}/status`, {
      status: 'rejected',
      note: reason
    });

    const order = response.data.data.order;

    await bot.editMessageText(
      MESSAGES.uz.orderRejected(order.orderNumber) + `\n\nSabab: ${reason}`,
      {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown'
      }
    );

    logger.info(`Order ${order.orderNumber} rejected: ${reason}`);
  } catch (error) {
    logger.error('Error rejecting order:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Handle custom rejection reason input
 */
const handleRejectionReasonInput = async (bot, msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const orderId = global.orderRejectionInputs.get(chatId);

  if (!orderId) {
    return;
  }

  try {
    await rejectOrder(bot, chatId, null, orderId, text);
    global.orderRejectionInputs.delete(chatId);
  } catch (error) {
    logger.error('Error handling rejection reason:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Update order status
 */
const updateOrderStatus = async (bot, chatId, messageId, orderId, status) => {
  try {
    const response = await axios.put(`${API_URL}/orders/${orderId}/status`, {
      status
    });

    const order = response.data.data.order;
    
    let message = '';
    if (status === 'preparing') {
      message = MESSAGES.uz.orderPreparing(order.orderNumber);
    } else if (status === 'ready') {
      message = MESSAGES.uz.orderReady(order.orderNumber);
    }

    if (messageId) {
      await bot.editMessageText(
        message,
        {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'Markdown',
          reply_markup: getOrderStatusActionKeyboard(orderId, status, 'uz')
        }
      );
    } else {
      await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    }

    logger.info(`Order ${order.orderNumber} status updated to ${status}`);
  } catch (error) {
    logger.error('Error updating order status:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Show single order details
 */
const showOrderDetails = async (bot, chatId, orderId) => {
  try {
    const response = await axios.get(`${API_URL}/orders/${orderId}`);
    const order = response.data.data.order;
    
    await sendOrderDetails(bot, chatId, order, 'uz');
  } catch (error) {
    logger.error('Error showing order details:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Get reason text from code
 */
const getReasonText = (reasonCode) => {
  const reasons = {
    out_of_stock: 'Mahsulot tugagan',
    busy: 'Band',
    technical: 'Texnik muammo'
  };
  return reasons[reasonCode] || reasonCode;
};

/**
 * Notify vendor about new order
 */
const notifyNewOrder = async (bot, vendorTelegramId, order) => {
  try {
    const items = order.items.map(item => ({
      name: item.product.name?.uz || item.product.name,
      quantity: item.quantity
    }));

    const message = MESSAGES.uz.newOrder(
      order.orderNumber,
      order.total,
      items
    );

    const keyboard = getOrderStatusActionKeyboard(order._id, order.status, 'uz');

    await bot.sendMessage(vendorTelegramId, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });

    logger.info(`New order notification sent to vendor ${vendorTelegramId}`);
  } catch (error) {
    logger.error('Error notifying vendor about new order:', error);
  }
};

module.exports = {
  showActiveOrders,
  showOrderHistory,
  handleOrderCallback,
  handleRejectionReasonInput,
  notifyNewOrder
};
