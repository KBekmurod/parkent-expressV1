const MESSAGES = {
  uz: {
    welcome: (name) => `👋 Salom, ${name}!\n\n🍽️ *Parkent Express*ga xush kelibsiz!\n\nBiz orqali siz sevimli restoranlardaning taomlarini tez va qulay buyurtma qilishingiz mumkin.`,
    
    welcomeBack: (name) => `👋 Qaytganingizdan xursandmiz, ${name}!`,
    
    requestPhone: '📱 Davom etish uchun telefon raqamingizni yuboring:',
    
    phoneReceived: '✅ Telefon raqamingiz qabul qilindi!\n\n🍽️ Endi restoran tanlashingiz mumkin.',
    
    selectVendor: '🍽️ Restoranni tanlang:',
    
    noVendors: '😔 Hozirda faol restoranlar yo\'q',
    
    noProducts: '😔 Bu restoranda mahsulotlar yo\'q',
    
    emptyCart: '🛒 Savatingiz bo\'sh\n\nAvval mahsulot qo\'shing!',
    
    cartCleared: '🗑️ Savat tozalandi',
    
    selectAddress: '📍 Yetkazib berish manzilini tanlang:',
    
    requestLocation: '📍 Yetkazib berish manzilini yuboring:',
    
    requestAddressTitle: '✏️ Manzil nomini kiriting (masalan: "Uy", "Ish"):',
    
    error: '❌ Xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.'
  },
  
  ru: {
    welcome: (name) => `👋 Привет, ${name}!\n\n🍽️ Добро пожаловать в *Parkent Express*!\n\nЧерез нас вы можете быстро и удобно заказать блюда из любимых ресторанов.`,
    
    welcomeBack: (name) => `👋 Рады видеть вас снова, ${name}!`,
    
    requestPhone: '📱 Отправьте свой номер телефона для продолжения:',
    
    phoneReceived: '✅ Ваш номер телефона получен!\n\n🍽️ Теперь можете выбрать ресторан.',
    
    selectVendor: '🍽️ Выберите ресторан:',
    
    noVendors: '😔 Сейчас нет активных ресторанов',
    
    noProducts: '😔 В этом ресторане нет товаров',
    
    emptyCart: '🛒 Ваша корзина пуста\n\nСначала добавьте товары!',
    
    cartCleared: '🗑️ Корзина очищена',
    
    selectAddress: '📍 Выберите адрес доставки:',
    
    requestLocation: '📍 Отправьте адрес доставки:',
    
    requestAddressTitle: '✏️ Введите название адреса (например: "Дом", "Работа"):',
    
    error: '❌ Произошла ошибка. Пожалуйста, попробуйте снова.'
  }
};

module.exports = {
  MESSAGES
};
