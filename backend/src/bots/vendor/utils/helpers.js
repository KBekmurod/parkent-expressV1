/**
 * Format price with currency
 */
const formatPrice = (price) => {
  return `${price.toLocaleString('uz-UZ')} so'm`;
};

/**
 * Format date and time
 */
const formatDateTime = (date) => {
  return new Date(date).toLocaleString('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format time only
 */
const formatTime = (date) => {
  return new Date(date).toLocaleString('uz-UZ', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Validate phone number
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[0-9]{9,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate working hours format (HH:MM-HH:MM)
 */
const isValidWorkingHours = (hours) => {
  const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(hours);
};

/**
 * Parse working hours string to start and end
 */
const parseWorkingHours = (hours) => {
  const parts = hours.split('-');
  return {
    start: parts[0].trim(),
    end: parts[1].trim()
  };
};

/**
 * Get order status emoji and text
 */
const getOrderStatusText = (status, lang = 'uz') => {
  const statusTexts = {
    uz: {
      pending: '⏳ Kutilmoqda',
      accepted: '✅ Qabul qilindi',
      preparing: '👨‍🍳 Tayyorlanmoqda',
      ready: '✅ Tayyor',
      assigned: '🚗 Haydovchi tayinlandi',
      picked_up: '📦 Olindi',
      on_the_way: "🛵 Yo'lda",
      delivered: '✅ Yetkazildi',
      cancelled: '❌ Bekor qilindi',
      rejected: '❌ Rad etildi'
    },
    ru: {
      pending: '⏳ Ожидание',
      accepted: '✅ Принят',
      preparing: '👨‍🍳 Готовится',
      ready: '✅ Готов',
      assigned: '🚗 Водитель назначен',
      picked_up: '📦 Забран',
      on_the_way: '🛵 В пути',
      delivered: '✅ Доставлен',
      cancelled: '❌ Отменен',
      rejected: '❌ Отклонен'
    }
  };

  return statusTexts[lang][status] || status;
};

/**
 * Get vendor status text
 */
const getVendorStatusText = (status, lang = 'uz') => {
  const statusTexts = {
    uz: {
      pending: '⏳ Kutilmoqda',
      active: '✅ Faol',
      blocked: '🚫 Bloklangan',
      closed: '🔒 Yopilgan'
    },
    ru: {
      pending: '⏳ Ожидание',
      active: '✅ Активен',
      blocked: '🚫 Заблокирован',
      closed: '🔒 Закрыт'
    }
  };

  return statusTexts[lang][status] || status;
};

/**
 * Truncate text to specified length
 */
const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Calculate time ago
 */
const timeAgo = (date, lang = 'uz') => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  const intervals = {
    uz: {
      year: { value: 31536000, label: 'yil' },
      month: { value: 2592000, label: 'oy' },
      week: { value: 604800, label: 'hafta' },
      day: { value: 86400, label: 'kun' },
      hour: { value: 3600, label: 'soat' },
      minute: { value: 60, label: 'daqiqa' },
      second: { value: 1, label: 'soniya' }
    },
    ru: {
      year: { value: 31536000, label: 'год' },
      month: { value: 2592000, label: 'месяц' },
      week: { value: 604800, label: 'неделя' },
      day: { value: 86400, label: 'день' },
      hour: { value: 3600, label: 'час' },
      minute: { value: 60, label: 'минута' },
      second: { value: 1, label: 'секунда' }
    }
  };

  for (const [key, interval] of Object.entries(intervals[lang])) {
    const count = Math.floor(seconds / interval.value);
    if (count >= 1) {
      return `${count} ${interval.label} ${lang === 'uz' ? 'oldin' : 'назад'}`;
    }
  }
  
  return lang === 'uz' ? 'Hozir' : 'Только что';
};

module.exports = {
  formatPrice,
  formatDateTime,
  formatTime,
  isValidPhone,
  isValidWorkingHours,
  parseWorkingHours,
  getOrderStatusText,
  getVendorStatusText,
  truncateText,
  timeAgo
};
