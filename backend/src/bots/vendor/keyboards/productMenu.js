/**
 * Get product menu keyboard
 */
const getProductMenuKeyboard = (vendorId, language = 'uz') => {
  const keyboards = {
    uz: {
      inline_keyboard: [
        [{ text: "➕ Mahsulot qo'shish", callback_data: `product:add:${vendorId}` }],
        [{ text: "📋 Mahsulotlar ro'yxati", callback_data: `product:list:${vendorId}` }],
        [{ text: '🔙 Orqaga', callback_data: 'menu:main' }]
      ]
    },
    ru: {
      inline_keyboard: [
        [{ text: '➕ Добавить товар', callback_data: `product:add:${vendorId}` }],
        [{ text: '📋 Список товаров', callback_data: `product:list:${vendorId}` }],
        [{ text: '🔙 Назад', callback_data: 'menu:main' }]
      ]
    }
  };

  return keyboards[language] || keyboards.uz;
};

/**
 * Get product action keyboard
 */
const getProductActionKeyboard = (productId, isAvailable, language = 'uz') => {
  const keyboards = {
    uz: {
      inline_keyboard: [
        [
          { text: isAvailable ? '❌ Nofaol qilish' : '✅ Faol qilish', callback_data: `product:toggle:${productId}` }
        ],
        [
          { text: "🗑️ O'chirish", callback_data: `product:delete:${productId}` },
          { text: '🔙 Orqaga', callback_data: 'product:list' }
        ]
      ]
    },
    ru: {
      inline_keyboard: [
        [
          { text: '✏️ Редактировать', callback_data: `product:edit:${productId}` },
          { 
            text: isAvailable ? '❌ Деактивировать' : '✅ Активировать', 
            callback_data: `product:toggle:${productId}` 
          }
        ],
        [{ text: '🔙 Назад', callback_data: 'product:list' }]
      ]
    }
  };

  return keyboards[language] || keyboards.uz;
};

/**
 * Get product edit fields keyboard
 */
const getProductEditFieldsKeyboard = (productId, language = 'uz') => {
  const keyboards = {
    uz: {
      inline_keyboard: [
        [{ text: '📝 Nom', callback_data: `product:edit_field:${productId}:name` }],
        [{ text: '💰 Narx', callback_data: `product:edit_field:${productId}:price` }],
        [{ text: '📝 Ta\'rif', callback_data: `product:edit_field:${productId}:description` }],
        [{ text: '📸 Rasm', callback_data: `product:edit_field:${productId}:photo` }],
        [{ text: '⏱️ Tayyorlash vaqti', callback_data: `product:edit_field:${productId}:time` }],
        [{ text: '🔙 Bekor qilish', callback_data: `product:view:${productId}` }]
      ]
    },
    ru: {
      inline_keyboard: [
        [{ text: '📝 Название', callback_data: `product:edit_field:${productId}:name` }],
        [{ text: '💰 Цена', callback_data: `product:edit_field:${productId}:price` }],
        [{ text: '📝 Описание', callback_data: `product:edit_field:${productId}:description` }],
        [{ text: '📸 Фото', callback_data: `product:edit_field:${productId}:photo` }],
        [{ text: '⏱️ Время приготовления', callback_data: `product:edit_field:${productId}:time` }],
        [{ text: '🔙 Отмена', callback_data: `product:view:${productId}` }]
      ]
    }
  };

  return keyboards[language] || keyboards.uz;
};

/**
 * Get product list pagination keyboard
 */
const getProductPaginationKeyboard = (vendorId, currentPage, totalPages, language = 'uz') => {
  const keyboard = [];
  const row = [];

  if (currentPage > 1) {
    row.push({ 
      text: language === 'uz' ? '◀️ Oldingi' : '◀️ Назад', 
      callback_data: `product:list:${vendorId}:page:${currentPage - 1}` 
    });
  }

  if (currentPage < totalPages) {
    row.push({ 
      text: language === 'uz' ? 'Keyingi ▶️' : 'Вперед ▶️', 
      callback_data: `product:list:${vendorId}:page:${currentPage + 1}` 
    });
  }

  if (row.length > 0) {
    keyboard.push(row);
  }

  keyboard.push([{ 
    text: language === 'uz' ? "➕ Mahsulot qo'shish" : '➕ Добавить товар', 
    callback_data: `product:add:${vendorId}` 
  }]);
  
  keyboard.push([{ 
    text: language === 'uz' ? '🏠 Bosh menyu' : '🏠 Главное меню', 
    callback_data: 'menu:main' 
  }]);

  return { inline_keyboard: keyboard };
};

/**
 * Get skip keyboard
 */
const getSkipKeyboard = (language = 'uz') => {
  return {
    keyboard: [
      [{ text: language === 'uz' ? 'O\'tkazib yuborish' : 'Пропустить' }]
    ],
    resize_keyboard: true,
    one_time_keyboard: true
  };
};

module.exports = {
  getProductMenuKeyboard,
  getProductActionKeyboard,
  getProductEditFieldsKeyboard,
  getProductPaginationKeyboard,
  getSkipKeyboard
};
