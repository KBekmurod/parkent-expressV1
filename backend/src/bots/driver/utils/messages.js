const MESSAGES = {
  uz: {
    welcome: (name) => `👋 Salom, ${name}!\n\n🚗 *Parkent Express* Kurier Botiga xush kelibsiz!\n\nYetkazib beruvchi sifatida ro'yxatdan o'tish uchun ma'lumotlaringizni yuboring.`,
    
    welcomeBack: (name) => `👋 Qaytganingizdan xursandmiz, ${name}!`,
    
    notRegistered: '📝 Siz hali ro\'yxatdan o\'tmagansiz.\n\nKurier sifatida ishlash uchun ro\'yxatdan o\'ting.',
    
    requestPhone: '📱 Telefon raqamingizni yuboring:',
    
    phoneReceived: '✅ Telefon raqamingiz qabul qilindi!\n\n🚗 Transport turi haqida ma\'lumot bering:',
    
    requestVehicleType: '🚗 Transport turini tanlang:',
    
    requestVehicleModel: '🚙 Transport modelini kiriting (masalan: "Nexia 3", "Cobalt"):',
    
    requestPlateNumber: '🔢 Avtomobil raqamini kiriting (masalan: "01 A 123 BC"):',
    
    requestLicensePhoto: '📄 Haydovchilik guvohnomasi rasmini yuboring:',
    
    requestVehiclePhoto: '📸 Transport vositasi rasmini yuboring:',
    
    registrationComplete: '✅ Ro\'yxatdan o\'tish yakunlandi!\n\n⏳ Arizangiz ko\'rib chiqilmoqda. Admin tasdiqlashini kuting.\n\nTasdiqlangandan so\'ng sizga xabar beramiz.',
    
    registrationPending: '⏳ Arizangiz ko\'rib chiqilmoqda.\n\nIltimos, admin tasdiqlashini kuting.',
    
    registrationApproved: '🎉 Tabriklaymiz! Arizangiz tasdiqlandi!\n\n✅ Endi siz buyurtmalarni qabul qilishingiz mumkin.\n\n📍 Online rejimga o\'tish uchun "🔄 Online" tugmasini bosing.',
    
    registrationRejected: (reason) => `❌ Arizangiz rad etildi.\n\nSabab: ${reason}\n\nIltimos, admin bilan bog\'laning.`,
    
    accountBlocked: '🚫 Hisobingiz bloklangan.\n\nAdmin bilan bog\'laning.',
    
    accountClosed: '🚫 Hisobingiz yopilgan.\n\nAdmin bilan bog\'laning.',
    
    nowOnline: '✅ Siz online rejimdasiz!\n\n📦 Buyurtmalarni qabul qilishingiz mumkin.',
    
    nowOffline: '⏸️ Siz offline rejimdasiz.\n\n🚫 Buyurtmalarni qabul qila olmaysiz.',
    
    newOrderAssigned: (orderNumber) => `🆕 Yangi buyurtma tayinlandi!\n\n📦 Buyurtma: *${orderNumber}*`,
    
    noActiveOrders: '📦 Faol buyurtmalar yo\'q',
    
    noOrderHistory: '📋 Buyurtmalar tarixi bo\'sh',
    
    orderAccepted: '✅ Buyurtma qabul qilindi!\n\n📍 Restoranga yo\'nalish oling.',
    
    orderPickedUp: '✅ Buyurtma olindi!\n\n🚗 Mijozga yetkazib bering.',
    
    orderOnTheWay: '🚗 Yo\'ldasiz!\n\n📍 Mijoz manziliga yo\'nalish oling.',
    
    orderDelivered: '✅ Buyurtma yetkazildi!\n\n⭐ Daromadingiz hisobga qo\'shildi.',
    
    orderCancelled: '❌ Buyurtma bekor qilindi.',
    
    locationTrackingStarted: '📍 Joylashuvni kuzatish boshlandi!\n\n🔄 Joylashuvingiz avtomatik yangilanadi.',
    
    locationTrackingStopped: '📍 Joylashuvni kuzatish to\'xtatildi.',
    
    shareLocation: '📍 Joylashuvingizni yuboring:',
    
    earningsDaily: (amount, count) => `💰 *Bugungi daromad*\n\n💵 Summa: *${amount} so\'m*\n📦 Buyurtmalar: *${count} ta*`,
    
    earningsWeekly: (amount, count) => `💰 *Haftalik daromad*\n\n💵 Summa: *${amount} so\'m*\n📦 Buyurtmalar: *${count} ta*`,
    
    earningsMonthly: (amount, count) => `💰 *Oylik daromad*\n\n💵 Summa: *${amount} so\'m*\n📦 Buyurtmalar: *${count} ta*`,
    
    noEarnings: '💰 Hozircha daromad yo\'q',
    
    payoutRequested: '✅ To\'lov so\'rovi yuborildi!\n\n⏳ Admin tomonidan ko\'rib chiqiladi.',
    
    profileInfo: (driver) => {
      let message = `👤 *Profil*\n\n`;
      message += `📛 Ism: ${driver.firstName} ${driver.lastName || ''}\n`;
      message += `📱 Telefon: ${driver.phone}\n`;
      message += `🚗 Transport: ${driver.vehicleType} ${driver.vehicleModel}\n`;
      message += `🔢 Raqam: ${driver.plateNumber}\n`;
      message += `⭐ Reyting: ${driver.rating?.toFixed(1) || 'N/A'}\n`;
      message += `📦 Buyurtmalar: ${driver.completedOrders || 0}\n`;
      message += `💰 Daromad: ${driver.totalEarnings || 0} so\'m`;
      return message;
    },
    
    settingsMenu: '⚙️ Sozlamalar:',
    
    languageChanged: '✅ Til o\'zgartirildi!',
    
    enterCustomReason: '✏️ Rad etish sababini kiriting:',
    
    error: '❌ Xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.'
  },
  
  ru: {
    welcome: (name) => `👋 Привет, ${name}!\n\n🚗 Добро пожаловать в Курьерский Бот *Parkent Express*!\n\nОтправьте свои данные для регистрации в качестве курьера.`,
    
    welcomeBack: (name) => `👋 Рады видеть вас снова, ${name}!`,
    
    notRegistered: '📝 Вы еще не зарегистрированы.\n\nЗарегистрируйтесь для работы курьером.',
    
    requestPhone: '📱 Отправьте свой номер телефона:',
    
    phoneReceived: '✅ Ваш номер телефона получен!\n\n🚗 Предоставьте информацию о транспорте:',
    
    requestVehicleType: '🚗 Выберите тип транспорта:',
    
    requestVehicleModel: '🚙 Введите модель транспорта (например: "Nexia 3", "Cobalt"):',
    
    requestPlateNumber: '🔢 Введите номер автомобиля (например: "01 A 123 BC"):',
    
    requestLicensePhoto: '📄 Отправьте фото водительских прав:',
    
    requestVehiclePhoto: '📸 Отправьте фото транспортного средства:',
    
    registrationComplete: '✅ Регистрация завершена!\n\n⏳ Ваша заявка рассматривается. Ожидайте одобрения администратора.\n\nМы уведомим вас после одобрения.',
    
    registrationPending: '⏳ Ваша заявка рассматривается.\n\nПожалуйста, ожидайте одобрения администратора.',
    
    registrationApproved: '🎉 Поздравляем! Ваша заявка одобрена!\n\n✅ Теперь вы можете принимать заказы.\n\n📍 Нажмите "🔄 Онлайн", чтобы выйти в онлайн.',
    
    registrationRejected: (reason) => `❌ Ваша заявка отклонена.\n\nПричина: ${reason}\n\nПожалуйста, свяжитесь с администратором.`,
    
    accountBlocked: '🚫 Ваш аккаунт заблокирован.\n\nСвяжитесь с администратором.',
    
    accountClosed: '🚫 Ваш аккаунт закрыт.\n\nСвяжитесь с администратором.',
    
    nowOnline: '✅ Вы в онлайне!\n\n📦 Можете принимать заказы.',
    
    nowOffline: '⏸️ Вы в оффлайне.\n\n🚫 Не можете принимать заказы.',
    
    newOrderAssigned: (orderNumber) => `🆕 Назначен новый заказ!\n\n📦 Заказ: *${orderNumber}*`,
    
    noActiveOrders: '📦 Нет активных заказов',
    
    noOrderHistory: '📋 История заказов пуста',
    
    orderAccepted: '✅ Заказ принят!\n\n📍 Направляйтесь в ресторан.',
    
    orderPickedUp: '✅ Заказ получен!\n\n🚗 Доставьте клиенту.',
    
    orderOnTheWay: '🚗 В пути!\n\n📍 Направляйтесь по адресу клиента.',
    
    orderDelivered: '✅ Заказ доставлен!\n\n⭐ Доход добавлен на счет.',
    
    orderCancelled: '❌ Заказ отменен.',
    
    locationTrackingStarted: '📍 Отслеживание местоположения начато!\n\n🔄 Ваше местоположение обновляется автоматически.',
    
    locationTrackingStopped: '📍 Отслеживание местоположения остановлено.',
    
    shareLocation: '📍 Отправьте свое местоположение:',
    
    earningsDaily: (amount, count) => `💰 *Доход за сегодня*\n\n💵 Сумма: *${amount} сум*\n📦 Заказов: *${count} шт*`,
    
    earningsWeekly: (amount, count) => `💰 *Доход за неделю*\n\n💵 Сумма: *${amount} сум*\n📦 Заказов: *${count} шт*`,
    
    earningsMonthly: (amount, count) => `💰 *Доход за месяц*\n\n💵 Сумма: *${amount} сум*\n📦 Заказов: *${count} шт*`,
    
    noEarnings: '💰 Пока нет дохода',
    
    payoutRequested: '✅ Запрос на выплату отправлен!\n\n⏳ Будет рассмотрен администратором.',
    
    profileInfo: (driver) => {
      let message = `👤 *Профиль*\n\n`;
      message += `📛 Имя: ${driver.firstName} ${driver.lastName || ''}\n`;
      message += `📱 Телефон: ${driver.phone}\n`;
      message += `🚗 Транспорт: ${driver.vehicleType} ${driver.vehicleModel}\n`;
      message += `🔢 Номер: ${driver.plateNumber}\n`;
      message += `⭐ Рейтинг: ${driver.rating?.toFixed(1) || 'N/A'}\n`;
      message += `📦 Заказов: ${driver.completedOrders || 0}\n`;
      message += `💰 Доход: ${driver.totalEarnings || 0} сум`;
      return message;
    },
    
    settingsMenu: '⚙️ Настройки:',
    
    languageChanged: '✅ Язык изменен!',
    
    enterCustomReason: '✏️ Введите причину отказа:',
    
    error: '❌ Произошла ошибка. Пожалуйста, попробуйте снова.'
  }
};

module.exports = {
  MESSAGES
};
