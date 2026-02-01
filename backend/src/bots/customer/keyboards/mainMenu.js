/**
 * Get main menu keyboard
 */
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

module.exports = {
  getMainMenuKeyboard
};
