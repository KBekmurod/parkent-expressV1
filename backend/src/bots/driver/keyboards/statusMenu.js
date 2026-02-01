/**
 * Get online/offline status keyboard
 */
const getStatusKeyboard = (isOnline, language = 'uz') => {
  const keyboards = {
    uz: {
      inline_keyboard: [
        [
          { 
            text: isOnline ? '⏸️ Offline rejimga o\'tish' : '🔄 Online rejimga o\'tish', 
            callback_data: `status:toggle:${!isOnline}` 
          }
        ]
      ]
    },
    ru: {
      inline_keyboard: [
        [
          { 
            text: isOnline ? '⏸️ Перейти в оффлайн' : '🔄 Перейти в онлайн', 
            callback_data: `status:toggle:${!isOnline}` 
          }
        ]
      ]
    }
  };

  return keyboards[language] || keyboards.uz;
};

module.exports = {
  getStatusKeyboard
};
