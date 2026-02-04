/**
 * Payment method selection keyboard
 */
const getPaymentMethodKeyboard = (language = 'uz') => {
  const keyboards = {
    uz: {
      inline_keyboard: [
        [
          { text: '💵 Naqd to\'lov (yetkazib berishda)', callback_data: 'payment:cash' }
        ],
        [
          { text: '💳 Karta to\'lov (kurerga o\'tkazma)', callback_data: 'payment:card' }
        ]
      ]
    },
    ru: {
      inline_keyboard: [
        [
          { text: '💵 Наличные (при доставке)', callback_data: 'payment:cash' }
        ],
        [
          { text: '💳 Карта (переводом курьеру)', callback_data: 'payment:card' }
        ]
      ]
    }
  };

  return keyboards[language] || keyboards.uz;
};

module.exports = {
  getPaymentMethodKeyboard
};
