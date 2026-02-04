const CARD_PAYMENT_MESSAGES = {
  uz: {
    showCard: `💳 *KARTA TO'LOV*

🔢 *Sizning karta raqamingiz:*
\`{cardNumber}\`

💰 *To'lov summasi:* {amount} so'm

📱 *Mijozga ko'rsatmalar:*
1. Mijozga karta raqamingizni ko'rsating
2. Mijoz Click/Payme orqali o'tkazadi
3. Mijoz chekni ko'rsatadi
4. Siz chekni rasmga olib, botga yuborasiz

⚠️ *Muhim:* Chek rasmini aniq va o'qilishi mumkin bo'lishi kerak!`,

    requestReceipt: `📸 *Chek rasmini yuboring*

To'lov chekining rasmini (screenshot) yuboring.

⚠️ Chek aniq ko'rinishi kerak:
✅ Summa
✅ Vaqt
✅ Qabul qiluvchi karta raqami`,

    receiptReceived: `✅ *Chek qabul qilindi!*

💰 Summa: {amount} so'm
📦 Order: {orderNumber}

Chek admin tomonidan tekshiriladi.`,

    uploadError: '❌ Chek yuklanmadi. Iltimos, qaytadan yuboring.\n\nFaqat rasm formatida (jpg, png).',

    noCardNumber: '⚠️ Sizning karta raqamingiz profilga kiritilmagan.\n\nAdmin bilan bog\'laning.'
  },

  ru: {
    showCard: `💳 *ОПЛАТА КАРТОЙ*

🔢 *Номер вашей карты:*
\`{cardNumber}\`

💰 *Сумма оплаты:* {amount} сум

📱 *Инструкции для клиента:*
1. Покажите клиенту номер карты
2. Клиент переводит через Click/Payme
3. Клиент показывает чек
4. Вы фотографируете и отправляете в бот

⚠️ *Важно:* Фото чека должно быть четким и читаемым!`,

    requestReceipt: `📸 *Отправьте фото чека*

Отправьте фото (скриншот) чека об оплате.

⚠️ Чек должен быть четким:
✅ Сумма
✅ Время
✅ Номер карты получателя`,

    receiptReceived: `✅ *Чек принят!*

💰 Сумма: {amount} сум
📦 Заказ: {orderNumber}

Чек будет проверен администратором.`,

    uploadError: '❌ Чек не загружен. Пожалуйста, отправьте еще раз.\n\nТолько изображения (jpg, png).',

    noCardNumber: '⚠️ Номер вашей карты не указан в профиле.\n\nСвяжитесь с администратором.'
  }
};

module.exports = { CARD_PAYMENT_MESSAGES };
