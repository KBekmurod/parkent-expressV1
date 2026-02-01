const axios = require('axios');
const { MESSAGES } = require('../utils/messages');
const { formatPrice, formatDateTime, getEarningsPeriod } = require('../utils/helpers');
const logger = require('../../../utils/logger');

const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

/**
 * Show earnings
 */
const showEarnings = async (bot, chatId, driverId) => {
  try {
    // Get earnings summary
    const response = await axios.get(`${API_URL}/drivers/${driverId}/earnings`);
    const earnings = response.data.data;

    let message = '💰 *Daromad statistikasi*\n\n';
    
    // Daily earnings
    message += `📅 *Bugun:*\n`;
    message += `💵 ${formatPrice(earnings.daily?.amount || 0)}\n`;
    message += `📦 ${earnings.daily?.count || 0} buyurtma\n\n`;
    
    // Weekly earnings
    message += `📅 *Bu hafta:*\n`;
    message += `💵 ${formatPrice(earnings.weekly?.amount || 0)}\n`;
    message += `📦 ${earnings.weekly?.count || 0} buyurtma\n\n`;
    
    // Monthly earnings
    message += `📅 *Bu oy:*\n`;
    message += `💵 ${formatPrice(earnings.monthly?.amount || 0)}\n`;
    message += `📦 ${earnings.monthly?.count || 0} buyurtma\n\n`;
    
    // Total earnings
    message += `📊 *Jami:*\n`;
    message += `💵 ${formatPrice(earnings.total?.amount || 0)}\n`;
    message += `📦 ${earnings.total?.count || 0} buyurtma\n\n`;
    
    // Average per delivery
    if (earnings.total?.count > 0) {
      const avgEarning = earnings.total.amount / earnings.total.count;
      message += `📈 O'rtacha: ${formatPrice(avgEarning)} / buyurtma`;
    }

    await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📊 Batafsil', callback_data: 'earnings:details' }
          ],
          [
            { text: '💸 To\'lov so\'rash', callback_data: 'earnings:request_payout' }
          ]
        ]
      }
    });
  } catch (error) {
    logger.error('Error showing earnings:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Show daily earnings
 */
const showDailyEarnings = async (bot, chatId, driverId) => {
  try {
    const { startDate, endDate } = getEarningsPeriod('daily');
    
    const response = await axios.get(`${API_URL}/orders/driver/${driverId}`, {
      params: {
        status: 'delivered',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });
    
    const orders = response.data.data.orders;
    const totalEarnings = orders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0);

    if (orders.length === 0) {
      await bot.sendMessage(chatId, MESSAGES.uz.noEarnings);
      return;
    }

    let message = MESSAGES.uz.earningsDaily(totalEarnings, orders.length);
    message += '\n\n📋 *Buyurtmalar:*\n\n';
    
    orders.forEach((order, i) => {
      message += `${i + 1}. ${order.orderNumber}\n`;
      message += `   💰 ${formatPrice(order.deliveryFee || 0)}\n`;
      message += `   🕐 ${formatDateTime(order.deliveredAt || order.updatedAt)}\n\n`;
    });

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    logger.error('Error showing daily earnings:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Show weekly earnings
 */
const showWeeklyEarnings = async (bot, chatId, driverId) => {
  try {
    const { startDate, endDate } = getEarningsPeriod('weekly');
    
    const response = await axios.get(`${API_URL}/orders/driver/${driverId}`, {
      params: {
        status: 'delivered',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });
    
    const orders = response.data.data.orders;
    const totalEarnings = orders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0);

    if (orders.length === 0) {
      await bot.sendMessage(chatId, MESSAGES.uz.noEarnings);
      return;
    }

    let message = MESSAGES.uz.earningsWeekly(totalEarnings, orders.length);
    
    // Group by day
    const groupedByDay = {};
    orders.forEach(order => {
      const date = new Date(order.deliveredAt || order.updatedAt);
      const dayKey = date.toLocaleDateString('uz-UZ');
      
      if (!groupedByDay[dayKey]) {
        groupedByDay[dayKey] = { count: 0, amount: 0 };
      }
      
      groupedByDay[dayKey].count++;
      groupedByDay[dayKey].amount += order.deliveryFee || 0;
    });

    message += '\n\n📋 *Kunlik hisobot:*\n\n';
    
    Object.entries(groupedByDay).forEach(([day, data]) => {
      message += `📅 ${day}\n`;
      message += `   💰 ${formatPrice(data.amount)} (${data.count} buyurtma)\n\n`;
    });

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    logger.error('Error showing weekly earnings:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Show monthly earnings
 */
const showMonthlyEarnings = async (bot, chatId, driverId) => {
  try {
    const { startDate, endDate } = getEarningsPeriod('monthly');
    
    const response = await axios.get(`${API_URL}/orders/driver/${driverId}`, {
      params: {
        status: 'delivered',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });
    
    const orders = response.data.data.orders;
    const totalEarnings = orders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0);

    if (orders.length === 0) {
      await bot.sendMessage(chatId, MESSAGES.uz.noEarnings);
      return;
    }

    let message = MESSAGES.uz.earningsMonthly(totalEarnings, orders.length);
    
    // Calculate statistics
    const avgEarning = totalEarnings / orders.length;
    const daysWorked = new Set(orders.map(order => {
      const date = new Date(order.deliveredAt || order.updatedAt);
      return date.toLocaleDateString('uz-UZ');
    })).size;
    
    message += '\n\n📊 *Statistika:*\n';
    message += `📈 O'rtacha buyurtma: ${formatPrice(avgEarning)}\n`;
    message += `📅 Ishlangan kunlar: ${daysWorked}\n`;
    message += `📦 Kunlik o'rtacha: ${Math.round(orders.length / daysWorked)} buyurtma`;

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    logger.error('Error showing monthly earnings:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Request payout
 */
const requestPayout = async (bot, chatId, driverId) => {
  try {
    // Get driver's available balance
    const response = await axios.get(`${API_URL}/drivers/${driverId}/balance`);
    const balance = response.data.data.balance;

    if (balance <= 0) {
      await bot.sendMessage(chatId, '❌ To\'lanadigan mablag\' yo\'q.');
      return;
    }

    // Create payout request
    await axios.post(`${API_URL}/transactions/payout-request`, {
      driverId,
      amount: balance
    });

    await bot.sendMessage(
      chatId,
      MESSAGES.uz.payoutRequested + `\n\n💰 Summa: ${formatPrice(balance)}`
    );

    logger.info(`Driver ${driverId} requested payout: ${balance}`);
  } catch (error) {
    logger.error('Error requesting payout:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Show transaction history
 */
const showTransactionHistory = async (bot, chatId, driverId) => {
  try {
    const response = await axios.get(`${API_URL}/transactions/driver/${driverId}`, {
      params: { limit: 10 }
    });
    
    const transactions = response.data.data.transactions;

    if (transactions.length === 0) {
      await bot.sendMessage(chatId, '📋 Tranzaksiyalar tarixi bo\'sh');
      return;
    }

    let message = '📋 *Tranzaksiyalar tarixi*\n\n';
    
    transactions.forEach((tx, i) => {
      const type = tx.type === 'earning' ? '💰 Daromad' : '💸 To\'lov';
      const sign = tx.type === 'earning' ? '+' : '-';
      
      message += `${i + 1}. ${type}\n`;
      message += `   ${sign}${formatPrice(tx.amount)}\n`;
      message += `   🕐 ${formatDateTime(tx.createdAt)}\n`;
      if (tx.description) {
        message += `   📝 ${tx.description}\n`;
      }
      message += '\n';
    });

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    logger.error('Error showing transaction history:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Handle earnings callback queries
 */
const handleEarningsCallback = async (bot, callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  const telegramId = callbackQuery.from.id.toString();

  try {
    // Get driver
    const response = await axios.get(`${API_URL}/drivers/telegram/${telegramId}`);
    const driver = response.data.data.driver;

    const action = data.split(':')[1];

    if (action === 'details') {
      await showTransactionHistory(bot, chatId, driver._id);
    } else if (action === 'request_payout') {
      await requestPayout(bot, chatId, driver._id);
    } else if (action === 'daily') {
      await showDailyEarnings(bot, chatId, driver._id);
    } else if (action === 'weekly') {
      await showWeeklyEarnings(bot, chatId, driver._id);
    } else if (action === 'monthly') {
      await showMonthlyEarnings(bot, chatId, driver._id);
    }

    await bot.answerCallbackQuery(callbackQuery.id);
  } catch (error) {
    logger.error('Error handling earnings callback:', error);
    await bot.answerCallbackQuery(callbackQuery.id, { text: MESSAGES.uz.error });
  }
};

module.exports = {
  showEarnings,
  showDailyEarnings,
  showWeeklyEarnings,
  showMonthlyEarnings,
  requestPayout,
  showTransactionHistory,
  handleEarningsCallback
};
