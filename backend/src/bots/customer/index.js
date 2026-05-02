const TelegramBot = require('node-telegram-bot-api');
const logger = require('../../utils/logger');

const WEB_APP_URL = process.env.WEB_APP_URL || 'https://parkent-express.duckdns.org/web';

let customerBot;

const initCustomerBot = () => {
  const token = process.env.CUSTOMER_BOT_TOKEN;
  if (!token) {
    logger.warn('⚠️ Customer Bot token topilmadi.');
    return null;
  }

  try {
    customerBot = new TelegramBot(token, { polling: true });

    // Asosiy keyboard
    const mainKeyboard = {
      keyboard: [
        [{ text: '🛵 Buyurtma berish', web_app: { url: WEB_APP_URL } }],
        [{ text: '📲 Ilovani telefonga o\'rnatish' }],
      ],
      resize_keyboard: true,
    };

    // /start
    customerBot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const firstName = msg.from.first_name || 'Mehmon';

      await customerBot.sendMessage(chatId,
        `👋 Salom, *${firstName}*!\n\n` +
        `🍕 *Parkent Express* — tez va qulay ovqat yetkazib berish.\n\n` +
        `Buyurtma berish uchun tugmani bosing 👇`,
        {
          parse_mode: 'Markdown',
          reply_markup: mainKeyboard
        }
      );
    });

    // Ilovani o'rnatish tugmasi
    customerBot.on('message', async (msg) => {
      if (msg.text?.startsWith('/start')) return;
      const chatId = msg.chat.id;

      if (msg.text === '📲 Ilovani telefonga o\'rnatish') {
        await customerBot.sendMessage(chatId,
          `📲 *Parkent Express ilovasini o'rnatish*\n\n` +
          `Telegram ichida ilovani o'rnatib bo'lmaydi.\n\n` +
          `*Qanday o'rnatiladi?*\n\n` +
          `*Android uchun:*\n` +
          `1. Quyidagi havolani Chrome da oching\n` +
          `2. Yuqori o'ngdagi ⋮ menyusini bosing\n` +
          `3. "Bosh ekranga qo'shish" ni tanlang ✅\n\n` +
          `*iPhone uchun:*\n` +
          `1. Havolani Safari da oching\n` +
          `2. Pastdagi ↑ tugmasini bosing\n` +
          `3. "Bosh ekranga qo'shish" ni tanlang ✅`,
          {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[
                { text: '🌐 Havolani ochish', url: WEB_APP_URL }
              ]]
            }
          }
        );
        return;
      }

      // Boshqa xabarlar
      if (!msg.text?.startsWith('/') && !msg.web_app_data) {
        await customerBot.sendMessage(chatId,
          '🛵 Buyurtma berish uchun quyidagi tugmani bosing:',
          { reply_markup: mainKeyboard }
        );
      }
    });

    customerBot.on('polling_error', (error) => {
      logger.error('Customer Bot polling error:', error.message);
    });

    logger.info('✅ Customer Bot initialized (web-only mode)');
    return customerBot;
  } catch (error) {
    logger.error('❌ Customer Bot initialization failed:', error);
    return null;
  }
};

const getCustomerBot = () => customerBot || null;
module.exports = { initCustomerBot, getCustomerBot, customerBot };
