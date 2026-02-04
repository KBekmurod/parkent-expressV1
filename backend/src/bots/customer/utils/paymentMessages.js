const PAYMENT_MESSAGES = {
  uz: {
    selectMethod: '💳 *To\'lov usulini tanlang:*\n\nQaysi usulda to\'lov qilmoqchisiz?',
    
    cashSelected: '✅ *Naqd to\'lov tanlandi*\n\nKurer yetkazganda naqd pul to\'laysiz.',
    
    cardSelected: `✅ *Karta to\'lov tanlandi*

📱 Kurer yetkazganda, uning *karta raqamiga* Click yoki Payme orqali o'tkazma qiling.

🔢 Kurer sizga o'z karta raqamini ko'rsatadi.

💡 *Qanday qilish kerak:*
1. Click yoki Payme app ochish
2. Kurer karta raqamiga o'tkazma
3. Chekni ko'rsatish (screenshot)
4. Kurer tasdiqlab, taomni beradi

Davom etamizmi?`,
    
    orderWithCard: '💳 Ushbu buyurtma uchun kurer kartasiga to\'lov qilasiz.\nKurer yetkazganda karta raqamini ko\'rsatadi.'
  },
  
  ru: {
    selectMethod: '💳 *Выберите способ оплаты:*\n\nКак вы хотите оплатить?',
    
    cashSelected: '✅ *Наличные выбраны*\n\nВы оплатите курьеру при доставке наличными.',
    
    cardSelected: `✅ *Оплата картой выбрана*

📱 При доставке переведите деньги на *карту курьера* через Click или Payme.

🔢 Курьер покажет вам номер своей карты.

💡 *Что нужно сделать:*
1. Откройте Click или Payme
2. Переведите на карту курьера
3. Покажите чек (screenshot)
4. Курьер подтвердит и отдаст заказ

Продолжаем?`,
    
    orderWithCard: '💳 Для этого заказа вы оплатите на карту курьера.\nПри доставке курьер покажет номер карты.'
  }
};

module.exports = { PAYMENT_MESSAGES };
