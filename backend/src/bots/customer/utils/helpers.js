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
 * Validate phone number
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[0-9]{9,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

module.exports = {
  formatPrice,
  formatDateTime,
  isValidPhone
};
