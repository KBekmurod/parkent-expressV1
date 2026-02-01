const axios = require('axios');
const { MESSAGES } = require('../utils/messages');
const { getOrderActionKeyboard, getRejectReasonKeyboard } = require('../keyboards/orderMenu');
const { formatPrice, formatDateTime, getOrderStatusText } = require('../utils/helpers');
const logger = require('../../../utils/logger');

const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

// Store order rejection inputs
if (!global.driverOrderRejectionInputs) {
  global.driverOrderRejectionInputs = new Map();
}

/**
 * Show active orders
 */
const showActiveOrders = async (bot, chatId, driverId) => {
  try {
    const response = await axios.get(`${API_URL}/orders/driver/${driverId}`, {
      params: { status: 'ready,picked_up,on_the_way' }
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
const showOrderHistory = async (bot, chatId, driverId) => {
  try {
    const response = await axios.get(`${API_URL}/orders/driver/${driverId}`, {
      params: { status: 'delivered,cancelled' }
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
      message += `   💰 ${formatPrice(order.deliveryFee || 0)}\n`;
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
    
    // Vendor info
    const vendorName = order.vendor?.name?.uz || order.vendor?.name || 'Restoran';
    message += `🏪 Restoran: ${vendorName}\n`;
    if (order.vendor?.address) {
      message += `📍 Manzil: ${order.vendor.address}\n`;
    }
    message += `\n`;
    
    // Customer info
    message += `👤 Mijoz: ${order.customer.firstName} ${order.customer.lastName || ''}\n`;
    message += `📱 Telefon: ${order.customer.phone}\n`;
    message += `📍 Yetkazish: ${order.deliveryAddress.address}\n\n`;
    
    // Order items summary
    message += `📋 *Mahsulotlar:* ${order.items.length} ta\n`;
    
    // Totals
    message += `💰 Summa: *${formatPrice(order.total)}*\n`;
    message += `🚗 Yetkazish: *${formatPrice(order.deliveryFee || 0)}*\n`;
    message += `💳 To'lov: ${order.paymentMethod === 'cash' ? 'Naqd' : 'Karta'}\n`;
    
    // Status
    message += `\n🔄 Holat: ${getOrderStatusText(order.status, language)}\n`;
    message += `🕐 ${formatDateTime(order.createdAt)}`;
    
    // Customer note
    if (order.customerNote) {
      message += `\n\n📝 Izoh: _${order.customerNote}_`;
    }

    const keyboard = getOrderActionKeyboard(order._id, order.status, language);
    
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
    // Get driver
    const driverResponse = await axios.get(`${API_URL}/drivers/telegram/${telegramId}`);
    const driver = driverResponse.data.data.driver;

    const parts = data.split(':');
    const action = parts[1];
    const orderId = parts[2];

    if (action === 'accept') {
      await acceptOrder(bot, chatId, messageId, orderId, driver._id);
    } else if (action === 'reject') {
      await showRejectReasons(bot, chatId, messageId, orderId);
    } else if (action === 'reject_reason') {
      const reason = parts[3];
      if (reason === 'custom') {
        // Ask for custom reason
        global.driverOrderRejectionInputs.set(chatId, orderId);
        await bot.sendMessage(chatId, MESSAGES.uz.enterCustomReason);
        await bot.answerCallbackQuery(callbackQuery.id);
      } else {
        await rejectOrder(bot, chatId, messageId, orderId, getReasonText(reason));
      }
    } else if (action === 'on_the_way') {
      await updateOrderStatus(bot, chatId, messageId, orderId, 'on_the_way');
    } else if (action === 'delivered') {
      await updateOrderStatus(bot, chatId, messageId, orderId, 'delivered');
    } else if (action === 'location') {
      await requestLocation(bot, chatId);
      await bot.answerCallbackQuery(callbackQuery.id);
    } else if (action === 'refresh') {
      await refreshOrder(bot, chatId, messageId, orderId);
    } else if (action === 'back') {
      await refreshOrder(bot, chatId, messageId, orderId);
    }
  } catch (error) {
    logger.error('Error handling order callback:', error);
    await bot.answerCallbackQuery(callbackQuery.id, { text: MESSAGES.uz.error });
  }
};

/**
 * Accept order
 */
const acceptOrder = async (bot, chatId, messageId, orderId, driverId) => {
  try {
    await axios.put(`${API_URL}/orders/${orderId}/status`, {
      status: 'picked_up',
      driverId
    });

    await bot.editMessageText(
      MESSAGES.uz.orderAccepted,
      {
        chat_id: chatId,
        message_id: messageId
      }
    );

    // Get updated order and send new details
    const response = await axios.get(`${API_URL}/orders/${orderId}`);
    const order = response.data.data.order;
    await sendOrderDetails(bot, chatId, order, 'uz');

    logger.info(`Driver accepted order ${orderId}`);
  } catch (error) {
    logger.error('Error accepting order:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Show reject reasons
 */
const showRejectReasons = async (bot, chatId, messageId, orderId) => {
  try {
    await bot.editMessageReplyMarkup(
      getRejectReasonKeyboard(orderId, 'uz'),
      {
        chat_id: chatId,
        message_id: messageId
      }
    );
  } catch (error) {
    logger.error('Error showing reject reasons:', error);
  }
};

/**
 * Reject order
 */
const rejectOrder = async (bot, chatId, messageId, orderId, reason) => {
  try {
    await axios.put(`${API_URL}/orders/${orderId}/status`, {
      status: 'ready',
      driverRejectionReason: reason
    });

    await bot.editMessageText(
      `❌ Buyurtma rad etildi.\n\nSabab: ${reason}`,
      {
        chat_id: chatId,
        message_id: messageId
      }
    );

    logger.info(`Driver rejected order ${orderId}: ${reason}`);
  } catch (error) {
    logger.error('Error rejecting order:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Update order status
 */
const updateOrderStatus = async (bot, chatId, messageId, orderId, status) => {
  try {
    await axios.put(`${API_URL}/orders/${orderId}/status`, { status });

    const statusMessages = {
      on_the_way: MESSAGES.uz.orderOnTheWay,
      delivered: MESSAGES.uz.orderDelivered
    };

    await bot.editMessageText(
      statusMessages[status] || '✅ Holat yangilandi',
      {
        chat_id: chatId,
        message_id: messageId
      }
    );

    logger.info(`Order ${orderId} status updated to ${status}`);
  } catch (error) {
    logger.error('Error updating order status:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Request location
 */
const requestLocation = async (bot, chatId) => {
  try {
    await bot.sendMessage(
      chatId,
      MESSAGES.uz.shareLocation,
      {
        reply_markup: {
          keyboard: [
            [{ text: '📍 Joylashuvni yuborish', request_location: true }]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      }
    );
  } catch (error) {
    logger.error('Error requesting location:', error);
  }
};

/**
 * Refresh order
 */
const refreshOrder = async (bot, chatId, messageId, orderId) => {
  try {
    const response = await axios.get(`${API_URL}/orders/${orderId}`);
    const order = response.data.data.order;

    let message = `📦 *Buyurtma: ${order.orderNumber}*\n\n`;
    message += `🔄 Holat: ${getOrderStatusText(order.status, 'uz')}\n`;
    message += `💰 Summa: *${formatPrice(order.total)}*\n`;
    message += `🕐 ${formatDateTime(order.createdAt)}`;

    const keyboard = getOrderActionKeyboard(order._id, order.status, 'uz');

    await bot.editMessageText(message, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  } catch (error) {
    logger.error('Error refreshing order:', error);
  }
};

/**
 * Handle rejection reason input
 */
const handleRejectionReasonInput = async (bot, msg) => {
  const chatId = msg.chat.id;
  const reason = msg.text;

  try {
    const orderId = global.driverOrderRejectionInputs.get(chatId);
    
    if (!orderId) {
      return;
    }

    await rejectOrder(bot, chatId, null, orderId, reason);
    
    // Clear state
    global.driverOrderRejectionInputs.delete(chatId);

    await bot.sendMessage(chatId, `❌ Buyurtma rad etildi.\n\nSabab: ${reason}`);
  } catch (error) {
    logger.error('Error handling rejection reason:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Get reason text
 */
const getReasonText = (reason) => {
  const reasons = {
    no_vehicle: 'Transport yo\'q',
    too_far: 'Juda uzoq',
    busy: 'Band'
  };
  return reasons[reason] || reason;
};

/**
 * Notify driver of new order assignment
 */
const notifyNewOrder = async (bot, telegramId, order) => {
  try {
    const chatId = parseInt(telegramId);
    
    await bot.sendMessage(
      chatId,
      MESSAGES.uz.newOrderAssigned(order.orderNumber)
    );

    await sendOrderDetails(bot, chatId, order, 'uz');
  } catch (error) {
    logger.error('Error notifying new order:', error);
  }
};

module.exports = {
  showActiveOrders,
  showOrderHistory,
  sendOrderDetails,
  handleOrderCallback,
  handleRejectionReasonInput,
  notifyNewOrder
};
