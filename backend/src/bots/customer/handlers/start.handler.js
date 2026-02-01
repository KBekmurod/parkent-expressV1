const axios = require('axios');
const { getMainMenuKeyboard } = require('../keyboards/mainMenu');
const { MESSAGES } = require('../utils/messages');
const logger = require('../../../utils/logger');

const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

/**
 * Handle /start command
 */
const handleStart = (bot) => async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id.toString();
  const firstName = msg.from.first_name || '';
  const lastName = msg.from.last_name || '';
  const username = msg.from.username || '';

  try {
    // Register or get user
    const response = await axios.post(`${API_URL}/users/register`, {
      telegramId,
      firstName,
      lastName,
      username,
      phone: '' // Will be requested later
    });

    const user = response.data.data.user;
    const isNewUser = response.data.data.isNewUser;

    if (isNewUser) {
      // Welcome new user
      await bot.sendMessage(
        chatId,
        MESSAGES.uz.welcome(firstName),
        { parse_mode: 'Markdown' }
      );

      // Request phone number
      await bot.sendMessage(
        chatId,
        MESSAGES.uz.requestPhone,
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
    } else {
      // Welcome back existing user
      await bot.sendMessage(
        chatId,
        MESSAGES.uz.welcomeBack(firstName),
        {
          reply_markup: getMainMenuKeyboard('uz'),
          parse_mode: 'Markdown'
        }
      );
    }

    logger.info(`Customer ${telegramId} ${isNewUser ? 'registered' : 'logged in'}`);
  } catch (error) {
    logger.error('Error in start handler:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Handle phone number
 */
const handleContact = (bot) => async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id.toString();
  const phone = msg.contact.phone_number;

  try {
    // Update user phone
    await axios.put(`${API_URL}/users/telegram/${telegramId}`, {
      phone
    });

    await bot.sendMessage(
      chatId,
      MESSAGES.uz.phoneReceived,
      {
        reply_markup: getMainMenuKeyboard('uz')
      }
    );

    logger.info(`Customer ${telegramId} phone updated: ${phone}`);
  } catch (error) {
    logger.error('Error updating phone:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

module.exports = {
  handleStart,
  handleContact
};
