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

    // Faqat /start komandasi — web ilova tugmasi
    customerBot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const firstName = msg.from.first_name || 'Mehmon';

      const welcomeText =
        `👋 Salom, ${firstName}!\n\n` +
        `🍕 *Parkent Express* — tez va qulay ovqat yetkazib berish xizmati.\n\n` +
        `Buyurtma berish uchun ilovamizni oching 👇`;

      await customerBot.sendMessage(chatId, welcomeText, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            {
              text: '🚀 Ilovani ochish',
              web_app: { url: WEB_APP_URL }
            }
          ]]
        }
      });
    });

    // Boshqa barcha xabarlar uchun — faqat ilova tugmasini ko'rsatish
    customerBot.on('message', async (msg) => {
      if (msg.text?.startsWith('/start')) return; // Already handled

      const chatId = msg.chat.id;

      // /start bo'lmagan barcha xabarlar uchun ilova tugmasi
      if (!msg.text?.startsWith('/')) {
        await customerBot.sendMessage(chatId,
          '📱 Buyurtma berish uchun ilovamizdan foydalaning:',
          {
            reply_markup: {
              inline_keyboard: [[
                { text: '🚀 Ilovani ochish', web_app: { url: WEB_APP_URL } }
              ]]
            }
          }
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
