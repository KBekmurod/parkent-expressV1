/**
 * Get order action keyboard
 */
const getOrderActionKeyboard = (orderId, language = 'uz') => {
  const keyboards = {
    uz: {
      inline_keyboard: [
        [
          { text: '✅ Qabul qilish', callback_data: `order:accept:${orderId}` },
          { text: '❌ Rad etish', callback_data: `order:reject:${orderId}` }
        ],
        [
          { text: '👨‍🍳 Tayyorlash', callback_data: `order:prepare:${orderId}` },
          { text: '✅ Tayyor', callback_data: `order:ready:${orderId}` }
        ],
        [
          { text: '🔍 Tafsilotlar', callback_data: `order:details:${orderId}` }
        ]
      ]
    },
    ru: {
      inline_keyboard: [
        [
          { text: '✅ Принять', callback_data: `order:accept:${orderId}` },
          { text: '❌ Отклонить', callback_data: `order:reject:${orderId}` }
        ],
        [
          { text: '👨‍🍳 Готовить', callback_data: `order:prepare:${orderId}` },
          { text: '✅ Готов', callback_data: `order:ready:${orderId}` }
        ],
        [
          { text: '🔍 Подробности', callback_data: `order:details:${orderId}` }
        ]
      ]
    }
  };

  return keyboards[language] || keyboards.uz;
};

/**
 * Get order status action keyboard (based on current status)
 */
const getOrderStatusActionKeyboard = (orderId, currentStatus, language = 'uz') => {
  const keyboards = {
    uz: {
      pending: {
        inline_keyboard: [
          [
            { text: '✅ Qabul qilish', callback_data: `order:accept:${orderId}` },
            { text: '❌ Rad etish', callback_data: `order:reject:${orderId}` }
          ]
        ]
      },
      accepted: {
        inline_keyboard: [
          [
            { text: '👨‍🍳 Tayyorlash boshlash', callback_data: `order:prepare:${orderId}` }
          ]
        ]
      },
      preparing: {
        inline_keyboard: [
          [
            { text: '✅ Tayyor', callback_data: `order:ready:${orderId}` }
          ]
        ]
      },
      ready: {
        inline_keyboard: [
          [
            { text: '🔙 Orqaga', callback_data: 'order:list' }
          ]
        ]
      }
    },
    ru: {
      pending: {
        inline_keyboard: [
          [
            { text: '✅ Принять', callback_data: `order:accept:${orderId}` },
            { text: '❌ Отклонить', callback_data: `order:reject:${orderId}` }
          ]
        ]
      },
      accepted: {
        inline_keyboard: [
          [
            { text: '👨‍🍳 Начать готовить', callback_data: `order:prepare:${orderId}` }
          ]
        ]
      },
      preparing: {
        inline_keyboard: [
          [
            { text: '✅ Готов', callback_data: `order:ready:${orderId}` }
          ]
        ]
      },
      ready: {
        inline_keyboard: [
          [
            { text: '🔙 Назад', callback_data: 'order:list' }
          ]
        ]
      }
    }
  };

  const statusKeyboard = keyboards[language]?.[currentStatus] || keyboards.uz[currentStatus];
  
  return statusKeyboard || {
    inline_keyboard: [[{ text: language === 'uz' ? '🔙 Orqaga' : '🔙 Назад', callback_data: 'order:list' }]]
  };
};

/**
 * Get reject reason keyboard
 */
const getRejectReasonKeyboard = (orderId, language = 'uz') => {
  const keyboards = {
    uz: {
      inline_keyboard: [
        [{ text: '🚫 Mahsulot tugagan', callback_data: `order:reject_reason:${orderId}:out_of_stock` }],
        [{ text: '⏰ Band', callback_data: `order:reject_reason:${orderId}:busy` }],
        [{ text: '🔧 Texnik muammo', callback_data: `order:reject_reason:${orderId}:technical` }],
        [{ text: '✏️ Boshqa sabab', callback_data: `order:reject_reason:${orderId}:custom` }],
        [{ text: '🔙 Bekor qilish', callback_data: `order:details:${orderId}` }]
      ]
    },
    ru: {
      inline_keyboard: [
        [{ text: '🚫 Товар закончился', callback_data: `order:reject_reason:${orderId}:out_of_stock` }],
        [{ text: '⏰ Заняты', callback_data: `order:reject_reason:${orderId}:busy` }],
        [{ text: '🔧 Техническая проблема', callback_data: `order:reject_reason:${orderId}:technical` }],
        [{ text: '✏️ Другая причина', callback_data: `order:reject_reason:${orderId}:custom` }],
        [{ text: '🔙 Отмена', callback_data: `order:details:${orderId}` }]
      ]
    }
  };

  return keyboards[language] || keyboards.uz;
};

/**
 * Get pagination keyboard for orders
 */
const getOrderPaginationKeyboard = (currentPage, totalPages, type = 'active', language = 'uz') => {
  const keyboard = [];
  const row = [];

  if (currentPage > 1) {
    row.push({ 
      text: language === 'uz' ? '◀️ Oldingi' : '◀️ Назад', 
      callback_data: `order:${type}:page:${currentPage - 1}` 
    });
  }

  if (currentPage < totalPages) {
    row.push({ 
      text: language === 'uz' ? 'Keyingi ▶️' : 'Вперед ▶️', 
      callback_data: `order:${type}:page:${currentPage + 1}` 
    });
  }

  if (row.length > 0) {
    keyboard.push(row);
  }

  keyboard.push([{ 
    text: language === 'uz' ? '🏠 Bosh menyu' : '🏠 Главное меню', 
    callback_data: 'menu:main' 
  }]);

  return { inline_keyboard: keyboard };
};

module.exports = {
  getOrderActionKeyboard,
  getOrderStatusActionKeyboard,
  getRejectReasonKeyboard,
  getOrderPaginationKeyboard
};
