const axios = require('axios');
const { getMainMenuKeyboard } = require('../keyboards/mainMenu');
const { MESSAGES } = require('../utils/messages');
const logger = require('../../../utils/logger');
const store = require('../../../utils/botStateStore');

const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://parkent-express.duckdns.org/web';

const handleStart = (bot) => async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id.toString();
  const firstName = msg.from.first_name || '';
  const lastName = msg.from.last_name || '';
  const username = msg.from.username || '';

  try {
    const response = await axios.post(`${API_URL}/users/register`, {
      telegramId, firstName, lastName, username, phone: ''
    });

    const user = response.data.data.user;
    const isNewUser = response.data.data.isNewUser;

    // Web ilova tugmasi — har doim ko'rsatiladi
    const webAppKeyboard = {
      inline_keyboard: [[
        {
          text: '🌐 Ilovani ochish',
          web_app: { url: WEB_APP_URL }
        }
      ]]
    };

    if (isNewUser) {
      await bot.sendMessage(chatId,
        `👋 Salom, ${firstName}!\n\n🍕 *Parkent Express*ga xush kelibsiz!\n\nIlovamizdan foydalanish uchun quyidagi tugmani bosing 👇`,
        { parse_mode: 'Markdown', reply_markup: webAppKeyboard }
      );

      // Telefon so'rash
      await bot.sendMessage(chatId, MESSAGES.uz.requestPhone, {
        reply_markup: {
          keyboard: [[{ text: '📱 Telefon raqamni yuborish', request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
    } else {
      await bot.sendMessage(chatId,
        `👋 Qaytganingizdan xursandmiz, ${firstName}!\n\nIlovamizdan foydalanish uchun quyidagi tugmani bosing 👇`,
        { parse_mode: 'Markdown', reply_markup: webAppKeyboard }
      );

      // Asosiy menyu ham ko'rsatiladi
      await bot.sendMessage(chatId, '🍽️ Yoki pastdagi menyudan foydalaning:', {
        reply_markup: getMainMenuKeyboard('uz')
      });
    }

    logger.info(`Customer ${telegramId} ${isNewUser ? 'registered' : 'logged in'}`);
  } catch (error) {
    logger.error('Error in start handler:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

const handleContact = (bot) => async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id.toString();
  const phone = msg.contact.phone_number;

  try {
    await axios.put(`${API_URL}/users/telegram/${telegramId}`, { phone });
    await bot.sendMessage(chatId, MESSAGES.uz.phoneReceived, {
      reply_markup: getMainMenuKeyboard('uz')
    });
    logger.info(`Customer ${telegramId} phone updated: ${phone}`);
  } catch (error) {
    logger.error('Error updating phone:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

module.exports = { handleStart, handleContact };
