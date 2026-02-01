const axios = require('axios');
const { MESSAGES } = require('../utils/messages');
const { userCarts } = require('./vendor.handler');
const logger = require('../../../utils/logger');

const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

/**
 * Create order
 */
const createOrder = async (bot, chatId, userId, deliveryAddress) => {
  try {
    const cart = userCarts.get(chatId) || [];

    if (cart.length === 0) {
      return await bot.sendMessage(chatId, MESSAGES.uz.emptyCart);
    }

    // Get first product to determine vendor
    const firstProductResponse = await axios.get(`${API_URL}/products/${cart[0].productId}`);
    const vendorId = firstProductResponse.data.data.product.vendor;

    // Prepare order items
    const items = cart.map(item => ({
      product: item.productId,
      quantity: item.quantity
    }));

    // Create order
    const orderResponse = await axios.post(`${API_URL}/orders`, {
      customer: userId,
      vendor: vendorId,
      items,
      deliveryAddress,
      paymentMethod: 'cash' // Default, can be changed later
    });

    const order = orderResponse.data.data.order;

    // Clear cart
    userCarts.delete(chatId);

    // Send confirmation
    let message = '✅ *Buyurtma qabul qilindi!*\n\n';
    message += `📦 Buyurtma raqami: *${order.orderNumber}*\n`;
    message += `💰 Jami: *${order.total} so'm*\n`;
    message += `📍 Manzil: ${deliveryAddress.address}\n\n`;
    message += `⏳ Holati: ${getStatusText(order.status)}`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🔍 Buyurtmani kuzatish', callback_data: `order:track:${order._id}` }
        ],
        [
          { text: '🏠 Bosh menyu', callback_data: 'menu:main' }
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

    logger.info(`Order created: ${order._id} by customer ${userId}`);

  } catch (error) {
    logger.error('Error creating order:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Track order
 */
const trackOrder = async (bot, chatId, orderId) => {
  try {
    const response = await axios.get(`${API_URL}/orders/${orderId}`);
    const order = response.data.data.order;

    let message = `📦 *Buyurtma: ${order.orderNumber}*\n\n`;
    message += `⏳ Holati: *${getStatusText(order.status)}*\n\n`;
    
    // Timeline
    message += `📋 *Buyurtma tarixi:*\n`;
    order.timeline.forEach(item => {
      const time = new Date(item.timestamp).toLocaleTimeString('uz-UZ');
      message += `• ${getStatusText(item.status)} - ${time}\n`;
    });

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🔄 Yangilash', callback_data: `order:track:${order._id}` }
        ],
        [
          { text: '🏠 Bosh menyu', callback_data: 'menu:main' }
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
    logger.error('Error tracking order:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Show order history
 */
const showOrderHistory = async (bot, chatId) => {
  try {
    const telegramId = chatId.toString();
    
    // Get user
    const userResponse = await axios.get(`${API_URL}/users/telegram/${telegramId}`);
    const user = userResponse.data.data.user;

    // Get user orders
    const ordersResponse = await axios.get(`${API_URL}/orders`, {
      params: { customer: user._id }
    });
    const orders = ordersResponse.data.data.orders;

    if (orders.length === 0) {
      return await bot.sendMessage(chatId, '📦 Sizda hali buyurtmalar yo\'q');
    }

    let message = '📦 *Mening buyurtmalarim:*\n\n';
    
    orders.slice(0, 10).forEach((order, index) => {
      message += `${index + 1}. ${order.orderNumber} - ${getStatusText(order.status)}\n`;
      message += `   💰 ${order.total} so'm\n\n`;
    });

    const keyboard = {
      inline_keyboard: orders.slice(0, 10).map(order => [{
        text: `${order.orderNumber} - ${getStatusText(order.status)}`,
        callback_data: `order:track:${order._id}`
      }])
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
    logger.error('Error showing order history:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Get status text in Uzbek
 */
const getStatusText = (status) => {
  const statusTexts = {
    pending: '⏳ Kutilmoqda',
    accepted: '✅ Qabul qilindi',
    preparing: '👨‍🍳 Tayyorlanmoqda',
    ready: '📦 Tayyor',
    assigned: '🚗 Kuryer tayinlandi',
    picked_up: '🏃 Olib ketildi',
    on_the_way: '🚚 Yo\'lda',
    delivered: '✅ Yetkazildi',
    cancelled: '❌ Bekor qilindi',
    rejected: '❌ Rad etildi'
  };
  return statusTexts[status] || status;
};

/**
 * Handle order callback
 */
const handleOrderCallback = async (bot, callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data.split(':');
  const action = data[1];
  const orderId = data[2];

  await bot.answerCallbackQuery(callbackQuery.id);

  if (action === 'track') {
    await trackOrder(bot, chatId, orderId);
  }
};

module.exports = {
  createOrder,
  trackOrder,
  showOrderHistory,
  handleOrderCallback,
  getStatusText
};
