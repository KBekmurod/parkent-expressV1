/**
 * Format price with currency
 */
const formatPrice = (price) => {
  return `${price.toLocaleString('en-US')} so'm`;
};

/**
 * Format date and time
 */
const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
};

/**
 * Get order status text
 */
const getOrderStatusText = (status, language = 'uz') => {
  const statusTexts = {
    uz: {
      pending: '⏳ Kutilmoqda',
      accepted: '✅ Qabul qilindi',
      preparing: '👨‍🍳 Tayyorlanmoqda',
      ready: '✅ Tayyor',
      picked_up: '🚗 Olingan',
      on_the_way: '🚚 Yo\'lda',
      delivered: '✅ Yetkazildi',
      cancelled: '❌ Bekor qilindi',
      rejected: '🚫 Rad etildi'
    },
    ru: {
      pending: '⏳ Ожидает',
      accepted: '✅ Принят',
      preparing: '👨‍🍳 Готовится',
      ready: '✅ Готов',
      picked_up: '🚗 Получен',
      on_the_way: '🚚 В пути',
      delivered: '✅ Доставлен',
      cancelled: '❌ Отменен',
      rejected: '🚫 Отклонен'
    }
  };

  return statusTexts[language]?.[status] || status;
};

/**
 * Get driver status text
 */
const getDriverStatusText = (status, language = 'uz') => {
  const statusTexts = {
    uz: {
      pending: '⏳ Kutilmoqda',
      active: '✅ Faol',
      blocked: '🚫 Bloklangan',
      offline: '⏸️ Offline',
      online: '🔄 Online'
    },
    ru: {
      pending: '⏳ Ожидает',
      active: '✅ Активен',
      blocked: '🚫 Заблокирован',
      offline: '⏸️ Оффлайн',
      online: '🔄 Онлайн'
    }
  };

  return statusTexts[language]?.[status] || status;
};

/**
 * Get vehicle type text
 */
const getVehicleTypeText = (type, language = 'uz') => {
  const typeTexts = {
    uz: {
      car: '🚗 Avtomobil',
      motorcycle: '🏍️ Mototsikl',
      bicycle: '🚴 Velosiped'
    },
    ru: {
      car: '🚗 Автомобиль',
      motorcycle: '🏍️ Мотоцикл',
      bicycle: '🚴 Велосипед'
    }
  };

  return typeTexts[language]?.[type] || type;
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d; // Distance in km
};

/**
 * Convert degrees to radians
 */
const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Format distance
 */
const formatDistance = (distanceInKm) => {
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)} m`;
  }
  return `${distanceInKm.toFixed(1)} km`;
};

/**
 * Validate phone number
 */
const validatePhoneNumber = (phone) => {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check if phone has valid length (9-15 digits)
  if (cleanPhone.length < 9 || cleanPhone.length > 15) {
    return false;
  }
  
  return true;
};

/**
 * Validate plate number
 */
const validatePlateNumber = (plateNumber) => {
  // Basic validation: should contain letters and numbers
  const hasLetters = /[A-Za-z]/.test(plateNumber);
  const hasNumbers = /[0-9]/.test(plateNumber);
  
  return hasLetters && hasNumbers && plateNumber.length >= 5;
};

/**
 * Get earnings period dates
 */
const getEarningsPeriod = (period) => {
  const now = new Date();
  let startDate, endDate;

  switch (period) {
    case 'daily':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    
    case 'weekly':
      const dayOfWeek = now.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday is first day
      startDate = new Date(now);
      startDate.setDate(now.getDate() - diff);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
    
    case 'monthly':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      break;
    
    default:
      startDate = new Date(0);
      endDate = new Date();
  }

  return { startDate, endDate };
};

module.exports = {
  formatPrice,
  formatDateTime,
  getOrderStatusText,
  getDriverStatusText,
  getVehicleTypeText,
  calculateDistance,
  formatDistance,
  validatePhoneNumber,
  validatePlateNumber,
  getEarningsPeriod
};
