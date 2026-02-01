/**
 * Get main menu keyboard
 */
const getMainMenuKeyboard = (language = 'uz') => {
  const keyboards = {
    uz: {
      keyboard: [
        [{ text: '📦 Faol buyurtmalar' }, { text: '📋 Tarix' }],
        [{ text: '🍽️ Menyu' }, { text: '📊 Statistika' }],
        [{ text: '👤 Profil' }, { text: '⚙️ Sozlamalar' }]
      ],
      resize_keyboard: true
    },
    ru: {
      keyboard: [
        [{ text: '📦 Активные заказы' }, { text: '📋 История' }],
        [{ text: '🍽️ Меню' }, { text: '📊 Статистика' }],
        [{ text: '👤 Профиль' }, { text: '⚙️ Настройки' }]
      ],
      resize_keyboard: true
    }
  };

  return keyboards[language] || keyboards.uz;
};

/**
 * Get category selection keyboard
 */
const getCategoryKeyboard = (language = 'uz') => {
  const categories = {
    uz: [
      '🍕 Pitsa',
      '🍔 Fast food',
      '🍜 Milliy taomlar',
      '🍰 Shirinliklar',
      '☕ Kafe',
      '🥗 Sog'lom ovqat'
    ],
    ru: [
      '🍕 Пицца',
      '🍔 Фаст-фуд',
      '🍜 Национальные блюда',
      '🍰 Десерты',
      '☕ Кафе',
      '🥗 Здоровая пища'
    ]
  };

  const keyboard = [];
  const cats = categories[language] || categories.uz;
  
  for (let i = 0; i < cats.length; i += 2) {
    const row = [{ text: cats[i] }];
    if (i + 1 < cats.length) {
      row.push({ text: cats[i + 1] });
    }
    keyboard.push(row);
  }

  return {
    keyboard,
    resize_keyboard: true,
    one_time_keyboard: true
  };
};

module.exports = {
  getMainMenuKeyboard,
  getCategoryKeyboard
};
