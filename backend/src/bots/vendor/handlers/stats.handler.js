const axios = require('axios');
const { MESSAGES } = require('../utils/messages');
const { formatPrice } = require('../utils/helpers');
const logger = require('../../../utils/logger');

const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

/**
 * Show vendor statistics
 */
const showStats = async (bot, chatId, vendorId) => {
  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get this week's date range
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    // Get this month's date range
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Fetch orders for vendor
    const ordersResponse = await axios.get(`${API_URL}/orders/vendor/${vendorId}`);
    const allOrders = ordersResponse.data.data.orders;

    // Filter and calculate stats
    const todayOrders = allOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= today && orderDate < tomorrow && order.status === 'delivered';
    });

    const weekOrders = allOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= weekStart && order.status === 'delivered';
    });

    const monthOrders = allOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= monthStart && order.status === 'delivered';
    });

    // Calculate earnings (subtract commission if applicable)
    const calculateEarnings = (orders) => {
      return orders.reduce((total, order) => total + order.total, 0);
    };

    const todayEarnings = calculateEarnings(todayOrders);
    const weekEarnings = calculateEarnings(weekOrders);
    const monthEarnings = calculateEarnings(monthOrders);

    // Get vendor info for commission
    const vendorResponse = await axios.get(`${API_URL}/vendors/${vendorId}`);
    const vendor = vendorResponse.data.data.vendor;
    const commission = vendor.commission || 10;

    // Build message
    let message = MESSAGES.uz.statsTitle + '\n\n';
    
    if (todayOrders.length > 0 || weekOrders.length > 0 || monthOrders.length > 0) {
      message += MESSAGES.uz.todayStats(todayOrders.length, Math.round(todayEarnings * (100 - commission) / 100));
      message += '\n';
      message += MESSAGES.uz.weekStats(weekOrders.length, Math.round(weekEarnings * (100 - commission) / 100));
      message += '\n';
      message += MESSAGES.uz.monthStats(monthOrders.length, Math.round(monthEarnings * (100 - commission) / 100));
      
      // Overall stats
      message += '\n\n📊 *Umumiy*\n';
      message += `⭐ Reyting: ${vendor.rating.toFixed(1)}/5.0\n`;
      message += `📦 Jami buyurtmalar: ${vendor.totalOrders}\n`;
      message += `💰 Balans: ${formatPrice(vendor.balance)}`;
    } else {
      message += '\n' + MESSAGES.uz.noStatsYet;
    }

    const keyboard = {
      inline_keyboard: [
        [
          { text: '📅 Kunlik', callback_data: `stats:daily:${vendorId}` },
          { text: '📅 Haftalik', callback_data: `stats:weekly:${vendorId}` },
          { text: '📅 Oylik', callback_data: `stats:monthly:${vendorId}` }
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
    logger.error('Error showing stats:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Handle stats callback
 */
const handleStatsCallback = async (bot, callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  const telegramId = callbackQuery.from.id.toString();

  try {
    // Get vendor
    const vendorResponse = await axios.get(`${API_URL}/vendors/telegram/${telegramId}`);
    const vendor = vendorResponse.data.data.vendor;

    const parts = data.split(':');
    const period = parts[1];
    const vendorId = parts[2];

    // Show stats (same view for now, can be customized per period)
    await showStats(bot, chatId, vendorId);

    await bot.answerCallbackQuery(callbackQuery.id);
  } catch (error) {
    logger.error('Error handling stats callback:', error);
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: MESSAGES.uz.error,
      show_alert: true
    });
  }
};

module.exports = {
  showStats,
  handleStatsCallback
};
