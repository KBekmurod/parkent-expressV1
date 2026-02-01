/**
 * Get order action keyboard based on order status
 */
const getOrderActionKeyboard = (orderId, status, language = 'uz') => {
  const keyboards = {
    uz: {
      ready: {
        inline_keyboard: [
          [
            { text: '✅ Qabul qilish', callback_data: `order:accept:${orderId}` },
            { text: '❌ Rad etish', callback_data: `order:reject:${orderId}` }
          ]
        ]
      },
      picked_up: {
        inline_keyboard: [
          [{ text: '📍 Joylashuvni yuborish', callback_data: `order:location:${orderId}` }],
          [{ text: '🚚 Yo\'lda', callback_data: `order:on_the_way:${orderId}` }]
        ]
      },
      on_the_way: {
        inline_keyboard: [
          [{ text: '📍 Joylashuvni yuborish', callback_data: `order:location:${orderId}` }],
          [{ text: '✅ Yetkazildi', callback_data: `order:delivered:${orderId}` }]
        ]
      },
      default: {
        inline_keyboard: [
          [{ text: '🔄 Yangilash', callback_data: `order:refresh:${orderId}` }]
        ]
      }
    },
    ru: {
      ready: {
        inline_keyboard: [
          [
            { text: '✅ Принять', callback_data: `order:accept:${orderId}` },
            { text: '❌ Отклонить', callback_data: `order:reject:${orderId}` }
          ]
        ]
      },
      picked_up: {
        inline_keyboard: [
          [{ text: '📍 Отправить местоположение', callback_data: `order:location:${orderId}` }],
          [{ text: '🚚 В пути', callback_data: `order:on_the_way:${orderId}` }]
        ]
      },
      on_the_way: {
        inline_keyboard: [
          [{ text: '📍 Отправить местоположение', callback_data: `order:location:${orderId}` }],
          [{ text: '✅ Доставлено', callback_data: `order:delivered:${orderId}` }]
        ]
      },
      default: {
        inline_keyboard: [
          [{ text: '🔄 Обновить', callback_data: `order:refresh:${orderId}` }]
        ]
      }
    }
  };

  const lang = keyboards[language] || keyboards.uz;
  return lang[status] || lang.default;
};

/**
 * Get reject reason keyboard
 */
const getRejectReasonKeyboard = (orderId, language = 'uz') => {
  const keyboards = {
    uz: {
      inline_keyboard: [
        [{ text: '🚗 Transport yo\'q', callback_data: `order:reject_reason:${orderId}:no_vehicle` }],
        [{ text: '📍 Juda uzoq', callback_data: `order:reject_reason:${orderId}:too_far` }],
        [{ text: '⏰ Band', callback_data: `order:reject_reason:${orderId}:busy` }],
        [{ text: '✏️ Boshqa sabab', callback_data: `order:reject_reason:${orderId}:custom` }],
        [{ text: '⬅️ Orqaga', callback_data: `order:back:${orderId}` }]
      ]
    },
    ru: {
      inline_keyboard: [
        [{ text: '🚗 Нет транспорта', callback_data: `order:reject_reason:${orderId}:no_vehicle` }],
        [{ text: '📍 Слишком далеко', callback_data: `order:reject_reason:${orderId}:too_far` }],
        [{ text: '⏰ Занят', callback_data: `order:reject_reason:${orderId}:busy` }],
        [{ text: '✏️ Другая причина', callback_data: `order:reject_reason:${orderId}:custom` }],
        [{ text: '⬅️ Назад', callback_data: `order:back:${orderId}` }]
      ]
    }
  };

  return keyboards[language] || keyboards.uz;
};

module.exports = {
  getOrderActionKeyboard,
  getRejectReasonKeyboard
};
