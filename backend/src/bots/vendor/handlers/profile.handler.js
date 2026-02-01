const axios = require('axios');
const { MESSAGES } = require('../utils/messages');
const { getMainMenuKeyboard } = require('../keyboards/mainMenu');
const logger = require('../../../utils/logger');

const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

/**
 * Show vendor profile
 */
const showProfile = async (bot, chatId, vendorId) => {
  try {
    const response = await axios.get(`${API_URL}/vendors/${vendorId}`);
    const vendor = response.data.data.vendor;

    const message = MESSAGES.uz.profileInfo(vendor);

    const keyboard = {
      inline_keyboard: [
        [
          { 
            text: vendor.isOpen ? '🔴 Yopish' : '🟢 Ochish', 
            callback_data: `profile:toggle:${vendorId}` 
          }
        ],
        [
          { text: '✏️ Profilni tahrirlash', callback_data: `profile:edit:${vendorId}` }
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
 * Handle profile callback
 */
const handleProfileCallback = async (bot, callbackQuery) => {
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
    const vendorId = parts[2];

    if (action === 'toggle') {
      await toggleVendorStatus(bot, chatId, messageId, vendorId);
    } else if (action === 'edit') {
      // TODO: Implement profile edit
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: 'Bu funksiya hozircha ishlab chiqilmoqda',
        show_alert: true
      });
    }

    await bot.answerCallbackQuery(callbackQuery.id);
  } catch (error) {
    logger.error('Error handling profile callback:', error);
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: MESSAGES.uz.error,
      show_alert: true
    });
  }
};

/**
 * Toggle vendor open/close status
 */
const toggleVendorStatus = async (bot, chatId, messageId, vendorId) => {
  try {
    const response = await axios.put(`${API_URL}/vendors/${vendorId}/toggle`);
    const vendor = response.data.data.vendor;

    const message = vendor.isOpen ? MESSAGES.uz.vendorOpened : MESSAGES.uz.vendorClosed;

    await bot.editMessageText(
      message,
      {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown'
      }
    );

    // Show updated profile after a delay
    setTimeout(async () => {
      await showProfile(bot, chatId, vendorId);
    }, 1000);

    logger.info(`Vendor ${vendorId} status toggled: ${vendor.isOpen}`);
  } catch (error) {
    logger.error('Error toggling vendor status:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

module.exports = {
  showProfile,
  handleProfileCallback
};
