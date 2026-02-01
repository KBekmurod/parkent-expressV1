const axios = require('axios');
const { MESSAGES } = require('../utils/messages');
const logger = require('../../../utils/logger');

const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

/**
 * Show profile
 */
const showProfile = async (bot, chatId) => {
  try {
    const telegramId = chatId.toString();
    
    // Get user
    const response = await axios.get(`${API_URL}/users/telegram/${telegramId}`);
    const user = response.data.data.user;

    let message = '👤 *Profil:*\n\n';
    message += `📛 Ism: ${user.firstName} ${user.lastName || ''}\n`;
    message += `📱 Telefon: ${user.phone || 'Kiritilmagan'}\n`;
    message += `📦 Buyurtmalar soni: ${user.totalOrders}\n`;
    message += `📍 Manzillar: ${user.addresses?.length || 0} ta\n`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '📍 Manzillarni boshqarish', callback_data: 'profile:addresses' }
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
    logger.error('Error showing profile:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Show addresses
 */
const showAddresses = async (bot, chatId) => {
  try {
    const telegramId = chatId.toString();
    
    // Get user
    const response = await axios.get(`${API_URL}/users/telegram/${telegramId}`);
    const user = response.data.data.user;

    if (!user.addresses || user.addresses.length === 0) {
      return await bot.sendMessage(chatId, '📍 Sizda hali manzillar yo\'q');
    }

    let message = '📍 *Manzillaringiz:*\n\n';
    
    user.addresses.forEach((addr, index) => {
      message += `${index + 1}. ${addr.title}${addr.isDefault ? ' (Asosiy)' : ''}\n`;
      message += `   ${addr.address}\n\n`;
    });

    const keyboard = {
      inline_keyboard: [
        ...user.addresses.map((addr, index) => [{
          text: `🗑️ ${addr.title} ni o'chirish`,
          callback_data: `profile:delete_address:${index}`
        }]),
        [
          { text: '➕ Yangi manzil qo\'shish', callback_data: 'profile:add_address' }
        ],
        [
          { text: '🔙 Profilga qaytish', callback_data: 'profile:main' }
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
    logger.error('Error showing addresses:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Handle profile callback
 */
const handleProfileCallback = async (bot, callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data.split(':');
  const action = data[1];

  await bot.answerCallbackQuery(callbackQuery.id);

  if (action === 'main') {
    await showProfile(bot, chatId);
  } else if (action === 'addresses') {
    await showAddresses(bot, chatId);
  } else if (action === 'add_address') {
    await bot.sendMessage(
      chatId,
      MESSAGES.uz.requestLocation,
      {
        reply_markup: {
          keyboard: [
            [{ text: '📍 Manzilni yuborish', request_location: true }]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      }
    );
  } else if (action === 'delete_address') {
    const addressIndex = parseInt(data[2]);
    
    try {
      const telegramId = chatId.toString();
      const response = await axios.get(`${API_URL}/users/telegram/${telegramId}`);
      const user = response.data.data.user;
      
      await axios.delete(`${API_URL}/users/${user._id}/addresses/${addressIndex}`);
      
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: '✅ Manzil o\'chirildi',
        show_alert: true
      });
      
      await showAddresses(bot, chatId);
    } catch (error) {
      logger.error('Error deleting address:', error);
      await bot.sendMessage(chatId, MESSAGES.uz.error);
    }
  }
};

module.exports = {
  showProfile,
  showAddresses,
  handleProfileCallback
};
