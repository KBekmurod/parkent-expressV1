const WEB_APP_URL = process.env.WEB_APP_URL || 'https://parkent-express.duckdns.org/web';

const getMainMenuKeyboard = (language = 'uz') => {
  const keyboards = {
    uz: {
      keyboard: [
        [{ text: '🍽️ Restoran tanlash' }, { text: '📦 Mening buyurtmalarim' }],
        [{ text: '👤 Profil' }, { text: '⚙️ Sozlamalar' }]
      ],
      resize_keyboard: true
    },
    ru: {
      keyboard: [
        [{ text: '🍽️ Выбрать ресторан' }, { text: '📦 Мои заказы' }],
        [{ text: '👤 Профиль' }, { text: '⚙️ Настройки' }]
      ],
      resize_keyboard: true
    }
  };
  return keyboards[language] || keyboards.uz;
};

// Web App inline tugmasi (alohida chiqarilganda ishlatiladi)
const getWebAppButton = () => ({
  inline_keyboard: [[
    { text: '🌐 Ilovani ochish', web_app: { url: WEB_APP_URL } }
  ]]
});

module.exports = { getMainMenuKeyboard, getWebAppButton };
