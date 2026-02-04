/**
 * Get main menu keyboard
 */
const getMainMenuKeyboard = (isOnline, language = 'uz') => {
  const statusButton = isOnline 
    ? { text: language === 'uz' ? '⏸️ Offline' : '⏸️ Оффлайн' }
    : { text: language === 'uz' ? '🔄 Online' : '🔄 Онлайн' };

  const keyboards = {
    uz: {
      keyboard: [
        [{ text: '📦 Faol buyurtmalar' }, { text: '📋 Tarix' }],
        [{ text: '💰 Daromad' }, { text: '💰 Mening hisobim' }],
        [statusButton, { text: '👤 Profil' }],
        [{ text: '⚙️ Sozlamalar' }]
      ],
      resize_keyboard: true
    },
    ru: {
      keyboard: [
        [{ text: '📦 Активные заказы' }, { text: '📋 История' }],
        [{ text: '💰 Доход' }, { text: '💰 Мой счет' }],
        [statusButton, { text: '👤 Профиль' }],
        [{ text: '⚙️ Настройки' }]
      ],
      resize_keyboard: true
    }
  };

  return keyboards[language] || keyboards.uz;
};

/**
 * Get vehicle type selection keyboard
 */
const getVehicleTypeKeyboard = (language = 'uz') => {
  const keyboards = {
    uz: {
      inline_keyboard: [
        [
          { text: '🚗 Avtomobil', callback_data: 'vehicle:car' },
          { text: '🏍️ Mototsikl', callback_data: 'vehicle:motorcycle' }
        ],
        [
          { text: '🚴 Velosiped', callback_data: 'vehicle:bicycle' }
        ]
      ]
    },
    ru: {
      inline_keyboard: [
        [
          { text: '🚗 Автомобиль', callback_data: 'vehicle:car' },
          { text: '🏍️ Мотоцикл', callback_data: 'vehicle:motorcycle' }
        ],
        [
          { text: '🚴 Велосипед', callback_data: 'vehicle:bicycle' }
        ]
      ]
    }
  };

  return keyboards[language] || keyboards.uz;
};

module.exports = {
  getMainMenuKeyboard,
  getVehicleTypeKeyboard
};
