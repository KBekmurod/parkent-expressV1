const MESSAGES = {
  uz: {
    welcome: (name) => `👋 Salom, ${name}!\n\n🍽️ *Parkent Express* Vendor Botga xush kelibsiz!\n\nBu bot orqali siz:\n✅ Buyurtmalarni boshqarishingiz\n✅ Menyuni tahrirlashingiz\n✅ Statistikani ko'rishingiz mumkin.`,
    
    welcomeBack: (name) => `👋 Qaytganingizdan xursandmiz, ${name}!`,
    
    notRegistered: `❌ Siz hali ro'yxatdan o'tmagansiz.\n\n📝 Ro'yxatdan o'tish uchun quyidagi ma'lumotlarni taqdim eting.`,
    
    requestPhone: `📱 Davom etish uchun telefon raqamingizni yuboring:`,
    
    phoneReceived: `✅ Telefon raqamingiz qabul qilindi!`,
    
    requestLocation: `📍 Restoran/oshxona joylashuvini yuboring:`,
    
    locationReceived: `✅ Joylashuv qabul qilindi!`,
    
    requestBusinessName: `🏪 Restoran/oshxona nomini kiriting:`,
    
    requestCategory: `🍽️ Kategoriyani tanlang:`,
    
    requestDescription: `📝 Qisqacha ta'rif kiriting (ixtiyoriy):\n\n_Yoki "O'tkazib yuborish" yuboring._`,
    
    requestWorkingHours: `⏰ Ish vaqtini kiriting (masalan: 09:00-22:00):`,
    
    invalidWorkingHours: `❌ Noto'g'ri format! Iltimos, "09:00-22:00" formatida kiriting.`,
    
    registrationComplete: `✅ *Ro'yxatdan o'tish muvaffaqiyatli!*\n\nSizning arizangiz ko'rib chiqilmoqda. Tasdiqlangandan so'ng xabar beramiz.`,
    
    registrationPending: `⏳ Sizning arizangiz hali ko'rib chiqilmoqda.\n\nIltimos, admin javobini kuting.`,
    
    registrationApproved: `🎉 *Tabriklaymiz! Arizangiz tasdiqlandi!*\n\n✅ Restoran endi faol. Menyuni sozlab, buyurtmalarni qabul qila boshlashingiz mumkin.\n\n/start bosing.`,
    
    registrationRejected: (reason) => `❌ *Arizangiz rad etildi.*\n\nSabab: ${reason}\n\nQo'shimcha ma'lumot uchun admin bilan bog'laning.`,
    
    accountBlocked: `🚫 Sizning hisobingiz bloklangan.\n\nQo'shimcha ma'lumot uchun admin bilan bog'laning.`,
    
    accountClosed: `🔒 Sizning hisobingiz yopilgan.`,
    
    // Order messages
    newOrder: (orderNumber, total, items) => {
      let msg = `🔔 *Yangi buyurtma!*\n\n`;
      msg += `📦 Buyurtma: *${orderNumber}*\n`;
      msg += `💰 Jami: *${total} so'm*\n\n`;
      msg += `📋 Mahsulotlar:\n`;
      items.forEach((item, i) => {
        msg += `${i + 1}. ${item.name} x${item.quantity}\n`;
      });
      return msg;
    },
    
    orderAccepted: (orderNumber) => `✅ Buyurtma *${orderNumber}* qabul qilindi!`,
    
    orderRejected: (orderNumber) => `❌ Buyurtma *${orderNumber}* rad etildi.`,
    
    orderPreparing: (orderNumber) => `👨‍🍳 Buyurtma *${orderNumber}* tayyorlanmoqda...`,
    
    orderReady: (orderNumber) => `✅ Buyurtma *${orderNumber}* tayyor!`,
    
    selectRejectReason: `❌ Rad etish sababini tanlang:`,
    
    enterCustomReason: `✏️ Rad etish sababini kiriting:`,
    
    noActiveOrders: `📭 Faol buyurtmalar yo'q`,
    
    noOrderHistory: `📭 Buyurtmalar tarixi bo'sh`,
    
    // Menu messages
    menuEmpty: `🍽️ Menyu bo'sh\n\nMahsulot qo'shish uchun "➕ Mahsulot qo'shish" tugmasini bosing.`,
    
    selectProduct: `🍽️ Mahsulotni tanlang:`,
    
    productAdded: (name) => `✅ Mahsulot qo'shildi: *${name}*`,
    
    productUpdated: (name) => `✅ Mahsulot yangilandi: *${name}*`,
    
    productToggled: (name, available) => `✅ Mahsulot *${name}* ${available ? 'faol' : 'nofaol'} qilindi`,
    
    enterProductName: `📝 Mahsulot nomini kiriting (o'zbekcha):`,
    
    enterProductNameRu: `📝 Mahsulot nomini kiriting (ruscha, ixtiyoriy):\n\n_Yoki "O'tkazib yuborish" yuboring._`,
    
    enterProductDescription: `📝 Ta'rifni kiriting (o'zbekcha, ixtiyoriy):\n\n_Yoki "O'tkazib yuborish" yuboring._`,
    
    enterProductDescriptionRu: `📝 Ta'rifni kiriting (ruscha, ixtiyoriy):\n\n_Yoki "O'tkazib yuborish" yuboring._`,
    
    enterProductPrice: `💰 Narxini kiriting (so'mda):`,
    
    invalidPrice: `❌ Noto'g'ri narx! Faqat raqam kiriting.`,
    
    enterProductCategory: `🏷️ Kategoriyani kiriting:`,
    
    enterPreparationTime: `⏱️ Tayyorlash vaqtini kiriting (daqiqada):`,
    
    invalidTime: `❌ Noto'g'ri vaqt! Faqat raqam kiriting.`,
    
    sendProductPhoto: `📸 Mahsulot rasmini yuboring:\n\n_Yoki "O'tkazib yuborish" yuboring._`,
    
    photoReceived: `✅ Rasm qabul qilindi!`,
    
    // Profile messages
    profileInfo: (vendor) => {
      let msg = `👤 *Profil*\n\n`;
      msg += `🏪 Nom: ${vendor.name}\n`;
      msg += `📱 Telefon: ${vendor.phone}\n`;
      msg += `📍 Manzil: ${vendor.address}\n`;
      msg += `🏷️ Kategoriya: ${vendor.category}\n`;
      msg += `⏰ Ish vaqti: ${vendor.workingHours.start} - ${vendor.workingHours.end}\n`;
      msg += `⭐ Reyting: ${(vendor.rating || 0).toFixed(1)}/5.0\n`;
      msg += `📦 Jami buyurtmalar: ${vendor.totalOrders}\n`;
      msg += `💰 Balans: ${vendor.balance} so'm\n`;
      msg += `🔄 Holat: ${vendor.isOpen ? '🟢 Ochiq' : '🔴 Yopiq'}`;
      return msg;
    },
    
    vendorOpened: `🟢 Restoran ochiq qilindi!`,
    
    vendorClosed: `🔴 Restoran yopiq qilindi!`,
    
    // Stats messages
    statsTitle: `📊 *Statistika*`,
    
    noStatsYet: `📊 Hozircha statistika yo'q`,
    
    todayStats: (orders, earnings) => {
      let msg = `📅 *Bugun*\n`;
      msg += `📦 Buyurtmalar: ${orders}\n`;
      msg += `💰 Daromad: ${earnings} so'm\n`;
      return msg;
    },
    
    weekStats: (orders, earnings) => {
      let msg = `📅 *Bu hafta*\n`;
      msg += `📦 Buyurtmalar: ${orders}\n`;
      msg += `💰 Daromad: ${earnings} so'm\n`;
      return msg;
    },
    
    monthStats: (orders, earnings) => {
      let msg = `📅 *Bu oy*\n`;
      msg += `📦 Buyurtmalar: ${orders}\n`;
      msg += `💰 Daromad: ${earnings} so'm\n`;
      return msg;
    },
    
    error: `❌ Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.`,
    
    cancelled: `❌ Bekor qilindi`
  },
  
  ru: {
    welcome: (name) => `👋 Привет, ${name}!\n\n🍽️ Добро пожаловать в *Parkent Express* Vendor Bot!\n\nЧерез этот бот вы можете:\n✅ Управлять заказами\n✅ Редактировать меню\n✅ Просматривать статистику.`,
    
    welcomeBack: (name) => `👋 Рады видеть вас снова, ${name}!`,
    
    notRegistered: `❌ Вы еще не зарегистрированы.\n\n📝 Для регистрации предоставьте следующую информацию.`,
    
    requestPhone: `📱 Отправьте свой номер телефона для продолжения:`,
    
    phoneReceived: `✅ Ваш номер телефона получен!`,
    
    requestLocation: `📍 Отправьте местоположение ресторана/кухни:`,
    
    locationReceived: `✅ Местоположение получено!`,
    
    requestBusinessName: `🏪 Введите название ресторана/кухни:`,
    
    requestCategory: `🍽️ Выберите категорию:`,
    
    requestDescription: `📝 Введите краткое описание (необязательно):\n\n_Или отправьте "Пропустить"._`,
    
    requestWorkingHours: `⏰ Введите рабочее время (например: 09:00-22:00):`,
    
    invalidWorkingHours: `❌ Неверный формат! Пожалуйста, введите в формате "09:00-22:00".`,
    
    registrationComplete: `✅ *Регистрация успешна!*\n\nВаша заявка рассматривается. Мы сообщим вам после одобрения.`,
    
    registrationPending: `⏳ Ваша заявка еще рассматривается.\n\nПожалуйста, дождитесь ответа администратора.`,
    
    accountBlocked: `🚫 Ваш аккаунт заблокирован.\n\nДля получения дополнительной информации свяжитесь с администратором.`,
    
    accountClosed: `🔒 Ваш аккаунт закрыт.`,
    
    // Order messages
    newOrder: (orderNumber, total, items) => {
      let msg = `🔔 *Новый заказ!*\n\n`;
      msg += `📦 Заказ: *${orderNumber}*\n`;
      msg += `💰 Итого: *${total} сум*\n\n`;
      msg += `📋 Товары:\n`;
      items.forEach((item, i) => {
        msg += `${i + 1}. ${item.name} x${item.quantity}\n`;
      });
      return msg;
    },
    
    orderAccepted: (orderNumber) => `✅ Заказ *${orderNumber}* принят!`,
    
    orderRejected: (orderNumber) => `❌ Заказ *${orderNumber}* отклонен.`,
    
    orderPreparing: (orderNumber) => `👨‍🍳 Заказ *${orderNumber}* готовится...`,
    
    orderReady: (orderNumber) => `✅ Заказ *${orderNumber}* готов!`,
    
    selectRejectReason: `❌ Выберите причину отклонения:`,
    
    enterCustomReason: `✏️ Введите причину отклонения:`,
    
    noActiveOrders: `📭 Нет активных заказов`,
    
    noOrderHistory: `📭 История заказов пуста`,
    
    // Menu messages
    menuEmpty: `🍽️ Меню пусто\n\nНажмите "➕ Добавить товар" чтобы добавить товар.`,
    
    selectProduct: `🍽️ Выберите товар:`,
    
    productAdded: (name) => `✅ Товар добавлен: *${name}*`,
    
    productUpdated: (name) => `✅ Товар обновлен: *${name}*`,
    
    productToggled: (name, available) => `✅ Товар *${name}* ${available ? 'активен' : 'неактивен'}`,
    
    enterProductName: `📝 Введите название товара (на узбекском):`,
    
    enterProductNameRu: `📝 Введите название товара (на русском, необязательно):\n\n_Или отправьте "Пропустить"._`,
    
    enterProductDescription: `📝 Введите описание (на узбекском, необязательно):\n\n_Или отправьте "Пропустить"._`,
    
    enterProductDescriptionRu: `📝 Введите описание (на русском, необязательно):\n\n_Или отправьте "Пропустить"._`,
    
    enterProductPrice: `💰 Введите цену (в сумах):`,
    
    invalidPrice: `❌ Неверная цена! Введите только число.`,
    
    enterProductCategory: `🏷️ Введите категорию:`,
    
    enterPreparationTime: `⏱️ Введите время приготовления (в минутах):`,
    
    invalidTime: `❌ Неверное время! Введите только число.`,
    
    sendProductPhoto: `📸 Отправьте фото товара:\n\n_Или отправьте "Пропустить"._`,
    
    photoReceived: `✅ Фото получено!`,
    
    // Profile messages
    profileInfo: (vendor) => {
      let msg = `👤 *Профиль*\n\n`;
      msg += `🏪 Название: ${vendor.name}\n`;
      msg += `📱 Телефон: ${vendor.phone}\n`;
      msg += `📍 Адрес: ${vendor.address}\n`;
      msg += `🏷️ Категория: ${vendor.category}\n`;
      msg += `⏰ Рабочее время: ${vendor.workingHours.start} - ${vendor.workingHours.end}\n`;
      msg += `⭐ Рейтинг: ${(vendor.rating || 0).toFixed(1)}/5.0\n`;
      msg += `📦 Всего заказов: ${vendor.totalOrders}\n`;
      msg += `💰 Баланс: ${vendor.balance} сум\n`;
      msg += `🔄 Статус: ${vendor.isOpen ? '🟢 Открыт' : '🔴 Закрыт'}`;
      return msg;
    },
    
    vendorOpened: `🟢 Ресторан открыт!`,
    
    vendorClosed: `🔴 Ресторан закрыт!`,
    
    // Stats messages
    statsTitle: `📊 *Статистика*`,
    
    noStatsYet: `📊 Пока нет статистики`,
    
    todayStats: (orders, earnings) => {
      let msg = `📅 *Сегодня*\n`;
      msg += `📦 Заказы: ${orders}\n`;
      msg += `💰 Доход: ${earnings} сум\n`;
      return msg;
    },
    
    weekStats: (orders, earnings) => {
      let msg = `📅 *На этой неделе*\n`;
      msg += `📦 Заказы: ${orders}\n`;
      msg += `💰 Доход: ${earnings} сум\n`;
      return msg;
    },
    
    monthStats: (orders, earnings) => {
      let msg = `📅 *В этом месяце*\n`;
      msg += `📦 Заказы: ${orders}\n`;
      msg += `💰 Доход: ${earnings} сум\n`;
      return msg;
    },
    
    error: `❌ Произошла ошибка. Пожалуйста, попробуйте снова.`,
    
    cancelled: `❌ Отменено`
  }
};

module.exports = {
  MESSAGES
};
