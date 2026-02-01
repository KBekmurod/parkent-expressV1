const axios = require('axios');
const { MESSAGES } = require('../utils/messages');
const { getMainMenuKeyboard } = require('../keyboards/mainMenu');
const { getStatusKeyboard } = require('../keyboards/statusMenu');
const { startLocationTracking, stopLocationTracking } = require('./location.handler');
const logger = require('../../../utils/logger');

const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

/**
 * Show driver profile
 */
const showProfile = async (bot, chatId, driverId) => {
  try {
    const response = await axios.get(`${API_URL}/drivers/${driverId}`);
    const driver = response.data.data.driver;

    const message = MESSAGES.uz.profileInfo(driver);

    await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✏️ Tahrirlash', callback_data: 'profile:edit' }
          ],
          [
            { text: '⭐ Reytinglar', callback_data: 'profile:ratings' },
            { text: '📊 Statistika', callback_data: 'profile:stats' }
          ]
        ]
      }
    });
  } catch (error) {
    logger.error('Error showing profile:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Toggle online/offline status
 */
const toggleOnlineStatus = async (bot, chatId, driverId, isOnline) => {
  try {
    // Update driver status
    await axios.put(`${API_URL}/drivers/${driverId}/status`, {
      isOnline
    });

    // Handle location tracking
    if (isOnline) {
      await startLocationTracking(bot, chatId, driverId);
      await bot.sendMessage(
        chatId,
        MESSAGES.uz.nowOnline,
        {
          reply_markup: getMainMenuKeyboard(true, 'uz')
        }
      );
    } else {
      await stopLocationTracking(bot, chatId, driverId);
      await bot.sendMessage(
        chatId,
        MESSAGES.uz.nowOffline,
        {
          reply_markup: getMainMenuKeyboard(false, 'uz')
        }
      );
    }

    logger.info(`Driver ${driverId} status changed to ${isOnline ? 'online' : 'offline'}`);
  } catch (error) {
    logger.error('Error toggling online status:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Show driver ratings and reviews
 */
const showRatings = async (bot, chatId, driverId) => {
  try {
    const response = await axios.get(`${API_URL}/reviews/driver/${driverId}`);
    const reviews = response.data.data.reviews;

    if (reviews.length === 0) {
      await bot.sendMessage(chatId, '⭐ Hali reytinglar yo\'q');
      return;
    }

    // Calculate average rating
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    let message = `⭐ *Reytinglar va sharhlar*\n\n`;
    message += `📊 O'rtacha reyting: *${avgRating.toFixed(1)}/5*\n`;
    message += `💬 Sharhlar soni: *${reviews.length}*\n\n`;
    
    // Show recent reviews
    message += `🔖 *Oxirgi sharhlar:*\n\n`;
    
    reviews.slice(0, 5).forEach((review, i) => {
      const stars = '⭐'.repeat(review.rating);
      message += `${i + 1}. ${stars} (${review.rating}/5)\n`;
      if (review.comment) {
        message += `   💬 "${review.comment}"\n`;
      }
      message += `   📦 ${review.order.orderNumber}\n\n`;
    });

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    logger.error('Error showing ratings:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Show driver statistics
 */
const showStats = async (bot, chatId, driverId) => {
  try {
    const response = await axios.get(`${API_URL}/drivers/${driverId}/stats`);
    const stats = response.data.data;

    let message = '📊 *Statistika*\n\n';
    
    // Orders
    message += `📦 *Buyurtmalar:*\n`;
    message += `✅ Yetkazildi: ${stats.completedOrders || 0}\n`;
    message += `❌ Bekor qilindi: ${stats.cancelledOrders || 0}\n`;
    message += `📈 Bajarilish: ${stats.completionRate || 0}%\n\n`;
    
    // Ratings
    message += `⭐ *Reyting:*\n`;
    message += `📊 O'rtacha: ${stats.averageRating?.toFixed(1) || 'N/A'}/5\n`;
    message += `💬 Sharhlar: ${stats.totalReviews || 0}\n\n`;
    
    // Earnings
    message += `💰 *Daromad:*\n`;
    message += `💵 Jami: ${stats.totalEarnings || 0} so'm\n`;
    message += `📈 O'rtacha: ${stats.averageEarningPerOrder || 0} so'm\n\n`;
    
    // Performance
    message += `⏱️ *Ishlash:*\n`;
    message += `🕐 O'rtacha yetkazish vaqti: ${stats.averageDeliveryTime || 0} daqiqa\n`;
    message += `📍 O'rtacha masofa: ${stats.averageDistance || 0} km`;

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    logger.error('Error showing stats:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Update vehicle information
 */
const updateVehicleInfo = async (bot, chatId, driverId, vehicleInfo) => {
  try {
    await axios.put(`${API_URL}/drivers/${driverId}/vehicle`, vehicleInfo);

    await bot.sendMessage(chatId, '✅ Transport ma\'lumotlari yangilandi!');
    logger.info(`Driver ${driverId} vehicle info updated`);
  } catch (error) {
    logger.error('Error updating vehicle info:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Show settings menu
 */
const showSettings = async (bot, chatId) => {
  try {
    await bot.sendMessage(
      chatId,
      MESSAGES.uz.settingsMenu,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🇺🇿 O\'zbekcha', callback_data: 'profile:lang:uz' },
              { text: '🇷🇺 Русский', callback_data: 'profile:lang:ru' }
            ],
            [
              { text: '📱 Telefon o\'zgartirish', callback_data: 'profile:change_phone' }
            ],
            [
              { text: '🚗 Transport o\'zgartirish', callback_data: 'profile:change_vehicle' }
            ],
            [
              { text: '❓ Yordam', callback_data: 'profile:help' }
            ]
          ]
        }
      }
    );
  } catch (error) {
    logger.error('Error showing settings:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Handle profile callback queries
 */
const handleProfileCallback = async (bot, callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  const telegramId = callbackQuery.from.id.toString();

  try {
    // Get driver
    const response = await axios.get(`${API_URL}/drivers/telegram/${telegramId}`);
    const driver = response.data.data.driver;

    const parts = data.split(':');
    const action = parts[1];

    if (action === 'edit') {
      await showSettings(bot, chatId);
    } else if (action === 'ratings') {
      await showRatings(bot, chatId, driver._id);
    } else if (action === 'stats') {
      await showStats(bot, chatId, driver._id);
    } else if (action === 'lang') {
      const language = parts[2];
      await updateLanguage(bot, chatId, driver._id, language);
    } else if (action === 'change_phone') {
      await requestPhoneChange(bot, chatId);
    } else if (action === 'change_vehicle') {
      await requestVehicleChange(bot, chatId);
    } else if (action === 'help') {
      await showHelp(bot, chatId);
    }

    await bot.answerCallbackQuery(callbackQuery.id);
  } catch (error) {
    logger.error('Error handling profile callback:', error);
    await bot.answerCallbackQuery(callbackQuery.id, { text: MESSAGES.uz.error });
  }
};

/**
 * Handle status callback queries
 */
const handleStatusCallback = async (bot, callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  const telegramId = callbackQuery.from.id.toString();

  try {
    // Get driver
    const response = await axios.get(`${API_URL}/drivers/telegram/${telegramId}`);
    const driver = response.data.data.driver;

    const parts = data.split(':');
    const action = parts[1];

    if (action === 'toggle') {
      const newStatus = parts[2] === 'true';
      await toggleOnlineStatus(bot, chatId, driver._id, newStatus);
    }

    await bot.answerCallbackQuery(callbackQuery.id);
  } catch (error) {
    logger.error('Error handling status callback:', error);
    await bot.answerCallbackQuery(callbackQuery.id, { text: MESSAGES.uz.error });
  }
};

/**
 * Update language preference
 */
const updateLanguage = async (bot, chatId, driverId, language) => {
  try {
    await axios.put(`${API_URL}/drivers/${driverId}/language`, { language });
    
    await bot.sendMessage(chatId, MESSAGES[language].languageChanged);
    logger.info(`Driver ${driverId} language changed to ${language}`);
  } catch (error) {
    logger.error('Error updating language:', error);
  }
};

/**
 * Request phone change
 */
const requestPhoneChange = async (bot, chatId) => {
  try {
    await bot.sendMessage(
      chatId,
      '📱 Yangi telefon raqamingizni yuboring:',
      {
        reply_markup: {
          keyboard: [
            [{ text: '📱 Telefon raqamni yuborish', request_contact: true }]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      }
    );
  } catch (error) {
    logger.error('Error requesting phone change:', error);
  }
};

/**
 * Request vehicle change
 */
const requestVehicleChange = async (bot, chatId) => {
  try {
    await bot.sendMessage(
      chatId,
      '🚗 Transport turini tanlang:',
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🚗 Avtomobil', callback_data: 'vehicle:car' },
              { text: '🏍️ Mototsikl', callback_data: 'vehicle:motorcycle' }
            ],
            [
              { text: '🚴 Velosiped', callback_data: 'vehicle:bicycle' }
            ]
          ]
        }
      }
    );
  } catch (error) {
    logger.error('Error requesting vehicle change:', error);
  }
};

/**
 * Show help information
 */
const showHelp = async (bot, chatId) => {
  try {
    let message = '❓ *Yordam*\n\n';
    message += '📦 *Buyurtmalarni qabul qilish:*\n';
    message += '1. Online rejimga o\'ting\n';
    message += '2. Yangi buyurtmalarni ko\'ring\n';
    message += '3. Buyurtmani qabul qiling\n';
    message += '4. Restoranga boring va buyurtmani oling\n';
    message += '5. Mijozga yetkazib bering\n\n';
    
    message += '📍 *Joylashuvni ulashish:*\n';
    message += 'Online rejimda joylashuvingiz avtomatik yangilanadi\n\n';
    
    message += '💰 *Daromad:*\n';
    message += 'Har bir yetkazilgan buyurtma uchun daromad olasiz\n\n';
    
    message += '📞 *Muammolar:*\n';
    message += 'Savol yoki muammo bo\'lsa admin bilan bog\'laning\n';
    message += 'Telefon: +998 XX XXX XX XX';

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    logger.error('Error showing help:', error);
  }
};

module.exports = {
  showProfile,
  toggleOnlineStatus,
  showRatings,
  showStats,
  updateVehicleInfo,
  showSettings,
  handleProfileCallback,
  handleStatusCallback
};
